"use client";

import { cn } from "@/lib/utils";
import type { DrillAttachment, DrillAnimation } from "@/lib/models/Drill";
import { FileText, Film, ImageIcon, ExternalLink, Play } from "lucide-react";
import { useState } from "react";
import { isEmbedUrl, parseEmbedUrl } from "./embedUtils";
import { MediaLightbox, type MediaItem, formatFileSize, parseEmbedUrl as parseEmbedUrlMedia } from "@/components/ui/media-preview";

interface DrillAttachmentsProps {
	attachments: DrillAttachment[];
	animations?: DrillAnimation[];
	className?: string;
}

export default function DrillAttachments({ attachments, animations, className }: DrillAttachmentsProps) {
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);

	const hasAttachments = attachments?.length > 0;
	const hasAnimation = animations && animations.length > 0 && animations.some(a => a.keyframes?.length > 0);

	if (!hasAttachments && !hasAnimation) {
		return null;
	}

	// Separate embeds from regular attachments
	const embeds = attachments?.filter((a) => a.fileType === "Video" && isEmbedUrl(a.fileUrl)) || [];
	const regularAttachments = attachments?.filter((a) => !(a.fileType === "Video" && isEmbedUrl(a.fileUrl))) || [];

	// Build unified media items array
	const mediaItems: MediaItem[] = [];

	// Add animations first if they exist
	if (hasAnimation && animations) {
		animations.filter(anim => anim.keyframes?.length > 0).forEach((anim, i) => {
			mediaItems.push({
				id: `drill-animation-${i}`,
				type: "animation",
				url: "",
				fileName: anim.name || `Animation ${i + 1}`,
				animation: {
					keyframes: anim.keyframes.map(kf => ({
						id: kf.id,
						players: kf.players.map(p => ({
							id: p.id,
							x: p.x,
							y: p.y,
							color: p.color,
							label: p.label,
						})),
						ball: kf.ball,
						equipment: kf.equipment?.map(e => ({
							id: e.id,
							type: e.type,
							x: e.x,
							y: e.y,
							rotation: e.rotation,
							label: e.label,
						})),
					})),
					speed: anim.speed,
				},
			});
		});
	}
	const firstAnimationId = hasAnimation ? "drill-animation-0" : null;

	// Add embeds as MediaItems
	embeds.forEach((embed) => {
		const embedInfo = parseEmbedUrlMedia(embed.fileUrl);
		if (embedInfo) {
			mediaItems.push({
				id: embed.id,
				type: "embed",
				url: embed.fileUrl,
				fileName: embed.fileName || embedInfo.provider,
				embedInfo,
			});
		}
	});

	// Add regular images and videos
	regularAttachments
		.filter((a) => a.fileType === "Image" || a.fileType === "Video")
		.forEach((a) => {
			mediaItems.push({
				id: a.id,
				type: a.fileType === "Image" ? "image" : "video",
				url: a.fileUrl,
				fileName: a.fileName,
				fileSize: a.fileSize,
			});
		});

	const documents = regularAttachments.filter((a) => a.fileType === "Document");
	const images = regularAttachments.filter((a) => a.fileType === "Image");
	const videos = regularAttachments.filter((a) => a.fileType === "Video");

	const openLightbox = (mediaId: string) => {
		const index = mediaItems.findIndex((m) => m.id === mediaId);
		if (index >= 0) {
			setLightboxIndex(index);
			setLightboxOpen(true);
		}
	};

	return (
		<div className={cn("space-y-6", className)}>
			{/* Animation Previews */}
			{hasAnimation && animations && (
				<div className="space-y-3">
					{(embeds.length > 0 || images.length > 0 || videos.length > 0 || documents.length > 0) && (
						<h4 className="text-xs font-bold text-muted uppercase tracking-wider">{animations.length > 1 ? "Animations" : "Animation"}</h4>
					)}
					<div className="flex gap-3 flex-wrap">
						{animations.filter(a => a.keyframes?.length > 0).map((anim, i) => (
							<button
								key={i}
								type="button"
								onClick={() => openLightbox(`drill-animation-${i}`)}
								className="relative w-full max-w-xs aspect-[1/2] rounded-xl overflow-hidden group cursor-pointer bg-green-800"
							>
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
										<Play size={32} className="text-white ml-1" fill="currentColor" />
									</div>
								</div>
								<div className="absolute bottom-3 left-3 right-3 text-center">
									<span className="text-sm text-white/80 bg-black/50 px-3 py-1 rounded-full">
										{anim.name || `Animation ${i + 1}`} - {anim.keyframes.length} frames
									</span>
								</div>
							</button>
						))}
					</div>
				</div>
			)}

			{/* Embedded Videos (YouTube, Vimeo) */}
			{embeds.length > 0 && (
				<div className="space-y-4">
					{(hasAnimation || images.length > 0 || videos.length > 0 || documents.length > 0) && (
						<h4 className="text-xs font-bold text-muted uppercase tracking-wider">Videos</h4>
					)}
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{embeds.map((embed) => {
							const embedInfo = parseEmbedUrl(embed.fileUrl);
							if (!embedInfo) return null;

							return (
								<button
									key={embed.id}
									type="button"
									onClick={() => openLightbox(embed.id)}
									className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer"
								>
									{embedInfo.thumbnailUrl ? (
										<img
											src={embedInfo.thumbnailUrl}
											alt={embed.fileName || "Video"}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										/>
									) : (
										<div className="w-full h-full bg-skeleton flex items-center justify-center">
											<Film size={32} className="text-muted" />
										</div>
									)}
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
										<div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
											<Play size={24} className="text-white ml-0.5" fill="currentColor" />
										</div>
									</div>
									<div className="absolute bottom-2 left-2">
										<span className="text-xs text-white bg-black/60 px-2 py-0.5 rounded capitalize">
											{embedInfo.provider}
										</span>
									</div>
								</button>
							);
						})}
					</div>
				</div>
			)}

			{/* Image Gallery */}
			{images.length > 0 && (
				<div className="space-y-3">
					{(hasAnimation || embeds.length > 0 || videos.length > 0 || documents.length > 0) && (
						<h4 className="text-xs font-bold text-muted uppercase tracking-wider">Images</h4>
					)}
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{images.map((img) => (
							<button
								key={img.id}
								type="button"
								onClick={() => openLightbox(img.id)}
								className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer"
							>
								<img
									src={img.fileUrl}
									alt={img.fileName}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
								/>
								<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
							</button>
						))}
					</div>
				</div>
			)}

			{/* Video Files */}
			{videos.length > 0 && (
				<div className="space-y-3">
					{(hasAnimation || embeds.length > 0 || images.length > 0 || documents.length > 0) && (
						<h4 className="text-xs font-bold text-muted uppercase tracking-wider">Video Files</h4>
					)}
					<div className="grid gap-3">
						{videos.map((video) => (
							<button
								key={video.id}
								type="button"
								onClick={() => openLightbox(video.id)}
								className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-hover transition-colors text-left group"
							>
								<div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
									<Play size={18} className="text-accent" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm text-white font-medium truncate group-hover:text-accent transition-colors">
										{video.fileName}
									</p>
									{video.fileSize > 0 && (
										<p className="text-xs text-muted">{formatFileSize(video.fileSize)}</p>
									)}
								</div>
								<Film size={16} className="text-muted shrink-0" />
							</button>
						))}
					</div>
				</div>
			)}

			{/* Documents */}
			{documents.length > 0 && (
				<div className="space-y-3">
					{(hasAnimation || embeds.length > 0 || images.length > 0 || videos.length > 0) && (
						<h4 className="text-xs font-bold text-muted uppercase tracking-wider">Documents</h4>
					)}
					<div className="grid gap-2">
						{documents.map((doc) => (
							<a
								key={doc.id}
								href={doc.fileUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-hover transition-colors group"
							>
								<div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
									<FileText size={18} className="text-blue-400" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm text-white font-medium truncate group-hover:text-accent transition-colors">
										{doc.fileName}
									</p>
									{doc.fileSize > 0 && (
										<p className="text-xs text-muted">{formatFileSize(doc.fileSize)}</p>
									)}
								</div>
								<ExternalLink size={16} className="text-muted shrink-0" />
							</a>
						))}
					</div>
				</div>
			)}

			{/* Lightbox for images and videos */}
			<MediaLightbox
				items={mediaItems}
				initialIndex={lightboxIndex}
				isOpen={lightboxOpen}
				onClose={() => setLightboxOpen(false)}
			/>
		</div>
	);
}
