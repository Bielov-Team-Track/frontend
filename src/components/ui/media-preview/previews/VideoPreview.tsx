"use client";

import { cn } from "@/lib/utils";
import type { VideoPreviewProps } from "../types";

export default function VideoPreview({ item, className }: VideoPreviewProps) {
	return (
		<div className={cn("w-full h-full flex items-center justify-center", className)}>
			<video
				src={item.url}
				poster={item.thumbnailUrl}
				controls
				preload="metadata"
				className="max-w-full max-h-full"
				playsInline>
				<track kind="captions" />
				Your browser does not support the video tag.
			</video>
		</div>
	);
}
