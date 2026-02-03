"use client";

import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { useState } from "react";
import { type EmbedInfo, getProviderDisplayName } from "./embedUtils";

interface EmbedPreviewProps {
	embed: EmbedInfo;
	className?: string;
	autoPlay?: boolean;
}

export default function EmbedPreview({ embed, className, autoPlay = false }: EmbedPreviewProps) {
	const [isPlaying, setIsPlaying] = useState(autoPlay);

	// For YouTube, show thumbnail with play button until clicked
	if (!isPlaying && embed.provider === "youtube" && embed.thumbnailUrl) {
		return (
			<div className={cn("relative w-full aspect-video group cursor-pointer", className)}>
				<img
					src={embed.thumbnailUrl}
					alt={`${getProviderDisplayName(embed.provider)} video thumbnail`}
					className="w-full h-full object-cover rounded-xl"
				/>
				<div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl group-hover:bg-black/40 transition-colors">
					<button
						type="button"
						onClick={() => setIsPlaying(true)}
						className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
					>
						<Play size={28} className="text-gray-900 ml-1" fill="currentColor" />
					</button>
				</div>
				<div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 text-white text-xs font-medium">
					{getProviderDisplayName(embed.provider)}
				</div>
			</div>
		);
	}

	// Embed iframe
	return (
		<div className={cn("relative w-full aspect-video", className)}>
			<iframe
				src={`${embed.embedUrl}?autoplay=${isPlaying ? 1 : 0}&rel=0`}
				title={`${getProviderDisplayName(embed.provider)} video`}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				className="w-full h-full rounded-xl"
			/>
		</div>
	);
}
