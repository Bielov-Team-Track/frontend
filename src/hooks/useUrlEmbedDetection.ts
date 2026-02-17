"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
	isEmbedUrl,
	parseEmbedUrl,
	type EmbedInfo,
} from "@/components/ui/media-preview";

// =============================================================================
// TYPES
// =============================================================================

export interface DetectedEmbed {
	id: string; // e.g. "youtube-dQw4w9WgXcQ"
	url: string; // original URL
	embedInfo: EmbedInfo; // from parseEmbedUrl
	title: string | null;
	thumbnailUrl: string | null;
	dismissed: boolean;
}

interface OEmbedResponse {
	title?: string;
	thumbnail_url?: string;
}

interface UseUrlEmbedDetectionOptions {
	enabled?: boolean;
	debounceMs?: number;
}

interface UseUrlEmbedDetectionResult {
	embeds: DetectedEmbed[];
	allEmbeds: DetectedEmbed[];
	isLoading: boolean;
	dismiss: (id: string) => void;
	reset: () => void;
}

// =============================================================================
// URL EXTRACTION
// =============================================================================

const URL_REGEX = /https?:\/\/[^\s<>"')\]]+/gi;

function extractUrls(text: string): string[] {
	return text.match(URL_REGEX) ?? [];
}

// =============================================================================
// oEMBED FETCHING
// =============================================================================

async function fetchOEmbed(
	url: string,
	provider: string,
): Promise<{ title: string | null; thumbnailUrl: string | null }> {
	try {
		const oembedUrl =
			provider === "youtube"
				? `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
				: `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;

		const res = await fetch(oembedUrl);
		if (!res.ok) return { title: null, thumbnailUrl: null };

		const data: OEmbedResponse = await res.json();
		return {
			title: data.title ?? null,
			thumbnailUrl: data.thumbnail_url ?? null,
		};
	} catch {
		return { title: null, thumbnailUrl: null };
	}
}

// =============================================================================
// HOOK
// =============================================================================

export function useUrlEmbedDetection(
	text: string,
	options: UseUrlEmbedDetectionOptions = {},
): UseUrlEmbedDetectionResult {
	const { enabled = true, debounceMs = 500 } = options;

	const [embeds, setEmbeds] = useState<DetectedEmbed[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const timerRef = useRef<ReturnType<typeof setTimeout>>();
	const prevUrlsRef = useRef<string>("");

	// -------------------------------------------------------------------------
	// Detect and fetch embeds
	// -------------------------------------------------------------------------

	useEffect(() => {
		clearTimeout(timerRef.current);

		if (!enabled) {
			return;
		}

		const allUrls = extractUrls(text);
		const embedUrls = allUrls.filter(isEmbedUrl);
		const urlsKey = embedUrls.sort().join("\n");

		// Skip if URLs haven't changed
		if (urlsKey === prevUrlsRef.current) {
			// Clean up dismissed embeds whose URL was removed
			setEmbeds((prev) => prev.filter((e) => embedUrls.includes(e.url)));
			return;
		}

		if (embedUrls.length === 0) {
			prevUrlsRef.current = urlsKey;
			setEmbeds([]);
			return;
		}

		setIsLoading(true);

		timerRef.current = setTimeout(async () => {
			const results: DetectedEmbed[] = [];

			for (const url of embedUrls) {
				const embedInfo = parseEmbedUrl(url);
				if (!embedInfo) continue;

				const id = `${embedInfo.provider}-${embedInfo.videoId}`;

				// Preserve dismissed state from previous embeds
				const existing = embeds.find((e) => e.id === id);

				const oembed = await fetchOEmbed(url, embedInfo.provider);

				results.push({
					id,
					url,
					embedInfo,
					title: oembed.title,
					thumbnailUrl: oembed.thumbnailUrl ?? embedInfo.thumbnailUrl ?? null,
					dismissed: existing?.dismissed ?? false,
				});
			}

			prevUrlsRef.current = urlsKey;
			setEmbeds(results);
			setIsLoading(false);
		}, debounceMs);

		return () => {
			clearTimeout(timerRef.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [text, enabled, debounceMs]);

	// -------------------------------------------------------------------------
	// Cleanup timer on unmount
	// -------------------------------------------------------------------------

	useEffect(() => {
		return () => {
			clearTimeout(timerRef.current);
		};
	}, []);

	// -------------------------------------------------------------------------
	// Actions
	// -------------------------------------------------------------------------

	const dismiss = useCallback((id: string) => {
		setEmbeds((prev) =>
			prev.map((e) => (e.id === id ? { ...e, dismissed: true } : e)),
		);
	}, []);

	const reset = useCallback(() => {
		setEmbeds([]);
		prevUrlsRef.current = "";
	}, []);

	// -------------------------------------------------------------------------
	// Return
	// -------------------------------------------------------------------------

	return {
		embeds: embeds.filter((e) => !e.dismissed),
		allEmbeds: embeds,
		isLoading,
		dismiss,
		reset,
	};
}
