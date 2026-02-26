'use client';

import { BookOpen, ChevronRight, Hash, Loader2, Scale, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
	category: 'Page' | 'Blog' | 'Policy';
	description: string;
	title: string;
	type: string;
	url: string;
}

interface SearchUIProps {
	isOpen: boolean;
	onClose: () => void;
}

export function SearchUI({ isOpen, onClose }: SearchUIProps) {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [allData, setAllData] = useState<SearchResult[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	// Fetch index on mount (or first open to save bandwidth)
	useEffect(() => {
		if (isOpen && allData.length === 0) {
			setIsLoading(true);
			fetch('/api/search')
				.then((res) => res.json())
				.then((data) => {
					setAllData(data);
					setIsLoading(false);
				})
				.catch((err) => {
					console.error('Failed to load search index', err);
					setIsLoading(false);
				});
		}
	}, [isOpen, allData.length]);

	// Focus input on open
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [isOpen]);

	// Filter results
	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			return;
		}

		const q = query.toLowerCase();
		const filtered = allData
			.filter(
				(item) =>
					item.title.toLowerCase().includes(q) ||
					item.description.toLowerCase().includes(q)
			)
			.slice(0, 10); // Limit to 10

		setResults(filtered);
	}, [query, allData]);

	// Handle ESC key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onClose]);

	// Prevent body scroll when open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	const handleSelect = (url: string) => {
		onClose();
		navigate(url);
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[15vh]">
			{/* Backdrop */}
			{/** biome-ignore lint/a11y/noStaticElementInteractions: don't care */}
			<div
				className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="animation-scale-in relative flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
				{/* Search Bar */}
				<div className="flex items-center border-border border-b px-4 py-3">
					<Search className="mr-3 h-5 w-5 text-muted-foreground" />
					<input
						className="h-10 flex-1 border-none bg-transparent text-foreground text-lg outline-none placeholder:text-muted-foreground/50"
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search documentation, products, and more..."
						ref={inputRef}
						type="text"
						value={query}
					/>
					<button
						className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
						onClick={onClose}
						type="button"
					>
						<X size={20} />
					</button>
				</div>

				{/* Content Area */}
				<div className="max-h-[60vh] overflow-y-auto p-2">
					{isLoading && (
						<div className="flex items-center justify-center py-8 text-muted-foreground">
							<Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading index...
						</div>
					)}

					{!isLoading && query === '' && (
						<div className="py-8 text-center text-muted-foreground">
							<p className="text-sm">Type to start searching...</p>
						</div>
					)}

					{!isLoading && query !== '' && results.length === 0 && (
						<div className="py-8 text-center text-muted-foreground">
							<p>No results found for "{query}"</p>
						</div>
					)}

					{!isLoading && results.length > 0 && (
						<div className="space-y-1">
							{results.map((result) => (
								<button
									className="group flex w-full items-start gap-4 rounded-lg border border-transparent px-4 py-3 text-left transition-colors hover:border-border hover:bg-accent/50 hover:text-accent-foreground"
									key={result.url}
									onClick={() => handleSelect(result.url)}
									type="button"
								>
									<div className="mt-1 rounded-md bg-muted p-2 transition-colors group-hover:bg-background">
										{result.category === 'Page' && (
											<Hash className="text-hot-orange" size={18} />
										)}
										{result.category === 'Blog' && (
											<BookOpen className="text-orange-500" size={18} />
										)}
										{result.category === 'Policy' && (
											<Scale className="text-red-500" size={18} />
										)}
									</div>
									<div className="flex-1">
										<div className="mb-0.5 flex items-center gap-2">
											<span className="font-semibold text-foreground transition-colors group-hover:text-arctic-blue">
												{result.title}
											</span>
											<span className="rounded bg-muted px-1.5 py-0.5 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
												{result.type}
											</span>
										</div>
										<p className="line-clamp-1 text-muted-foreground text-sm">
											{result.description}
										</p>
									</div>
									<ChevronRight className="h-4 w-4 self-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
								</button>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between border-border border-t bg-muted/30 px-4 py-2 text-muted-foreground text-xs">
					<span>
						<strong className="text-foreground">{results.length}</strong> results
					</span>
					<div className="flex gap-4">
						<span className="flex items-center gap-1">
							<kbd className="rounded border border-border bg-background px-1">
								Esc
							</kbd>{' '}
							to close
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
