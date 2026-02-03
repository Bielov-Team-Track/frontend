import type { DocumentSubtype, EmbedInfo, EmbedProvider, MediaItem } from "./types";

// =============================================================================
// DOCUMENT SUBTYPE DETECTION
// =============================================================================

const DOCUMENT_EXTENSIONS: Record<string, DocumentSubtype> = {
	pdf: "pdf",
	doc: "word",
	docx: "word",
	xls: "excel",
	xlsx: "excel",
	ppt: "powerpoint",
	pptx: "powerpoint",
};

const MIME_TO_SUBTYPE: Record<string, DocumentSubtype> = {
	"application/pdf": "pdf",
	"application/msword": "word",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "word",
	"application/vnd.ms-excel": "excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "excel",
	"application/vnd.ms-powerpoint": "powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": "powerpoint",
};

export function getDocumentSubtype(item: MediaItem): DocumentSubtype {
	// First try mimeType
	if (item.mimeType && MIME_TO_SUBTYPE[item.mimeType]) {
		return MIME_TO_SUBTYPE[item.mimeType];
	}

	// Fall back to extension from URL or fileName
	const name = item.fileName || item.url;
	const extension = name.split(".").pop()?.toLowerCase();

	if (extension && DOCUMENT_EXTENSIONS[extension]) {
		return DOCUMENT_EXTENSIONS[extension];
	}

	return "unknown";
}

// =============================================================================
// VIEWER URL GENERATION
// =============================================================================

export function getViewerUrl(item: MediaItem): string | null {
	const subtype = getDocumentSubtype(item);
	const encodedUrl = encodeURIComponent(item.url);

	switch (subtype) {
		case "word":
		case "excel":
		case "powerpoint":
			// Microsoft Office Viewer (better fidelity for Office docs)
			return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
		case "pdf":
			// Google Docs Viewer (more reliable for PDFs)
			return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
		default:
			return null;
	}
}

// =============================================================================
// FILE SIZE FORMATTING
// =============================================================================

export function formatFileSize(bytes?: number): string {
	if (bytes === undefined || bytes === null) {
		return "";
	}

	if (bytes === 0) {
		return "0 B";
	}

	const units = ["B", "KB", "MB", "GB"];
	const k = 1024;
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	const size = bytes / Math.pow(k, i);

	return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// =============================================================================
// FILE NAME EXTRACTION
// =============================================================================

export function getFileName(item: MediaItem): string {
	if (item.fileName) {
		return item.fileName;
	}

	// Extract from URL
	try {
		const url = new URL(item.url);
		const pathname = url.pathname;
		const segments = pathname.split("/");
		const lastSegment = segments[segments.length - 1];

		// Decode and return
		return decodeURIComponent(lastSegment) || "Unknown file";
	} catch {
		// If URL parsing fails, try simple split
		const segments = item.url.split("/");
		return segments[segments.length - 1] || "Unknown file";
	}
}

// =============================================================================
// DOCUMENT ICON HELPERS
// =============================================================================

export function getDocumentIconColor(subtype: DocumentSubtype): string {
	switch (subtype) {
		case "pdf":
			return "text-red-500";
		case "word":
			return "text-blue-500";
		case "excel":
			return "text-green-500";
		case "powerpoint":
			return "text-orange-500";
		default:
			return "text-muted-foreground";
	}
}

// =============================================================================
// EMBED URL UTILITIES
// =============================================================================

/**
 * Check if a URL is an embeddable video URL
 */
export function isEmbedUrl(url: string): boolean {
	return isYouTubeUrl(url) || isVimeoUrl(url);
}

/**
 * Check if URL is a YouTube video
 */
export function isYouTubeUrl(url: string): boolean {
	const patterns = [
		/^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
		/^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
		/^https?:\/\/youtu\.be\/[\w-]+/,
		/^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
	];
	return patterns.some((pattern) => pattern.test(url));
}

/**
 * Check if URL is a Vimeo video
 */
export function isVimeoUrl(url: string): boolean {
	const patterns = [
		/^https?:\/\/(www\.)?vimeo\.com\/\d+/,
		/^https?:\/\/player\.vimeo\.com\/video\/\d+/,
	];
	return patterns.some((pattern) => pattern.test(url));
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function getYouTubeVideoId(url: string): string | null {
	const patterns = [
		/youtube\.com\/watch\?v=([\w-]+)/,
		/youtube\.com\/embed\/([\w-]+)/,
		/youtu\.be\/([\w-]+)/,
		/youtube\.com\/shorts\/([\w-]+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match?.[1]) {
			return match[1];
		}
	}
	return null;
}

/**
 * Extract Vimeo video ID from various URL formats
 */
export function getVimeoVideoId(url: string): string | null {
	const patterns = [
		/vimeo\.com\/(\d+)/,
		/player\.vimeo\.com\/video\/(\d+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match?.[1]) {
			return match[1];
		}
	}
	return null;
}

/**
 * Parse an embed URL and return embed information
 */
export function parseEmbedUrl(url: string): EmbedInfo | null {
	// YouTube
	const youtubeId = getYouTubeVideoId(url);
	if (youtubeId) {
		return {
			provider: "youtube",
			videoId: youtubeId,
			embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
			thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
		};
	}

	// Vimeo
	const vimeoId = getVimeoVideoId(url);
	if (vimeoId) {
		return {
			provider: "vimeo",
			videoId: vimeoId,
			embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
			thumbnailUrl: undefined, // Vimeo thumbnails require API call
		};
	}

	return null;
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: EmbedProvider): string {
	switch (provider) {
		case "youtube":
			return "YouTube";
		case "vimeo":
			return "Vimeo";
		default:
			return "Video";
	}
}
