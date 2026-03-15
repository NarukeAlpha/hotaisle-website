'use client';

import { X } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

interface ModalImageData {
	alt: string;
	height?: number;
	src: string;
	width?: number;
}

interface BlogContentImageModalProps {
	rootId: string;
}

const MODAL_IMAGE_SELECTOR = 'img.blog-inline-image--modal';

export function BlogContentImageModal({ rootId }: BlogContentImageModalProps) {
	const mountRef = useRef<HTMLSpanElement | null>(null);
	const [modalImage, setModalImage] = useState<ModalImageData | null>(null);

	const closeModal = useEffectEvent(() => {
		setModalImage(null);
	});

	const openModalFromImage = useEffectEvent((image: HTMLImageElement) => {
		const width = image.getAttribute('width');
		const height = image.getAttribute('height');
		setModalImage({
			alt: image.alt,
			height: height ? Number.parseInt(height, 10) : undefined,
			src: image.currentSrc || image.src,
			width: width ? Number.parseInt(width, 10) : undefined,
		});
	});

	useEffect(() => {
		const mountElement = mountRef.current;
		const ownerDocument = mountElement?.ownerDocument;
		const contentElement = ownerDocument?.getElementById(rootId);
		if (!contentElement) {
			return;
		}

		const handleClick = (event: MouseEvent) => {
			const target = event.target;
			if (!(target instanceof HTMLElement)) {
				return;
			}

			const image = target.closest(MODAL_IMAGE_SELECTOR);
			if (!(image instanceof HTMLImageElement)) {
				return;
			}

			openModalFromImage(image);
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (!(event.key === 'Enter' || event.key === ' ')) {
				return;
			}

			const target = event.target;
			if (!(target instanceof HTMLElement)) {
				return;
			}

			const image = target.closest(MODAL_IMAGE_SELECTOR);
			if (!(image instanceof HTMLImageElement)) {
				return;
			}

			event.preventDefault();
			openModalFromImage(image);
		};

		contentElement.addEventListener('click', handleClick);
		contentElement.addEventListener('keydown', handleKeyDown);
		return () => {
			contentElement.removeEventListener('click', handleClick);
			contentElement.removeEventListener('keydown', handleKeyDown);
		};
	}, [rootId]);

	useEffect(() => {
		if (!modalImage) {
			return;
		}

		const ownerDocument = mountRef.current?.ownerDocument;
		const defaultView = ownerDocument?.defaultView;
		if (!defaultView) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closeModal();
			}
		};

		defaultView.addEventListener('keydown', handleKeyDown);
		return () => {
			defaultView.removeEventListener('keydown', handleKeyDown);
		};
	}, [modalImage]);

	return (
		<>
			<span ref={mountRef} />
			{modalImage && (
				<div
					aria-modal="true"
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
					onClick={(event) => {
						if (event.target === event.currentTarget) {
							closeModal();
						}
					}}
					role="dialog"
				>
					<button
						aria-label="Close image"
						className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition-colors hover:bg-black/70"
						onClick={closeModal}
						type="button"
					>
						<X size={20} />
					</button>
					<div className="max-h-full max-w-6xl">
						<img
							alt={modalImage.alt}
							className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
							height={modalImage.height}
							src={modalImage.src}
							width={modalImage.width}
						/>
					</div>
				</div>
			)}
		</>
	);
}
