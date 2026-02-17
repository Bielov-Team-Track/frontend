"use client";

import { cn } from "@/lib/utils";
import { thumbHashToBlurUrl } from "@/lib/utils/thumbhash";
import { AlertCircle, FileSpreadsheet, FileText, Image, Play, Presentation } from "lucide-react";
import { useMemo, useState } from "react";
import type { MediaThumbnailProps } from "./types";
import { getDocumentIconColor, getDocumentSubtype, getFileName } from "./utils";

// =============================================================================
// SIZE VARIANTS
// =============================================================================

const sizeStyles = {
	sm: "w-16 h-16",
	md: "w-24 h-24",
	lg: "w-32 h-32",
};

const iconSizes = {
	sm: 20,
	md: 28,
	lg: 36,
};

const playButtonSizes = {
	sm: "size-8",
	md: "size-10",
	lg: "size-12",
};

// =============================================================================
// DOCUMENT ICON COMPONENT
// =============================================================================

function DocumentIcon({ subtype, size }: { subtype: string; size: number }) {
	const colorClass = getDocumentIconColor(subtype as "pdf" | "word" | "excel" | "powerpoint" | "unknown");

	switch (subtype) {
		case "excel":
			return <FileSpreadsheet size={size} className={colorClass} />;
		case "powerpoint":
			return <Presentation size={size} className={colorClass} />;
		case "pdf":
		case "word":
		default:
			return <FileText size={size} className={colorClass} />;
	}
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function MediaThumbnail({ item, size = "md", onClick, className }: MediaThumbnailProps) {
	const fileName = getFileName(item);
	const iconSize = iconSizes[size];
	const [imageError, setImageError] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);
	const blurUrl = useMemo(() => thumbHashToBlurUrl(item.thumbHash), [item.thumbHash]);

	const renderContent = () => {
		switch (item.type) {
			case "image":
				if (imageError) {
					return (
						<div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 p-2">
							<AlertCircle size={iconSize} className="text-muted-foreground/50" />
							<span
								className={cn(
									"mt-1 text-muted-foreground text-center truncate w-full px-1 leading-tight",
									size === "sm" ? "text-[8px]" : size === "md" ? "text-[10px]" : "text-xs"
								)}>
								Failed to load
							</span>
						</div>
					);
				}
				return (
					<>
						{blurUrl && !imageLoaded && (
							<img
								src={blurUrl}
								alt=""
								className="absolute inset-0 w-full h-full object-cover"
								aria-hidden="true"
							/>
						)}
						<img
							src={item.thumbnailUrl || item.url}
							alt={fileName}
							className="w-full h-full object-cover"
							draggable={false}
							onLoad={() => setImageLoaded(true)}
							onError={() => setImageError(true)}
						/>
					</>
				);

			case "video":
				return (
					<>
						{/* Video thumbnail or placeholder */}
						{item.thumbnailUrl ? (
							<img
								src={item.thumbnailUrl}
								alt={fileName}
								className="w-full h-full object-cover"
								draggable={false}
							/>
						) : (
							<div className="w-full h-full bg-black/20 flex items-center justify-center">
								<Image size={iconSize} className="text-muted-foreground/50" />
							</div>
						)}

						{/* Play button overlay */}
						<div className="absolute inset-0 flex items-center justify-center">
							<div
								className={cn(
									"rounded-full bg-black/60 flex items-center justify-center",
									"group-hover:bg-black/80 transition-colors",
									playButtonSizes[size]
								)}>
								<Play size={iconSize * 0.6} className="text-white ml-0.5" fill="white" />
							</div>
						</div>
					</>
				);

			case "document": {
				const subtype = getDocumentSubtype(item);
				return (
					<div className="w-full h-full flex flex-col items-center justify-center p-2 bg-black/30">
						<DocumentIcon subtype={subtype} size={iconSize} />
						<span
							className={cn(
								"mt-1 text-muted-foreground text-center truncate w-full px-1 leading-tight",
								size === "sm" ? "text-[8px]" : size === "md" ? "text-[10px]" : "text-xs"
							)}>
							{fileName.length > 12 ? `${fileName.slice(0, 10)}...` : fileName}
						</span>
					</div>
				);
			}
		}
	};

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"relative group rounded-lg overflow-hidden",
				"border border-border hover:border-border/80",
				"bg-surface hover:bg-hover",
				"transition-all duration-200",
				"focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
				sizeStyles[size],
				className
			)}
			aria-label={`View ${fileName}`}>
			{renderContent()}

			{/* Hover overlay for images */}
			{item.type === "image" && (
				<div
					className={cn(
						"absolute inset-0 bg-black/0 group-hover:bg-black/20",
						"transition-colors duration-200"
					)}
				/>
			)}
		</button>
	);
}
