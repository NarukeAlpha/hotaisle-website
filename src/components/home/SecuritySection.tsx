export function SecuritySection() {
	return (
		<section className="border-neutral-200 border-y bg-neutral-100 py-12 dark:border-neutral-800 dark:bg-neutral-900">
			<div className="container mx-auto px-6">
				<p className="mb-8 text-center font-semibold text-neutral-500 text-sm uppercase tracking-widest">
					Trusted by Industry Leaders & Secure by Design
				</p>
				<div className="flex flex-wrap items-center justify-center gap-12 opacity-80 grayscale transition-all duration-500 hover:grayscale-0 md:gap-24">
					{/*
                        Use a white background container for logos to ensure they look good in dark mode
                        if they are typical corporate JPGs with white backgrounds.
                        We'll make them 'cards' or just a strip if they are transparent.
                        User said "they are jpg with white backgrounds".
                        So we need to contain them or mix-blend them.
                        "mix-blend-multiply" works great on white backgrounds to make them transparent on light graphics,
                        but on dark mode, we need a white container.
                    */}

					{/* Partner: Dell */}
					<div className="flex h-24 items-center justify-center rounded-lg bg-white px-8 py-3 shadow-sm transition-shadow hover:shadow-md">
						<img
							alt="Dell Technologies Authorized Partner"
							className="h-full object-contain"
							height={100}
							src="/assets/home/dellauthpartner.png"
							width={100}
						/>
					</div>

					{/* SOC2 & HIPAA */}
					<div className="flex h-24 items-center justify-center rounded-lg bg-white px-8 py-3 shadow-sm transition-shadow hover:shadow-md">
						<img
							alt="SOC2 Type 2 & HIPAA Compliant"
							className="h-full object-contain"
							height={100}
							src="/assets/home/so2andhipaa.png"
							width={100}
						/>
					</div>

					{/* Partner: AMD */}
					<div className="flex h-24 items-center justify-center rounded-lg bg-white px-8 py-3 shadow-sm transition-shadow hover:shadow-md">
						<img
							alt="AMD Partner"
							className="h-full object-contain"
							height={100}
							src="/assets/home/AMDpartner.png"
							width={100}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
