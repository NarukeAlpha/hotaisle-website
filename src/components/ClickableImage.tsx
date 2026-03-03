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
	onClick,
}: ImageData & {
	className?: string;
	imgClassName?: string;
	onClick: (image: ImageData) => void;
}) {
	return (
		<button
			className={`cursor-pointer ${className}`}
			onClick={() => onClick({ src, alt, width, height })}
			type="button"
		>
			<img alt={alt} className={imgClassName} height={height} src={src} width={width} />
		</button>
	);
}

export type { ImageData };
