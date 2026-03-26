export function SecuritySection() {
	return (
		<section className="border-t border-border/60 bg-muted/30 py-14">
			<div className="mx-auto max-w-7xl px-6">
				<p className="mb-10 text-center font-medium text-muted-foreground text-xs uppercase tracking-widest">
					Trusted by Industry Leaders & Secure by Design
				</p>
				<div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
					<div className="flex h-20 items-center justify-center rounded-xl bg-white px-8 py-3 shadow-sm ring-1 ring-border/40 transition-shadow hover:shadow-md">
						<img
							alt="Dell Technologies Authorized Partner"
							className="h-full object-contain"
							height={80}
							src="/assets/home/dellauthpartner.png"
							width={80}
						/>
					</div>
					<div className="flex h-20 items-center justify-center rounded-xl bg-white px-8 py-3 shadow-sm ring-1 ring-border/40 transition-shadow hover:shadow-md">
						<img
							alt="SOC2 Type 2 & HIPAA Compliant"
							className="h-full object-contain"
							height={80}
							src="/assets/home/so2andhipaa.png"
							width={80}
						/>
					</div>
					<div className="flex h-20 items-center justify-center rounded-xl bg-white px-8 py-3 shadow-sm ring-1 ring-border/40 transition-shadow hover:shadow-md">
						<img
							alt="AMD Partner"
							className="h-full object-contain"
							height={80}
							src="/assets/home/AMDpartner.png"
							width={80}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
