"use client";

import { useState, useEffect, useRef } from "react";
import { isEmbedUrl, isYouTubeUrl, isVimeoUrl } from "@/components/ui/media-preview";

// =============================================================================
// TYPES
// =============================================================================

export type VerifiedType = "Image" | "Video" | "Document" | null;

export interface UrlVerification {
	status: "idle" | "validating" | "valid" | "warning" | "invalid";
	detectedType: VerifiedType;
	title: string | null;
	thumbnailUrl: string | null;
	error: string | null;
	provider: "youtube" | "vimeo" | null;
}

const INITIAL: UrlVerification = {
	status: "idle",
	detectedType: null,
	title: null,
	thumbnailUrl: null,
	error: null,
	provider: null,
};

// =============================================================================
// URL FORMAT VALIDATION
// =============================================================================

function isValidUrl(str: string): boolean {
	try {
		const url = new URL(str);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

// =============================================================================
// FILE EXTENSION DETECTION
// =============================================================================

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|#|$)/i;
const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|avi|mkv|m4v)(\?|#|$)/i;
const DOCUMENT_EXTENSIONS = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)(\?|#|$)/i;

function detectTypeFromExtension(url: string): VerifiedType {
	if (IMAGE_EXTENSIONS.test(url)) return "Image";
	if (VIDEO_EXTENSIONS.test(url)) return "Video";
	if (DOCUMENT_EXTENSIONS.test(url)) return "Document";
	return null;
}

// =============================================================================
// oEMBED VERIFICATION
// =============================================================================

interface OEmbedResponse {
	title?: string;
	thumbnail_url?: string;
	author_name?: string;
	provider_name?: string;
}

async function verifyYouTubeEmbed(url: string): Promise<{ title: string; thumbnailUrl: string } | null> {
	try {
		const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
		const res = await fetch(oembedUrl);
		if (!res.ok) return null;
		const data: OEmbedResponse = await res.json();
		return {
			title: data.title || "YouTube Video",
			thumbnailUrl: data.thumbnail_url || "",
		};
	} catch {
		return null;
	}
}

async function verifyVimeoEmbed(url: string): Promise<{ title: string; thumbnailUrl: string } | null> {
	try {
		const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
		const res = await fetch(oembedUrl);
		if (!res.ok) return null;
		const data: OEmbedResponse = await res.json();
		return {
			title: data.title || "Vimeo Video",
			thumbnailUrl: data.thumbnail_url || "",
		};
	} catch {
		return null;
	}
}

// =============================================================================
// IMAGE PROBE
// =============================================================================

function probeImage(url: string): Promise<boolean> {
	return new Promise((resolve) => {
		const img = new Image();
		const timeout = setTimeout(() => {
			img.src = "";
			resolve(false);
		}, 5000);
		img.onload = () => {
			clearTimeout(timeout);
			resolve(true);
		};
		img.onerror = () => {
			clearTimeout(timeout);
			resolve(false);
		};
		img.src = url;
	});
}

// =============================================================================
// HOOK
// =============================================================================

export function useUrlVerification(url: string, debounceMs = 400): UrlVerification {
	const [result, setResult] = useState<UrlVerification>(INITIAL);
	const abortRef = useRef<AbortController | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout>>();

	useEffect(() => {
		// Clean up pending work
		abortRef.current?.abort();
		clearTimeout(timerRef.current);

		const trimmed = url.trim();
		if (!trimmed) {
			setResult(INITIAL);
			return;
		}

		// Basic URL format check (instant, no debounce)
		if (!isValidUrl(trimmed)) {
			setResult({
				...INITIAL,
				status: "invalid",
				error: "Enter a valid URL starting with https://",
			});
			return;
		}

		// Debounce the async verification
		setResult((prev) => ({ ...prev, status: "validating", error: null }));

		timerRef.current = setTimeout(() => {
			const controller = new AbortController();
			abortRef.current = controller;

			(async () => {
				try {
					// 1. Check for embed URLs
					if (isEmbedUrl(trimmed)) {
						let oembed: { title: string; thumbnailUrl: string } | null = null;

						if (isYouTubeUrl(trimmed)) {
							oembed = await verifyYouTubeEmbed(trimmed);
							if (controller.signal.aborted) return;

							if (oembed) {
								setResult({
									status: "valid",
									detectedType: "Video",
									title: oembed.title,
									thumbnailUrl: oembed.thumbnailUrl,
									error: null,
									provider: "youtube",
								});
							} else {
								setResult({
									status: "invalid",
									detectedType: "Video",
									title: null,
									thumbnailUrl: null,
									error: "YouTube video not found or is private",
									provider: "youtube",
								});
							}
							return;
						}

						if (isVimeoUrl(trimmed)) {
							oembed = await verifyVimeoEmbed(trimmed);
							if (controller.signal.aborted) return;

							if (oembed) {
								setResult({
									status: "valid",
									detectedType: "Video",
									title: oembed.title,
									thumbnailUrl: oembed.thumbnailUrl,
									error: null,
									provider: "vimeo",
								});
							} else {
								setResult({
									status: "invalid",
									detectedType: "Video",
									title: null,
									thumbnailUrl: null,
									error: "Vimeo video not found or is private",
									provider: "vimeo",
								});
							}
							return;
						}
					}

					// 2. Check file extension
					const extType = detectTypeFromExtension(trimmed);

					if (extType === "Image") {
						// Verify it's actually loadable as an image
						const isImage = await probeImage(trimmed);
						if (controller.signal.aborted) return;

						if (isImage) {
							setResult({
								status: "valid",
								detectedType: "Image",
								title: null,
								thumbnailUrl: trimmed,
								error: null,
								provider: null,
							});
						} else {
							setResult({
								status: "warning",
								detectedType: "Image",
								title: null,
								thumbnailUrl: null,
								error: "Image could not be loaded — it may be broken or require authentication",
								provider: null,
							});
						}
						return;
					}

					if (extType === "Video") {
						// Can't easily verify video files cross-origin, trust extension
						setResult({
							status: "valid",
							detectedType: "Video",
							title: null,
							thumbnailUrl: null,
							error: null,
							provider: null,
						});
						return;
					}

					if (extType === "Document") {
						setResult({
							status: "valid",
							detectedType: "Document",
							title: null,
							thumbnailUrl: null,
							error: null,
							provider: null,
						});
						return;
					}

					// 3. Unknown URL — try image probe as last resort
					const mightBeImage = await probeImage(trimmed);
					if (controller.signal.aborted) return;

					if (mightBeImage) {
						setResult({
							status: "valid",
							detectedType: "Image",
							title: null,
							thumbnailUrl: trimmed,
							error: null,
							provider: null,
						});
						return;
					}

					// 4. Truly unrecognized URL
					setResult({
						status: "warning",
						detectedType: null,
						title: null,
						thumbnailUrl: null,
						error: "Can't detect media type — use a direct link to an image, video, document, or a YouTube/Vimeo URL",
						provider: null,
					});
				} catch {
					if (controller.signal.aborted) return;
					setResult({
						status: "warning",
						detectedType: null,
						title: null,
						thumbnailUrl: null,
						error: "Could not verify this URL",
						provider: null,
					});
				}
			})();
		}, debounceMs);

		return () => {
			abortRef.current?.abort();
			clearTimeout(timerRef.current);
		};
	}, [url, debounceMs]);

	return result;
}
