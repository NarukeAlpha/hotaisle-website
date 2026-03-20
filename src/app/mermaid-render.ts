import mermaid from 'mermaid';

const MERMAID_CODE_SELECTOR = 'pre code.language-mermaid';
const MERMAID_CONTAINER_SELECTOR = 'pre.mermaid[data-mermaid-source]';
const DARK_MODE_CLASS = 'dark';
const MERMAID_SOURCE_ATTRIBUTE = 'data-mermaid-source';
const MERMAID_PROCESSED_ATTRIBUTE = 'data-processed';

let renderTimer = 0;
let isRendering = false;

function getMermaidTheme() {
	return document.documentElement.classList.contains(DARK_MODE_CLASS) ? 'dark' : 'default';
}

function upgradeMermaidCodeBlocks(root: ParentNode): void {
	for (const codeElement of root.querySelectorAll<HTMLElement>(MERMAID_CODE_SELECTOR)) {
		const preElement = codeElement.parentElement;
		const diagramDefinition = codeElement.textContent?.trim();
		if (!(preElement instanceof HTMLPreElement && diagramDefinition)) {
			continue;
		}

		if (preElement.matches(MERMAID_CONTAINER_SELECTOR)) {
			continue;
		}

		const mermaidElement = document.createElement('pre');
		mermaidElement.className = 'mermaid';
		mermaidElement.setAttribute(MERMAID_SOURCE_ATTRIBUTE, diagramDefinition);
		mermaidElement.textContent = diagramDefinition;
		preElement.replaceWith(mermaidElement);
	}
}

function resetRenderedMermaidBlocks(): HTMLPreElement[] {
	const mermaidElements = Array.from(
		document.querySelectorAll<HTMLPreElement>(MERMAID_CONTAINER_SELECTOR)
	);

	for (const mermaidElement of mermaidElements) {
		const diagramDefinition = mermaidElement.getAttribute(MERMAID_SOURCE_ATTRIBUTE)?.trim();
		if (!diagramDefinition) {
			continue;
		}

		mermaidElement.removeAttribute(MERMAID_PROCESSED_ATTRIBUTE);
		mermaidElement.textContent = diagramDefinition;
	}

	return mermaidElements;
}

async function renderMermaidDiagrams(): Promise<void> {
	if (isRendering) {
		return;
	}

	isRendering = true;

	try {
		upgradeMermaidCodeBlocks(document);
		const mermaidElements = resetRenderedMermaidBlocks();
		if (mermaidElements.length === 0) {
			return;
		}

		mermaid.initialize({
			startOnLoad: false,
			securityLevel: 'strict',
			theme: getMermaidTheme(),
		});
		await mermaid.run({
			nodes: mermaidElements,
			suppressErrors: true,
		});
	} finally {
		isRendering = false;
	}
}

function scheduleRender(): void {
	if (renderTimer) {
		window.clearTimeout(renderTimer);
	}

	renderTimer = window.setTimeout(() => {
		renderTimer = 0;
		renderMermaidDiagrams().catch((error: unknown) => {
			console.error('Failed to render Mermaid diagrams.', error);
		});
	}, 0);
}

function hasMermaidNode(node: Node): boolean {
	if (!(node instanceof Element)) {
		return false;
	}

	return Boolean(
		node.matches(MERMAID_CODE_SELECTOR) ||
			node.matches(MERMAID_CONTAINER_SELECTOR) ||
			node.querySelector(MERMAID_CODE_SELECTOR) ||
			node.querySelector(MERMAID_CONTAINER_SELECTOR)
	);
}

const mutationObserver = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		if (mutation.type === 'attributes') {
			scheduleRender();
			return;
		}

		for (const node of mutation.addedNodes) {
			if (hasMermaidNode(node)) {
				scheduleRender();
				return;
			}
		}
	}
});

scheduleRender();
mutationObserver.observe(document.documentElement, {
	attributeFilter: ['class'],
	attributes: true,
});
mutationObserver.observe(document.body, {
	childList: true,
	subtree: true,
});
