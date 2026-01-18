"use client";

import { PostMedia as PostMediaType } from "@/lib/models/Post";
import { cn } from "@/lib/utils";
import { Download, FileText, X } from "lucide-react";
import { useState } from "react";
import VideoEmbed from "./VideoEmbed";

interface PostMediaProps {
	media: PostMediaType[];
}

export default function PostMedia({ media }: PostMediaProps) {
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

	const images = media.filter((m) => m.type === "image");
	const documents = media.filter((m) => m.type === "document");
	const videoEmbeds = media.filter((m) => m.type === "videoEmbed");

	return (
		<div className="space-y-3">
			{/* Image Grid */}
			{images.length > 0 && (
				<div
					className={cn(
						"grid gap-1 rounded-xl overflow-hidden",
						images.length === 1 && "grid-cols-1",
						images.length === 2 && "grid-cols-2",
						images.length === 3 && "grid-cols-2",
						images.length >= 4 && "grid-cols-2"
					)}>
					{images.slice(0, 4).map((img, index) => (
						<button
							key={img.id}
							onClick={() => setLightboxIndex(index)}
							className={cn(
								"relative overflow-hidden bg-white/5",
								images.length === 1 && "aspect-video",
								images.length === 2 && "aspect-square",
								images.length === 3 && index === 0 && "row-span-2 aspect-auto h-full",
								images.length === 3 && index > 0 && "aspect-square",
								images.length >= 4 && "aspect-square"
							)}>
							<img src={img.thumbnailUrl || img.url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
							{index === 3 && images.length > 4 && (
								<div className="absolute inset-0 bg-black/60 flex items-center justify-center">
									<span className="text-2xl font-bold text-white">+{images.length - 4}</span>
								</div>
							)}
						</button>
					))}
				</div>
			)}
			{/* Video Embeds */}
			{videoEmbeds.map((video) => (
				<VideoEmbed key={video.id} media={video} />
			))}
			{/* Documents List */}
			{documents.length > 0 && (
				<div className="space-y-2">
					{documents.map((doc) => (
						<a
							key={doc.id}
							href={doc.url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
							<FileText size={20} className="text-muted-foreground shrink-0" />
							<div className="flex-1 min-w-0">
								<p className="text-sm text-white truncate">{doc.fileName}</p>
								{doc.fileSize && <p className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</p>}
							</div>
							<Download size={16} className="text-muted-foreground shrink-0" />
						</a>
					))}
				</div>
			)}

			{/* Lightbox */}
			{lightboxIndex !== null && (
				<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
					<button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full">
						<X size={24} />
					</button>
					<img src={images[lightboxIndex].url} alt="" className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
				</div>
			)}
		</div>
	);
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
