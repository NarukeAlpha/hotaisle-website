export default function CopyCommand({ command }: { command: string }) {
	return (
		<div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-black p-6 font-mono text-neutral-300 text-sm md:flex-row md:text-base">
			<code>{command}</code>
			<span className="rounded bg-neutral-800 px-4 py-2 font-bold text-white text-xs uppercase tracking-wider">
				Copy
			</span>
		</div>
	);
}
