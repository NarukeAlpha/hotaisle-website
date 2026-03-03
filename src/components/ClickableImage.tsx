interface ImageData {
	alt: string;
	height: number;
	src: string;
	width: number;
}

export function ClickableImage({
	src,
	alt,
	width,
	height,
	className = '',
	imgClassName = '',
}: ImageData & {
	className?: string;
	imgClassName?: string;
}) {
	return (
		<img
			alt={alt}
			className={className.length > 0 ? `${className} ${imgClassName}` : imgClassName}
			height={height}
			src={src}
			width={width}
		/>
	);
}

export type { ImageData };
