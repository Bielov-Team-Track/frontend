import { rgbaToThumbHash, thumbHashToDataURL } from "thumbhash";

/**
 * Generates a ThumbHash base64 string from an image Blob.
 * Scales down to max 100px, encodes pixel data via rgbaToThumbHash.
 */
export async function generateThumbHash(image: Blob): Promise<string> {
	const bitmap = await createImageBitmap(image);
	const maxDim = 100;
	const scale = Math.min(maxDim / bitmap.width, maxDim / bitmap.height, 1);
	const w = Math.round(bitmap.width * scale);
	const h = Math.round(bitmap.height * scale);

	const canvas = new OffscreenCanvas(w, h);
	const ctx = canvas.getContext("2d")!;
	ctx.drawImage(bitmap, 0, 0, w, h);
	bitmap.close();

	const pixels = ctx.getImageData(0, 0, w, h);
	const hash = rgbaToThumbHash(w, h, pixels.data);
	return btoa(String.fromCharCode(...hash));
}

/**
 * Decodes a base64 ThumbHash string into a data URL suitable for `blurDataURL`.
 * Returns undefined for null/missing hash so callers can fall back to shimmer.
 */
export function thumbHashToBlurUrl(
	hash: string | null | undefined,
): string | undefined {
	if (!hash) return undefined;

	const bytes = Uint8Array.from(atob(hash), (c) => c.charCodeAt(0));
	return thumbHashToDataURL(bytes);
}
