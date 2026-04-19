export function initializeMachineStatusScript(): void {
	const EVENT_TYPES = new Set(['vm', 'bm']);
	const EVENT_STATUSES = new Set(['reserved', 'deleted']);
	const HOME_SIGNAL_ID = 'ha-machine-status-signal';
	const LIVE_REGION_ID = 'ha-machine-status-live-region';
	const RETRY_BASE_DELAY_MS = 1000;
	const RETRY_MAX_DELAY_MS = 15_000;
	const HOME_SIGNAL_DURATION_MS = 4200;

	type MachineType = 'vm' | 'bm';
	type MachineStatus = 'reserved' | 'deleted';

	interface MachineStatusEvent {
		gpuCount?: number;
		status: MachineStatus;
		type: MachineType;
	}

	let reconnectTimeoutId = 0;
	let reconnectAttempts = 0;
	let activeSocket: WebSocket | null = null;
	let homeSignalResetTimeoutId = 0;

	const setup = () => {
		const documentRoot = document;
		const body = document.body;
		if (!body) {
			return;
		}

		const liveRegion = ensureLiveRegion(documentRoot, body);
		const homeSignal = ensureHomeSignal(documentRoot, body);

		connect({
			homeSignal,
			liveRegion,
		});
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', setup, { once: true });
		return;
	}

	setup();

	window.addEventListener('beforeunload', () => {
		if (activeSocket) {
			activeSocket.close();
		}

		if (reconnectTimeoutId) {
			window.clearTimeout(reconnectTimeoutId);
		}
	});

	function connect({
		homeSignal,
		liveRegion,
	}: {
		homeSignal: HTMLDivElement;
		liveRegion: HTMLDivElement;
	}) {
		if (!('WebSocket' in window)) {
			return;
		}

		const socketUrl = `wss://${window.location.host}/ws`;
		const socket = new WebSocket(socketUrl);
		activeSocket = socket;

		socket.addEventListener('open', () => {
			reconnectAttempts = 0;
		});

		socket.addEventListener('message', (messageEvent) => {
			const machineEvent = parseMachineEvent(messageEvent.data);
			if (!machineEvent) {
				return;
			}

			announceEvent(liveRegion, machineEvent);
			activateHomeSignal(homeSignal, machineEvent);
		});

		socket.addEventListener('error', () => {
			socket.close();
		});

		socket.addEventListener('close', () => {
			if (activeSocket === socket) {
				activeSocket = null;
			}

			scheduleReconnect(() => {
				connect({ homeSignal, liveRegion });
			});
		});
	}

	function scheduleReconnect(reconnect: () => void) {
		if (reconnectTimeoutId) {
			window.clearTimeout(reconnectTimeoutId);
		}

		const retryDelay = Math.min(
			RETRY_BASE_DELAY_MS * 2 ** reconnectAttempts,
			RETRY_MAX_DELAY_MS
		);
		reconnectAttempts += 1;
		reconnectTimeoutId = window.setTimeout(reconnect, retryDelay);
	}

	function ensureLiveRegion(documentRoot: Document, body: HTMLElement): HTMLDivElement {
		const existingLiveRegion = documentRoot.getElementById(LIVE_REGION_ID);
		if (existingLiveRegion instanceof HTMLDivElement) {
			return existingLiveRegion;
		}

		const liveRegion = documentRoot.createElement('div');
		liveRegion.className = 'ha-visually-hidden';
		liveRegion.id = LIVE_REGION_ID;
		liveRegion.setAttribute('aria-atomic', 'true');
		liveRegion.setAttribute('aria-live', 'polite');
		body.append(liveRegion);

		return liveRegion;
	}

	function ensureHomeSignal(documentRoot: Document, body: HTMLElement): HTMLDivElement {
		const existingSignal = documentRoot.getElementById(HOME_SIGNAL_ID);
		if (existingSignal instanceof HTMLDivElement) {
			return existingSignal;
		}

		const homeSignal = documentRoot.createElement('div');
		homeSignal.className = 'ha-machine-home-signal';
		homeSignal.id = HOME_SIGNAL_ID;
		homeSignal.setAttribute('aria-hidden', 'true');
		body.append(homeSignal);

		return homeSignal;
	}

	function parseMachineEvent(payload: unknown): MachineStatusEvent | null {
		let parsedPayload: unknown = payload;

		if (typeof payload === 'string') {
			try {
				parsedPayload = JSON.parse(payload);
			} catch {
				return null;
			}
		}

		if (typeof parsedPayload !== 'object' || parsedPayload === null) {
			return null;
		}

		const { gpuCount, status, type } = parsedPayload as Record<string, unknown>;
		if (typeof status !== 'string' || typeof type !== 'string') {
			return null;
		}

		const normalizedStatus = status.trim().toLowerCase();
		const normalizedType = type.trim().toLowerCase();
		const normalizedGpuCount =
			typeof gpuCount === 'number' && Number.isInteger(gpuCount) && gpuCount > 0
				? gpuCount
				: undefined;

		if (!(EVENT_STATUSES.has(normalizedStatus) && EVENT_TYPES.has(normalizedType))) {
			return null;
		}

		if (normalizedType === 'vm' && normalizedGpuCount === undefined) {
			return null;
		}

		return {
			gpuCount: normalizedGpuCount,
			status: normalizedStatus as MachineStatus,
			type: normalizedType as MachineType,
		};
	}

	function announceEvent(liveRegion: HTMLDivElement, machineEvent: MachineStatusEvent) {
		liveRegion.textContent = `${formatDisplayLabel(machineEvent)} ${machineEvent.status}`;
	}

	function activateHomeSignal(homeSignal: HTMLDivElement, machineEvent: MachineStatusEvent) {
		homeSignal.className = 'ha-machine-home-signal';
		homeSignal.dataset.status = machineEvent.status;
		homeSignal.dataset.type = machineEvent.type;

		homeSignal.innerHTML = `
			<div class="ha-machine-home-signal__glow" aria-hidden="true"></div>
			<div class="ha-machine-home-signal__frame">
				<div class="ha-machine-home-signal__eyebrow">Live Capacity Signal</div>
				<div class="ha-machine-home-signal__title">${escapeHtml(formatDisplayLabel(machineEvent))}</div>
				<div class="ha-machine-home-signal__meta">
					<span>${escapeHtml(machineEvent.status)}</span>
					<span>${machineEvent.status === 'reserved' ? 'Node engaged' : 'Node released'}</span>
				</div>
			</div>
		`;

		homeSignal.classList.remove('is-active');
		homeSignal.offsetWidth;
		homeSignal.classList.add('is-active');

		if (homeSignalResetTimeoutId) {
			window.clearTimeout(homeSignalResetTimeoutId);
		}

		homeSignalResetTimeoutId = window.setTimeout(() => {
			homeSignal.classList.remove('is-active');
		}, HOME_SIGNAL_DURATION_MS);
	}

	function formatDisplayLabel(machineEvent: MachineStatusEvent): string {
		if (machineEvent.type === 'bm') {
			return '8x bare metal';
		}

		return `${machineEvent.gpuCount ?? 0}x GPU VM`;
	}

	function escapeHtml(value: string): string {
		return value
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#39;');
	}
}
