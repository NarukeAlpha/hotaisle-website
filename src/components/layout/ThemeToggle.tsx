import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
	const { setTheme, theme } = useTheme();

	return (
		<button
			aria-label="Toggle theme"
			className={cn(
				'inline-flex items-center justify-center rounded-md p-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
				className
			)}
			onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
			type="button"
		>
			<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
		</button>
	);
}
