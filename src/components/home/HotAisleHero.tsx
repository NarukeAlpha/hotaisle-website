import { ArrowRight, Sparkles } from 'lucide-react';
import { AppLink } from '@/components/AppLink.tsx';

const HERO_PARTICLES = Array.from({ length: 64 }, (_, index) => ({
	delay: (index % 9) * 0.35,
	duration: 5 + (index % 7),
	id: index,
	left: `${(index * 37) % 100}%`,
	size: 2 + ((index * 7) % 5),
	top: `${(index * 17) % 100}%`,
}));

const DATA_COLUMNS = [18, 28, 36, 44, 56, 68, 78, 86] as const;

function Beam({
	delay = 0,
	duration = 10,
	rotate = 0,
	top = '50%',
	width = 700,
}: {
	delay?: number;
	duration?: number;
	rotate?: number;
	top?: string;
	width?: number;
}) {
	return (
		<div
			className="ha-hero-beam absolute left-1/2 h-px"
			style={{
				animationDelay: `${delay}s, ${delay * 0.7}s`,
				animationDuration: `${duration}s, ${Math.max(duration * 0.65, 4)}s`,
				background:
					'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 10%, rgba(255,120,40,0.75) 50%, rgba(255,255,255,0) 90%, transparent 100%)',
				top,
				transform: `translateX(-50%) rotate(${rotate}deg)`,
				width,
			}}
		/>
	);
}

function OrbitRing({
	size,
	duration,
	delay = 0,
}: {
	size: number;
	duration: number;
	delay?: number;
}) {
	return (
		<div
			className="ha-hero-ring absolute top-1/2 left-1/2 rounded-full border"
			style={{
				animationDelay: `${delay}s`,
				animationDuration: `${duration}s`,
				borderColor: 'var(--ha-hero-ring-line)',
				height: size,
				marginLeft: -size / 2,
				marginTop: -size / 2,
				width: size,
			}}
		>
			<div
				className="ha-hero-ring-dot absolute top-0 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_24px_rgba(251,146,60,0.95)]"
				style={{
					animationDelay: `${delay}s`,
					background: 'var(--ha-hero-ring-dot)',
				}}
			>
				<div
					className="ha-hero-ring-trail absolute top-1/2 right-1/2 h-px -translate-y-1/2"
					style={{ background: 'var(--ha-hero-ring-trail)' }}
				/>
			</div>
		</div>
	);
}

function ParticleField() {
	return (
		<div className="absolute inset-0 overflow-hidden" data-hero-star-field>
			{HERO_PARTICLES.map((particle) => (
				<div
					className="ha-hero-particle absolute rounded-full"
					data-hero-star
					key={particle.id}
					style={{
						animationDelay: `${particle.delay}s`,
						animationDuration: `${particle.duration}s`,
						background: 'var(--ha-hero-particle)',
						height: particle.size,
						left: particle.left,
						top: particle.top,
						width: particle.size,
					}}
				/>
			))}
		</div>
	);
}

function DataColumns() {
	return (
		<div className="absolute inset-0 overflow-hidden opacity-60">
			{DATA_COLUMNS.map((position, index) => (
				<div
					className="ha-hero-column absolute bottom-0 w-px origin-bottom bg-linear-to-t from-orange-500/0 via-orange-400/70 to-orange-500/0"
					key={position}
					style={{
						animationDelay: `${index * 0.2}s`,
						animationDuration: `${3 + (index % 4)}s`,
						height: `${25 + (index % 5) * 8}%`,
						left: `${position}%`,
					}}
				/>
			))}
		</div>
	);
}

export default function HotAisleHero() {
	return (
		<div className="ha-hero-shell min-h-screen w-full overflow-hidden bg-(--ha-hero-bg) text-(--ha-hero-text)">
			<div className="relative min-h-screen">
				<div
					className="absolute inset-0"
					style={{
						background:
							'radial-gradient(circle at 50% 35%, var(--ha-hero-ambient-orange), transparent 24%), radial-gradient(circle at 20% 20%, var(--ha-hero-ambient-blue), transparent 22%), radial-gradient(circle at 80% 30%, var(--ha-hero-ambient-violet), transparent 20%), linear-gradient(180deg, var(--ha-hero-bg-top) 0%, var(--ha-hero-bg-mid) 48%, var(--ha-hero-bg-bottom) 100%)',
					}}
				/>
				<div
					className="ha-hero-grid absolute inset-0 bg-size-[64px_64px] opacity-[0.12]"
					style={{
						backgroundImage:
							'linear-gradient(var(--ha-hero-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--ha-hero-grid-line) 1px, transparent 1px)',
					}}
				/>
				<div
					className="ha-hero-scanlines absolute inset-0 bg-size-[100%_10px] opacity-20"
					style={{
						backgroundImage:
							'linear-gradient(180deg, transparent, var(--ha-hero-scanline), transparent)',
					}}
				/>

				<ParticleField />
				<DataColumns />

				<Beam delay={0} duration={9} rotate={-12} top="41%" width={920} />
				<Beam delay={1.2} duration={11} rotate={8} top="52%" width={880} />
				<Beam delay={0.5} duration={13} rotate={22} top="58%" width={760} />
				<Beam delay={1.8} duration={12} rotate={-28} top="47%" width={680} />

				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="ha-hero-orbit-shell relative h-130 w-130">
						<div
							className="absolute inset-0 rounded-full border"
							style={{
								borderColor: 'var(--ha-hero-ring-border)',
								boxShadow: '0 0 80px var(--ha-hero-ring-shadow)',
							}}
						/>
						<OrbitRing duration={28} size={500} />
						<OrbitRing delay={0.4} duration={20} size={390} />
						<OrbitRing delay={0.7} duration={14} size={290} />
					</div>

					<div
						className="ha-hero-core absolute h-48 w-48 rounded-4xl border backdrop-blur-xl"
						style={{
							background: 'var(--ha-hero-core-bg)',
							borderColor: 'var(--ha-hero-panel-border)',
							boxShadow:
								'0 0 0 1px var(--ha-hero-core-inner) inset, 0 0 80px var(--ha-hero-core-orange-glow), 0 0 160px var(--ha-hero-core-blue-glow)',
						}}
					>
						<div
							className="absolute inset-3 rounded-3xl border"
							style={{
								background:
									'radial-gradient(circle at 30% 30%, var(--ha-hero-core-highlight), transparent 24%), linear-gradient(135deg, var(--ha-hero-core-sheen-start), var(--ha-hero-core-sheen-end))',
								borderColor: 'var(--ha-hero-panel-border)',
							}}
						/>
						<div
							className="ha-hero-core-pulse absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-3xl border"
							style={{
								background: 'var(--ha-hero-core-pulse-bg)',
								borderColor: 'var(--ha-hero-core-pulse-border)',
							}}
						/>
						<div
							className="absolute inset-x-8 top-10 h-px bg-linear-to-r from-transparent to-transparent"
							style={{
								backgroundImage:
									'linear-gradient(to right, transparent, var(--ha-hero-line-soft), transparent)',
							}}
						/>
						<div
							className="absolute inset-x-8 bottom-10 h-px bg-linear-to-r from-transparent to-transparent"
							style={{
								backgroundImage:
									'linear-gradient(to right, transparent, var(--ha-hero-line-accent), transparent)',
							}}
						/>
						<div
							className="absolute inset-y-8 left-10 w-px bg-linear-to-b from-transparent to-transparent"
							style={{
								backgroundImage:
									'linear-gradient(to bottom, transparent, var(--ha-hero-line-vertical-soft), transparent)',
							}}
						/>
						<div
							className="absolute inset-y-8 right-10 w-px bg-linear-to-b from-transparent to-transparent"
							style={{
								backgroundImage:
									'linear-gradient(to bottom, transparent, var(--ha-hero-line-vertical-accent), transparent)',
							}}
						/>
					</div>
				</div>

				<div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl items-start px-5 pt-16 pb-20 sm:px-5 sm:pt-20 md:px-8 lg:px-10 lg:pt-40">
					<div className="w-full min-w-0 max-w-3xl">
						<img
							alt="Hot Aisle"
							className="animation-fade-in mb-8 h-16 w-auto object-contain sm:h-20"
							height={80}
							src="/hotaisle-logo.svg"
							width={260}
						/>

						<div
							className="animation-fade-in mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm backdrop-blur-md"
							style={{
								background: 'var(--ha-hero-panel)',
								borderColor: 'var(--ha-hero-panel-border)',
								color: 'var(--ha-hero-muted)',
							}}
						>
							<Sparkles className="h-4 w-4 text-orange-400 dark:text-orange-300" />
							AMD exclusive AI Cloud
						</div>

						<h1 className="animation-fade-in max-w-4xl font-semibold text-4xl tracking-tight sm:text-6xl xl:text-7xl">
							<span className="whitespace-nowrap">Deploy MI300X GPUs</span>
							<span
								className="block bg-clip-text text-transparent"
								style={{
									backgroundImage:
										'linear-gradient(to right, var(--ha-hero-gradient-start), var(--ha-hero-gradient-mid), var(--ha-hero-gradient-end))',
								}}
							>
								on demand.
							</span>
						</h1>

						<p
							className="animation-fade-in mt-6 max-w-2xl text-lg leading-8 sm:text-xl"
							style={{ color: 'var(--ha-hero-muted-strong)' }}
						>
							High-memory AMD exclusive GPU infrastructure without procurement drag.
							Start fast, scale when you need it, and pay clear hourly pricing instead
							of signing into long commitments.
						</p>

						<div className="animation-fade-in mt-10 flex flex-wrap items-center gap-4">
							<AppLink
								className="group inline-flex items-center gap-2 rounded-2xl bg-hot-orange px-6 py-3.5 font-medium text-sm text-white shadow-lg shadow-orange-950/30 transition hover:-translate-y-0.5 hover:bg-orange-500"
								href="/quick-start"
							>
								Start Now
								<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
							</AppLink>
							<AppLink
								className="inline-flex items-center gap-2 rounded-2xl border px-6 py-3.5 font-medium text-sm backdrop-blur transition"
								href="/pricing"
								style={{
									background: 'var(--ha-hero-panel)',
									borderColor: 'var(--ha-hero-panel-border)',
									color: 'var(--ha-hero-muted)',
								}}
							>
								See Pricing
							</AppLink>
						</div>

						<p
							className="animation-fade-in mt-6 text-sm uppercase tracking-[0.2em]"
							style={{ color: 'var(--ha-hero-muted-soft)' }}
						>
							No contracts. No commitments. No drama.
						</p>
					</div>
				</div>

				<div
					className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t to-transparent"
					style={{ ['--tw-gradient-from' as string]: 'var(--ha-hero-bg-bottom)' }}
				/>

				<style>{`
					.ha-hero-shell {
						--ha-hero-bg: #eef4ff;
						--ha-hero-bg-top: #f8fbff;
						--ha-hero-bg-mid: #eef4ff;
						--ha-hero-bg-bottom: #dbe7f7;
						--ha-hero-text: #0f172a;
						--ha-hero-muted: rgba(15, 23, 42, 0.78);
						--ha-hero-muted-strong: rgba(15, 23, 42, 0.72);
						--ha-hero-muted-soft: rgba(15, 23, 42, 0.5);
						--ha-hero-panel: rgba(255, 255, 255, 0.46);
						--ha-hero-panel-border: rgba(148, 163, 184, 0.28);
						--ha-hero-grid-line: rgba(15, 23, 42, 0.08);
						--ha-hero-scanline: rgba(255, 255, 255, 0.2);
						--ha-hero-ambient-orange: rgba(249, 115, 22, 0.18);
						--ha-hero-ambient-blue: rgba(59, 130, 246, 0.14);
						--ha-hero-ambient-violet: rgba(14, 165, 233, 0.1);
						--ha-hero-ring-border: rgba(249, 115, 22, 0.12);
						--ha-hero-ring-shadow: rgba(249, 115, 22, 0.08);
						--ha-hero-ring-line: rgba(15, 23, 42, 0.22);
						--ha-hero-ring-dot: #ea580c;
						--ha-hero-ring-trail:
							linear-gradient(to left, rgba(234, 88, 12, 0.55), rgba(234, 88, 12, 0));
						--ha-hero-particle: rgba(15, 23, 42, 0.58);
						--ha-hero-core-bg: rgba(255, 255, 255, 0.34);
						--ha-hero-core-inner: rgba(255, 255, 255, 0.35);
						--ha-hero-core-orange-glow: rgba(249, 115, 22, 0.12);
						--ha-hero-core-blue-glow: rgba(59, 130, 246, 0.1);
						--ha-hero-core-highlight: rgba(255, 255, 255, 0.55);
						--ha-hero-core-sheen-start: rgba(255, 255, 255, 0.3);
						--ha-hero-core-sheen-end: rgba(255, 255, 255, 0.08);
						--ha-hero-core-pulse-bg: rgba(249, 115, 22, 0.12);
						--ha-hero-core-pulse-border: rgba(249, 115, 22, 0.24);
						--ha-hero-line-soft: rgba(15, 23, 42, 0.22);
						--ha-hero-line-accent: rgba(249, 115, 22, 0.45);
						--ha-hero-line-vertical-soft: rgba(15, 23, 42, 0.14);
						--ha-hero-line-vertical-accent: rgba(249, 115, 22, 0.24);
						--ha-hero-gradient-start: #0f172a;
						--ha-hero-gradient-mid: #fb923c;
						--ha-hero-gradient-end: #f97316;
					}

					.dark .ha-hero-shell {
						--ha-hero-bg: #050816;
						--ha-hero-bg-top: #070b17;
						--ha-hero-bg-mid: #050816;
						--ha-hero-bg-bottom: #03050d;
						--ha-hero-text: #ffffff;
						--ha-hero-muted: rgba(255, 255, 255, 0.82);
						--ha-hero-muted-strong: rgba(255, 255, 255, 0.7);
						--ha-hero-muted-soft: rgba(255, 255, 255, 0.55);
						--ha-hero-panel: rgba(255, 255, 255, 0.05);
						--ha-hero-panel-border: rgba(255, 255, 255, 0.1);
						--ha-hero-grid-line: rgba(255, 255, 255, 0.15);
						--ha-hero-scanline: rgba(255, 255, 255, 0.03);
						--ha-hero-ambient-orange: rgba(255, 123, 0, 0.22);
						--ha-hero-ambient-blue: rgba(59, 130, 246, 0.14);
						--ha-hero-ambient-violet: rgba(139, 92, 246, 0.12);
						--ha-hero-ring-border: rgba(251, 146, 60, 0.12);
						--ha-hero-ring-shadow: rgba(249, 115, 22, 0.08);
						--ha-hero-ring-line: rgba(255, 255, 255, 0.1);
						--ha-hero-ring-dot: #fb923c;
						--ha-hero-ring-trail:
							linear-gradient(to left, rgba(251, 146, 60, 0.6), rgba(251, 146, 60, 0));
						--ha-hero-particle: rgba(255, 255, 255, 0.7);
						--ha-hero-core-bg: rgba(255, 255, 255, 0.05);
						--ha-hero-core-inner: rgba(255, 255, 255, 0.04);
						--ha-hero-core-orange-glow: rgba(249, 115, 22, 0.18);
						--ha-hero-core-blue-glow: rgba(59, 130, 246, 0.08);
						--ha-hero-core-highlight: rgba(255, 255, 255, 0.18);
						--ha-hero-core-sheen-start: rgba(255, 255, 255, 0.08);
						--ha-hero-core-sheen-end: rgba(255, 255, 255, 0.02);
						--ha-hero-core-pulse-bg: rgba(251, 146, 60, 0.1);
						--ha-hero-core-pulse-border: rgba(253, 186, 116, 0.2);
						--ha-hero-line-soft: rgba(255, 255, 255, 0.4);
						--ha-hero-line-accent: rgba(253, 186, 116, 0.5);
						--ha-hero-line-vertical-soft: rgba(255, 255, 255, 0.2);
						--ha-hero-line-vertical-accent: rgba(253, 186, 116, 0.35);
						--ha-hero-gradient-start: #ffffff;
						--ha-hero-gradient-mid: #fed7aa;
						--ha-hero-gradient-end: #fb923c;
					}

					.ha-hero-grid {
						animation: haHeroGridDrift 18s linear infinite;
					}

					.ha-hero-scanlines {
						animation: haHeroScanlines 12s linear infinite;
					}

					.ha-hero-beam {
						animation-name: haHeroBeamDrift, haHeroBeamGlow;
						animation-iteration-count: infinite, infinite;
						animation-timing-function: ease-in-out, ease-in-out;
						filter: blur(0.5px);
						transform-origin: left center;
					}

					.ha-hero-orbit-shell {
						animation: haHeroSpin 50s linear infinite;
					}

					.ha-hero-ring {
						animation-name: haHeroSpin;
						animation-iteration-count: infinite;
						animation-timing-function: linear;
					}

					.ha-hero-ring-dot {
						animation: haHeroRingPulse 2.5s ease-in-out infinite;
					}

					.ha-hero-ring-trail {
						animation: haHeroRingTrail 2.5s ease-in-out infinite;
						transform-origin: right center;
						width: 56px;
					}

					.ha-hero-particle {
						animation-name: haHeroParticleFloat;
						animation-iteration-count: infinite;
						animation-timing-function: ease-in-out;
					}

					.ha-hero-column {
						animation-name: haHeroColumnPulse;
						animation-iteration-count: infinite;
						animation-timing-function: ease-in-out;
					}

					.ha-hero-core {
						animation: haHeroCoreFloat 8s ease-in-out infinite;
					}

					.ha-hero-core-pulse {
						animation: haHeroCorePulse 3.2s ease-in-out infinite;
					}

					@keyframes haHeroBeamDrift {
						0%,
						100% {
							opacity: 0.1;
							transform: translateX(-50%) translateX(-20px) scaleX(0.8);
						}

						50% {
							opacity: 0.65;
							transform: translateX(-50%) translateX(20px) scaleX(1);
						}
					}

					@keyframes haHeroBeamGlow {
						0%,
						100% {
							filter: blur(0.5px);
						}

						50% {
							filter: blur(1.4px);
						}
					}

					@keyframes haHeroSpin {
						from {
							transform: rotate(0deg);
						}

						to {
							transform: rotate(360deg);
						}
					}

					@keyframes haHeroRingPulse {
						0%,
						100% {
							transform: translate(-50%, -50%) scale(1);
						}

						50% {
							transform: translate(-50%, -50%) scale(1.3);
						}
					}

					@keyframes haHeroRingTrail {
						0%,
						100% {
							opacity: 0.35;
							transform: translateY(-50%) scaleX(0.82);
						}

						50% {
							opacity: 0.85;
							transform: translateY(-50%) scaleX(1);
						}
					}

					@keyframes haHeroParticleFloat {
						0%,
						100% {
							opacity: 0.15;
							transform: scale(1);
						}

						50% {
							opacity: 0.8;
							transform: scale(1.2);
						}
					}

					@keyframes haHeroColumnPulse {
						0%,
						100% {
							opacity: 0.2;
							transform: scaleY(0.9);
						}

						50% {
							opacity: 0.85;
							transform: scaleY(1.08);
						}
					}

					@keyframes haHeroCoreFloat {
						0%,
						100% {
							transform: translateY(0) rotate(0deg);
						}

						25% {
							transform: translateY(-10px) rotate(6deg);
						}

						75% {
							transform: translateY(-6px) rotate(-6deg);
						}
					}

					@keyframes haHeroCorePulse {
						0%,
						100% {
							box-shadow: 0 0 30px rgba(251, 146, 60, 0.15);
							transform: translate(-50%, -50%) scale(1);
						}

						50% {
							box-shadow: 0 0 60px rgba(251, 146, 60, 0.35);
							transform: translate(-50%, -50%) scale(1.08);
						}
					}

					@keyframes haHeroGridDrift {
						from {
							background-position: 0 0, 0 0;
						}

						to {
							background-position: 0 24px, 24px 0;
						}
					}

					@keyframes haHeroScanlines {
						from {
							background-position: 0 0;
						}

						to {
							background-position: 0 80px;
						}
					}
				`}</style>
			</div>
		</div>
	);
}
