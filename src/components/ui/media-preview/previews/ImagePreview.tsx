"use client";

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { ImagePreviewProps } from "../types";

export default function ImagePreview({ item, className }: ImagePreviewProps) {
	const [isZoomed, setIsZoomed] = useState(false);
	const [position, setPosition] = useState({ x: 50, y: 50 });
	const [imageError, setImageError] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const handleClick = useCallback(() => {
		setIsZoomed((prev) => !prev);
		// Reset position when toggling zoom
		if (isZoomed) {
			setPosition({ x: 50, y: 50 });
		}
	}, [isZoomed]);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (!isZoomed || !containerRef.current) return;

			const rect = containerRef.current.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width) * 100;
			const y = ((e.clientY - rect.top) / rect.height) * 100;

			setPosition({ x, y });
		},
		[isZoomed]
	);

	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key === " " || e.key === "Enter") {
			e.preventDefault();
			setIsZoomed((prev) => !prev);
		}
	}, []);

	if (imageError) {
		return (
			<div
				className={cn(
					"relative w-full h-full flex flex-col items-center justify-center",
					"bg-muted/20 rounded-lg",
					className
				)}>
				<AlertCircle size={48} className="text-muted-foreground/50 mb-3" />
				<p className="text-muted-foreground text-sm">Failed to load image</p>
				<p className="text-muted-foreground/60 text-xs mt-1">{item.fileName || "Unknown file"}</p>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className={cn(
				"relative w-full h-full overflow-hidden flex items-center justify-center",
				isZoomed ? "cursor-zoom-out" : "cursor-zoom-in",
				className
			)}
			onClick={handleClick}
			onMouseMove={handleMouseMove}
			onKeyDown={handleKeyDown}
			role="button"
			tabIndex={0}
			aria-label={isZoomed ? "Click to zoom out" : "Click to zoom in"}>
			<img
				src={item.url}
				alt={item.fileName || "Image preview"}
				className={cn(
					"max-w-full max-h-full object-contain transition-transform duration-200 select-none",
					isZoomed && "scale-[2]"
				)}
				style={
					isZoomed
						? {
								transformOrigin: `${position.x}% ${position.y}%`,
							}
						: undefined
				}
				draggable={false}
				onError={() => setImageError(true)}
			/>
		</div>
	);
}
