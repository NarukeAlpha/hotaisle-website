export default function CopyCommand({ command }: { command: string }) {
	return (
		<div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-black p-6 font-mono text-neutral-300 text-sm md:flex-row md:text-base">
			<code>{command}</code>
			<button
				className="cursor-pointer rounded bg-neutral-800 px-4 py-2 font-bold text-white text-xs uppercase tracking-wider transition-colors hover:bg-neutral-700"
				data-copy-command-button
				data-copy-command-text={command}
				data-copy-copied-class="!bg-green-600"
				data-copy-default-label="Copy"
				type="button"
			>
				Copy
			</button>
		</div>
	);
}
