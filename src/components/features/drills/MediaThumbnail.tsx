"use client";

import { Play, FileText, Film, ImageIcon, ExternalLink, Loader2, RotateCw } from "lucide-react";
import { isEmbedUrl, parseEmbedUrl } from "./attachments/embedUtils";
import type { DrillAttachment } from "@/lib/models/Drill";
import { formatFileSize } from "@/components/ui/media-preview";

// ── Uploading file type ──────────────────────────────────────────────────────

export interface UploadingFile {
	id: string;
	file: File;
	preview: string;
	status: "uploading" | "error";
}

// ── Uploading thumbnail ──────────────────────────────────────────────────────

export function UploadingThumbnail({ upload, onRetry }: { upload: UploadingFile; onRetry?: (id: string) => void }) {
	const isImage = upload.file.type.startsWith("image/");

	return (
		<div className="relative flex-shrink-0 w-[140px] h-[100px] rounded-xl overflow-hidden bg-surface">
			{isImage && upload.preview ? (
				<img
					src={upload.preview}
					alt={upload.file.name}
					className="w-full h-full object-cover opacity-50"
				/>
			) : (
				<div className="w-full h-full flex flex-col items-center justify-center gap-1.5 opacity-50">
					<FileText size={24} className="text-muted" />
					<p className="text-[10px] text-muted truncate max-w-[120px] px-2">{upload.file.name}</p>
				</div>
			)}
			<div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/30">
				{upload.status === "uploading" ? (
					<Loader2 size={24} className="text-white animate-spin" />
				) : (
					<>
						<span className="text-xs text-error font-medium">Failed</span>
						{onRetry && (
							<button
								type="button"
								onClick={() => onRetry(upload.id)}
								className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
							>
								<RotateCw size={12} />
								Retry
							</button>
						)}
					</>
				)}
			</div>
		</div>
	);
}

// ── Media thumbnail props ────────────────────────────────────────────────────

interface MediaThumbnailProps {
	attachment: DrillAttachment;
	onClick?: () => void;
	className?: string;
}

export default function MediaThumbnail({ attachment, onClick, className }: MediaThumbnailProps) {
	const isEmbed = attachment.fileType === "Video" && isEmbedUrl(attachment.fileUrl);
	const embedInfo = isEmbed ? parseEmbedUrl(attachment.fileUrl) : null;

	// Image thumbnail
	if (attachment.fileType === "Image") {
		return (
			<button
				type="button"
				onClick={onClick}
				className={`group relative flex-shrink-0 w-[140px] h-[100px] rounded-xl overflow-hidden cursor-pointer ${className || ""}`}
			>
				<img
					src={attachment.fileUrl}
					alt={attachment.fileName}
					className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
				/>
				<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
			</button>
		);
	}

	// Embed thumbnail (YouTube, Vimeo)
	if (isEmbed && embedInfo) {
		return (
			<button
				type="button"
				onClick={onClick}
				className={`group relative flex-shrink-0 w-[140px] h-[100px] rounded-xl overflow-hidden cursor-pointer ${className || ""}`}
			>
				{embedInfo.thumbnailUrl ? (
					<img
						src={embedInfo.thumbnailUrl}
						alt={attachment.fileName || "Video"}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
					/>
				) : (
					<div className="w-full h-full bg-skeleton flex items-center justify-center">
						<Film size={28} className="text-muted" />
					</div>
				)}
				<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
					<div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
						<Play size={20} className="text-white ml-0.5" fill="currentColor" />
					</div>
				</div>
				<div className="absolute bottom-1.5 left-1.5">
					<span className="text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded capitalize">
						{embedInfo.provider}
					</span>
				</div>
			</button>
		);
	}

	// Video file thumbnail
	if (attachment.fileType === "Video") {
		return (
			<button
				type="button"
				onClick={onClick}
				className={`group relative flex-shrink-0 w-[140px] h-[100px] rounded-xl overflow-hidden cursor-pointer bg-surface ${className || ""}`}
			>
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
					<div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
						<Play size={20} className="text-accent" />
					</div>
					<p className="text-[10px] text-muted truncate max-w-[120px] px-2">{attachment.fileName}</p>
				</div>
			</button>
		);
	}

	// Document thumbnail
	return (
		<a
			href={attachment.fileUrl}
			target="_blank"
			rel="noopener noreferrer"
			className={`group relative flex-shrink-0 w-[140px] h-[100px] rounded-xl overflow-hidden cursor-pointer bg-surface flex flex-col items-center justify-center gap-1.5 hover:bg-hover transition-colors ${className || ""}`}
		>
			<div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
				<FileText size={20} className="text-blue-400" />
			</div>
			<p className="text-[10px] text-muted truncate max-w-[120px] px-2">{attachment.fileName}</p>
			{attachment.fileSize > 0 && (
				<p className="text-[9px] text-muted/60">{formatFileSize(attachment.fileSize)}</p>
			)}
			<ExternalLink size={12} className="absolute top-2 right-2 text-muted/40 group-hover:text-muted transition-colors" />
		</a>
	);
}
