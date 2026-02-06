"use client";

import { PostMedia } from "@/lib/models/Post";
import { Play } from "lucide-react";
import { useState } from "react";

interface VideoEmbedProps {
	media: PostMedia;
}

export default function VideoEmbed({ media }: VideoEmbedProps) {
	const [isLoaded, setIsLoaded] = useState(false);

	if (media.mediaType !== "videoEmbed" || !media.embedProvider || !media.embedId) {
		return null;
	}

	const getEmbedUrl = () => {
		switch (media.embedProvider) {
			case "youtube":
				return `https://www.youtube.com/embed/${media.embedId}?autoplay=1`;
			case "vimeo":
				return `https://player.vimeo.com/video/${media.embedId}?autoplay=1`;
			default:
				return null;
		}
	};

	const getThumbnailUrl = () => {
		if (media.thumbnailUrl) return media.thumbnailUrl;

		switch (media.embedProvider) {
			case "youtube":
				return `https://img.youtube.com/vi/${media.embedId}/maxresdefault.jpg`;
			case "vimeo":
				// Vimeo doesn't have a simple thumbnail URL format
				return media.thumbnailUrl;
			default:
				return null;
		}
	};

	const embedUrl = getEmbedUrl();
	const thumbnailUrl = getThumbnailUrl();

	if (!embedUrl) return null;

	return (
		<div className="relative aspect-video rounded-xl overflow-hidden bg-black">
			{!isLoaded ? (
				<button onClick={() => setIsLoaded(true)} className="absolute inset-0 flex items-center justify-center group">
					{thumbnailUrl && <img src={thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
					<div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
					<div className="relative w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
						<Play size={28} className="text-black ml-1" fill="currentColor" />
					</div>
				</button>
			) : (
				<iframe
					src={embedUrl}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					className="absolute inset-0 w-full h-full"
				/>
			)}
		</div>
	);
}
