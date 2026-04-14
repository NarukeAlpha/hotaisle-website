import fs from 'node:fs';
import { readdir, stat, writeFile } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIRECTORY = path.join(import.meta.dirname, '..', 'public');
const SOURCE_IMAGE_REGEX = /\.(png|jpe?g)$/i;
const WEBP_EXTENSION_REGEX = /\.(png|jpe?g)$/i;
const AVIF_EXTENSION_REGEX = /\.(jpe?g)$/i;
const IMAGE_VARIANT_CONCURRENCY = Math.max(1, availableParallelism() - 1);

async function collectRasterAssets(directory: string): Promise<string[]> {
	const directoryEntries = await readdir(directory, { withFileTypes: true });
	const assetPaths: string[] = [];

	for (const directoryEntry of directoryEntries) {
		const entryPath = path.join(directory, directoryEntry.name);

		if (directoryEntry.isDirectory()) {
			assetPaths.push(...(await collectRasterAssets(entryPath)));
			continue;
		}

		if (directoryEntry.isFile() && SOURCE_IMAGE_REGEX.test(directoryEntry.name)) {
			assetPaths.push(entryPath);
		}
	}

	return assetPaths;
}

async function writeVariantIfFresh(
	sourcePath: string,
	outputPath: string,
	bufferFactory: () => Promise<Buffer<ArrayBufferLike>>
): Promise<void> {
	const [sourceStats, outputStats] = await Promise.all([
		stat(sourcePath),
		stat(outputPath).catch(() => null),
	]);

	if (outputStats && outputStats.mtimeMs >= sourceStats.mtimeMs) {
		return;
	}

	const outputBuffer = await bufferFactory();
	await writeFile(outputPath, outputBuffer);
}

async function createWebpBuffer(sourcePath: string): Promise<Buffer<ArrayBufferLike>> {
	if (sourcePath.toLowerCase().endsWith('.png')) {
		const losslessBuffer = await sharp(sourcePath)
			.webp({ effort: 6, lossless: true })
			.toBuffer();
		const visuallyLosslessBuffer = await sharp(sourcePath)
			.webp({ effort: 6, nearLossless: true, quality: 88 })
			.toBuffer();

		return visuallyLosslessBuffer.byteLength < losslessBuffer.byteLength
			? visuallyLosslessBuffer
			: losslessBuffer;
	}

	return await sharp(sourcePath).webp({ effort: 6, quality: 82 }).toBuffer();
}

async function createAvifBuffer(sourcePath: string): Promise<Buffer<ArrayBufferLike>> {
	return await sharp(sourcePath).avif({ effort: 8, quality: 55 }).toBuffer();
}

async function generateImageVariants(): Promise<void> {
	if (!fs.existsSync(PUBLIC_DIRECTORY)) {
		return;
	}

	const rasterAssets = await collectRasterAssets(PUBLIC_DIRECTORY);
	let nextAssetIndex = 0;

	async function processNextAsset(): Promise<void> {
		const sourcePath = rasterAssets[nextAssetIndex];
		nextAssetIndex += 1;

		if (!sourcePath) {
			return;
		}

		const webpPath = sourcePath.replace(WEBP_EXTENSION_REGEX, '.webp');
		await writeVariantIfFresh(
			sourcePath,
			webpPath,
			async () => await createWebpBuffer(sourcePath)
		);

		if (AVIF_EXTENSION_REGEX.test(sourcePath)) {
			const avifPath = sourcePath.replace(AVIF_EXTENSION_REGEX, '.avif');
			await writeVariantIfFresh(
				sourcePath,
				avifPath,
				async () => await createAvifBuffer(sourcePath)
			);
		}

		await processNextAsset();
	}

	await Promise.all(
		Array.from(
			{ length: Math.min(IMAGE_VARIANT_CONCURRENCY, rasterAssets.length) },
			async () => await processNextAsset()
		)
	);
}

await generateImageVariants();
