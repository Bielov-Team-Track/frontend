import imageCompression from "browser-image-compression";

export { generateThumbHash, thumbHashToBlurUrl } from "./thumbhash";

/**
 * Shimmer blur placeholder for next/image.
 * Use with `placeholder="blur" blurDataURL={shimmerBlur}` on remote images.
 */
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#e2e8f0" offset="20%" />
      <stop stop-color="#f1f5f9" offset="50%" />
      <stop stop-color="#e2e8f0" offset="80%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#e2e8f0" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.5s" repeatCount="indefinite" />
</svg>`;

function toBase64(str: string) {
	return typeof window === "undefined"
		? Buffer.from(str).toString("base64")
		: window.btoa(str);
}

export const shimmerBlur = (w = 400, h = 300) =>
	`data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;

interface CompressImageOptions {
	maxSizeMB?: number;
	maxWidthOrHeight?: number;
}

/**
 * Compresses an image file using browser-image-compression.
 * Outputs JPEG for photos, PNG for images with transparency.
 */
export async function compressImage(
	file: File,
	options?: CompressImageOptions,
): Promise<File> {
	const { maxSizeMB = 1, maxWidthOrHeight = 2048 } = options ?? {};
	const outputType = getOptimalFormat(file);

	return imageCompression(file, {
		maxSizeMB,
		maxWidthOrHeight,
		fileType: outputType,
		useWebWorker: true,
	});
}

/**
 * Returns the optimal output MIME type for an image.
 * PNG for images that may have transparency, JPEG for everything else.
 */
export function getOptimalFormat(file: File): string {
	const transparentTypes = ["image/png", "image/webp", "image/gif"];
	if (transparentTypes.includes(file.type)) {
		return "image/png";
	}
	return "image/jpeg";
}
