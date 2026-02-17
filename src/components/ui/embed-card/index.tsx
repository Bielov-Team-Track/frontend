"use client";

import { cn } from "@/lib/utils";
import type { EmbedInfo } from "@/components/ui/media-preview/types";
import { ExternalLink, Play, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export interface EmbedCardProps {
	url: string;
	embedInfo: EmbedInfo;
	title?: string | null;
	thumbnailUrl?: string | null;
	onDismiss?: () => void;
	variant?: "compact" | "default";
	className?: string;
	playable?: boolean;
}

function getProviderLabel(provider: string): string {
	switch (provider) {
		case "youtube":
			return "YouTube";
		case "vimeo":
			return "Vimeo";
		default:
			return "Video";
	}
}

function CompactVariant({ url, embedInfo, title, thumbnailUrl, onDismiss, className }: EmbedCardProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 rounded-lg border border-border bg-muted/10 px-3 py-2",
				className
			)}
		>
			{/* Thumbnail */}
			{thumbnailUrl && (
				<div className="relative h-10 w-16 flex-shrink-0 overflow-hidden rounded">
					<Image
						src={thumbnailUrl}
						alt={title || "Video thumbnail"}
						fill
						className="object-cover"
						sizes="64px"
					/>
				</div>
			)}

			{/* Info */}
			<div className="flex min-w-0 flex-1 flex-col">
				{title && (
					<span className="truncate text-sm font-medium text-foreground">
						{title}
					</span>
				)}
				<span className="text-xs text-muted-foreground">
					{getProviderLabel(embedInfo.provider)}
				</span>
			</div>

			{/* Actions */}
			<div className="flex flex-shrink-0 items-center gap-1">
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
					aria-label="Open link"
				>
					<ExternalLink size={14} />
				</a>
				{onDismiss && (
					<button
						type="button"
						onClick={onDismiss}
						className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
						aria-label="Dismiss"
					>
						<X size={14} />
					</button>
				)}
			</div>
		</div>
	);
}

function DefaultVariant({ url, embedInfo, title, thumbnailUrl, onDismiss, className, playable }: EmbedCardProps) {
	const [isPlaying, setIsPlaying] = useState(false);

	const iframeSrc = `${embedInfo.embedUrl}?autoplay=1&rel=0`;

	return (
		<div
			className={cn(
				"group relative overflow-hidden rounded-lg border border-border bg-muted/10",
				className
			)}
		>
			{/* Dismiss button */}
			{onDismiss && (
				<button
					type="button"
					onClick={onDismiss}
					className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
					aria-label="Dismiss"
				>
					<X size={14} />
				</button>
			)}

			{/* Thumbnail / Player area */}
			<div className="relative aspect-video w-full bg-black">
				{isPlaying ? (
					<iframe
						src={iframeSrc}
						title={title || "Embedded video"}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
						className="absolute inset-0 h-full w-full"
					/>
				) : (
					<>
						{thumbnailUrl && (
							<Image
								src={thumbnailUrl}
								alt={title || "Video thumbnail"}
								fill
								className="object-cover"
								sizes="(max-width: 640px) 100vw, 480px"
							/>
						)}
						{playable && (
							<button
								type="button"
								onClick={() => setIsPlaying(true)}
								className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
								aria-label="Play video"
							>
								<div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 transition-transform hover:scale-110">
									<Play size={28} className="ml-1 text-white" fill="currentColor" />
								</div>
							</button>
						)}
					</>
				)}
			</div>

			{/* Footer info */}
			<div className="flex items-center gap-2 px-3 py-2">
				<div className="flex min-w-0 flex-1 flex-col">
					{title && (
						<span className="truncate text-sm font-medium text-foreground">
							{title}
						</span>
					)}
					<span className="text-xs text-muted-foreground">
						{getProviderLabel(embedInfo.provider)}
					</span>
				</div>
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
					aria-label="Open link"
				>
					<ExternalLink size={14} />
				</a>
			</div>
		</div>
	);
}

export default function EmbedCard(props: EmbedCardProps) {
	const { variant = "default" } = props;

	if (variant === "compact") {
		return <CompactVariant {...props} />;
	}

	return <DefaultVariant {...props} />;
}
