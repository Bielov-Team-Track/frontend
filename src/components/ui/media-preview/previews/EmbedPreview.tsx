"use client";

import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { useState } from "react";
import type { EmbedPreviewProps } from "../types";

export default function EmbedPreview({ item, className, autoPlay = false }: EmbedPreviewProps) {
	const [isLoaded, setIsLoaded] = useState(autoPlay);
	const embedInfo = item.embedInfo;

	if (!embedInfo) {
		return (
			<div className={cn("flex items-center justify-center h-full text-muted", className)}>
				No embed data
			</div>
		);
	}

	const { provider, embedUrl, thumbnailUrl } = embedInfo;

	// Get autoplay URL
	const getAutoplayUrl = () => {
		if (provider === "youtube") {
			return `${embedUrl}?autoplay=1&rel=0`;
		}
		if (provider === "vimeo") {
			return `${embedUrl}?autoplay=1`;
		}
		return embedUrl;
	};

	if (!isLoaded && thumbnailUrl) {
		// Show thumbnail with play button
		return (
			<div className={cn("relative w-full h-full", className)}>
				<button
					type="button"
					onClick={() => setIsLoaded(true)}
					className="w-full h-full relative group cursor-pointer"
				>
					<img
						src={thumbnailUrl}
						alt={item.fileName || "Video thumbnail"}
						className="w-full h-full object-contain bg-black"
					/>
					<div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
						<div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
							<Play size={32} className="text-white ml-1" fill="currentColor" />
						</div>
					</div>
					<div className="absolute bottom-4 left-4 right-4 text-left">
						<span className="text-sm text-white/80 bg-black/50 px-2 py-1 rounded capitalize">
							{provider}
						</span>
					</div>
				</button>
			</div>
		);
	}

	// Show embedded player
	return (
		<div className={cn("w-full h-full flex items-center justify-center bg-black", className)}>
			<iframe
				src={isLoaded ? getAutoplayUrl() : embedUrl}
				title={item.fileName || "Embedded video"}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowFullScreen
				className="w-full h-full max-w-4xl aspect-video"
			/>
		</div>
	);
}
