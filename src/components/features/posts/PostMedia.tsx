"use client";

import { MediaGallery, type MediaItem } from "@/components/ui/media-preview";
import { PostMedia as PostMediaType } from "@/lib/models/Post";
import VideoEmbed from "./VideoEmbed";

interface PostMediaProps {
	media: PostMediaType[];
}

export default function PostMedia({ media }: PostMediaProps) {
	// Separate video embeds (handled differently)
	const videoEmbeds = media.filter((m) => m.mediaType === "videoEmbed");

	// Convert images and documents to MediaItem format
	const mediaItems: MediaItem[] = media
		.filter((m) => m.mediaType === "image" || m.mediaType === "document" || m.mediaType === "video")
		.map((m) => ({
			id: m.id,
			type: m.mediaType as "image" | "video" | "document",
			url: m.url,
			thumbnailUrl: m.thumbnailUrl,
			fileName: m.fileName,
			mimeType: m.mimeType,
			fileSize: m.fileSize,
		}));

	return (
		<div className="space-y-3">
			{/* Media Gallery (images, documents, videos) */}
			{mediaItems.length > 0 && (
				<MediaGallery
					items={mediaItems}
					maxVisible={20}
					thumbnailSize="lg"
					className="rounded-xl overflow-hidden"
				/>
			)}

			{/* Video Embeds (YouTube/Vimeo - separate handling) */}
			{videoEmbeds.map((video) => (
				<VideoEmbed key={video.id} media={video} />
			))}
		</div>
	);
}
