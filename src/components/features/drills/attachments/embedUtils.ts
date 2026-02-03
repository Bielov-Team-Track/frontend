// =============================================================================
// EMBED URL UTILITIES
// =============================================================================

export type EmbedProvider = "youtube" | "vimeo" | "unknown";

export interface EmbedInfo {
	provider: EmbedProvider;
	videoId: string;
	embedUrl: string;
	thumbnailUrl: string;
}

/**
 * Detect if a URL is an embeddable video URL
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
			// Vimeo thumbnails require API call, use placeholder
			thumbnailUrl: "",
		};
	}

	return null;
}

/**
 * Get provider name for display
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
