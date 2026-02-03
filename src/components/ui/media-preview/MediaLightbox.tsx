"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Download, X, ZoomIn, ZoomOut, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AnimationPreview from "./previews/AnimationPreview";
import DocumentPreview from "./previews/DocumentPreview";
import EmbedPreview from "./previews/EmbedPreview";
import ImagePreview from "./previews/ImagePreview";
import VideoPreview from "./previews/VideoPreview";
import type { MediaLightboxProps, MediaItem } from "./types";
import { getFileName } from "./utils";

// =============================================================================
// THUMBNAIL RENDERING
// =============================================================================

function renderThumbnail(item: MediaItem) {
	// Image or has thumbnail URL
	if (item.type === "image" || item.thumbnailUrl) {
		return (
			<img
				src={item.thumbnailUrl || item.url}
				alt={getFileName(item)}
				className="w-full h-full object-cover"
				draggable={false}
			/>
		);
	}

	// Animation - render first frame as mini thumbnail
	if (item.type === "animation" && item.animation?.keyframes?.[0]) {
		return (
			<div className="w-full h-full bg-green-800 flex items-center justify-center">
				<Play size={16} className="text-white/70" />
			</div>
		);
	}

	// Embed with thumbnail
	if (item.type === "embed" && item.embedInfo?.thumbnailUrl) {
		return (
			<>
				<img
					src={item.embedInfo.thumbnailUrl}
					alt={getFileName(item)}
					className="w-full h-full object-cover"
					draggable={false}
				/>
				<div className="absolute inset-0 flex items-center justify-center bg-black/30">
					<Play size={14} className="text-white" fill="white" />
				</div>
			</>
		);
	}

	// Fallback labels
	const typeLabels: Record<string, string> = {
		video: "VID",
		document: "DOC",
		embed: "EMB",
		animation: "ANIM",
	};

	return (
		<div className="w-full h-full bg-white/10 flex items-center justify-center text-xs text-white/60">
			{typeLabels[item.type] || "?"}
		</div>
	);
}

// =============================================================================
// THUMBNAIL STRIP
// =============================================================================

interface ThumbnailStripProps {
	items: MediaLightboxProps["items"];
	currentIndex: number;
	onSelect: (index: number) => void;
}

function ThumbnailStrip({ items, currentIndex, onSelect }: ThumbnailStripProps) {
	const stripRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to keep current thumbnail visible
	useEffect(() => {
		if (!stripRef.current) return;

		const thumbnails = stripRef.current.children;
		if (thumbnails[currentIndex]) {
			(thumbnails[currentIndex] as HTMLElement).scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "center",
			});
		}
	}, [currentIndex]);

	return (
		<div
			ref={stripRef}
			className={cn(
				"flex gap-2 p-2 overflow-x-auto scrollbar-thin",
				"bg-black/40 backdrop-blur-sm rounded-lg",
				"max-w-[90vw] mx-auto"
			)}>
			{items.map((item, index) => (
				<button
					key={item.id}
					type="button"
					onClick={() => onSelect(index)}
					className={cn(
						"relative shrink-0 w-12 h-12 rounded overflow-hidden",
						"transition-all duration-200",
						"focus:outline-none focus:ring-2 focus:ring-primary",
						index === currentIndex
							? "ring-2 ring-primary opacity-100"
							: "opacity-60 hover:opacity-100"
					)}>
					{renderThumbnail(item)}
				</button>
			))}
		</div>
	);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function MediaLightbox({ items, initialIndex = 0, isOpen, onClose }: MediaLightboxProps) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex);
	const [isZoomed, setIsZoomed] = useState(false);
	const [mounted, setMounted] = useState(false);
	const overlayRef = useRef<HTMLDivElement>(null);

	// Track client-side mounting for Portal
	useEffect(() => {
		setMounted(true);
	}, []);

	// Reset state when opening
	useEffect(() => {
		if (isOpen) {
			setCurrentIndex(initialIndex);
			setIsZoomed(false);
		}
	}, [isOpen, initialIndex]);

	// Lock body scroll when open
	useEffect(() => {
		if (isOpen) {
			const originalOverflow = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			return () => {
				document.body.style.overflow = originalOverflow;
			};
		}
	}, [isOpen]);

	// Navigation handlers
	const goToPrevious = useCallback(() => {
		setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
		setIsZoomed(false);
	}, [items.length]);

	const goToNext = useCallback(() => {
		setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
		setIsZoomed(false);
	}, [items.length]);

	// Keyboard navigation
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case "Escape":
					onClose();
					break;
				case "ArrowLeft":
					goToPrevious();
					break;
				case "ArrowRight":
					goToNext();
					break;
				case " ":
					e.preventDefault();
					// Toggle zoom for images
					const item = items[currentIndex];
					if (item?.type === "image") {
						setIsZoomed((prev) => !prev);
					}
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose, goToPrevious, goToNext, items, currentIndex]);

	// Touch swipe support
	const touchStartX = useRef<number | null>(null);

	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX;
	}, []);

	const handleTouchEnd = useCallback(
		(e: React.TouchEvent) => {
			if (touchStartX.current === null) return;

			const touchEndX = e.changedTouches[0].clientX;
			const diff = touchStartX.current - touchEndX;

			// Minimum swipe distance
			if (Math.abs(diff) > 50) {
				if (diff > 0) {
					goToNext();
				} else {
					goToPrevious();
				}
			}

			touchStartX.current = null;
		},
		[goToNext, goToPrevious]
	);

	// Download handler
	const handleDownload = useCallback(() => {
		const item = items[currentIndex];
		if (!item) return;

		const link = document.createElement("a");
		link.href = item.url;
		link.download = getFileName(item);
		link.target = "_blank";
		link.rel = "noopener noreferrer";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}, [items, currentIndex]);

	if (!isOpen || items.length === 0 || !mounted) {
		return null;
	}

	const currentItem = items[currentIndex];
	const fileName = getFileName(currentItem);
	const showThumbnailStrip = items.length > 3;
	const showNavigation = items.length > 1;

	const lightboxContent = (
		<div
			ref={overlayRef}
			className={cn(
				"fixed inset-0 z-50",
				"bg-black/80 backdrop-blur-sm",
				"flex flex-col",
				"animate-in fade-in duration-200"
			)}
			onClick={onClose}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			role="dialog"
			aria-modal="true"
			aria-label="Media lightbox">
			{/* Header */}
			<header className="flex items-center justify-between px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
				{/* Counter and filename */}
				<div className="flex items-center gap-3 min-w-0">
					{showNavigation && (
						<span className="text-sm text-white/70 shrink-0">
							{currentIndex + 1} / {items.length}
						</span>
					)}
					<span className="text-sm text-white truncate">{fileName}</span>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-1 shrink-0">
					{/* Zoom toggle (images only) */}
					{currentItem.type === "image" && (
						<button
							type="button"
							onClick={() => setIsZoomed((prev) => !prev)}
							className={cn(
								"p-2 rounded-lg",
								"text-white/70 hover:text-white hover:bg-white/10",
								"transition-colors",
								"focus:outline-none focus:ring-2 focus:ring-primary"
							)}
							aria-label={isZoomed ? "Zoom out" : "Zoom in"}>
							{isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
						</button>
					)}

					{/* Download (hide for embeds and animations) */}
					{currentItem.type !== "embed" && currentItem.type !== "animation" && (
						<button
							type="button"
							onClick={handleDownload}
							className={cn(
								"p-2 rounded-lg",
								"text-white/70 hover:text-white hover:bg-white/10",
								"transition-colors",
								"focus:outline-none focus:ring-2 focus:ring-primary"
							)}
							aria-label="Download">
							<Download size={20} />
						</button>
					)}

					{/* Close */}
					<button
						type="button"
						onClick={onClose}
						className={cn(
							"p-2 rounded-lg",
							"text-white/70 hover:text-white hover:bg-white/10",
							"transition-colors",
							"focus:outline-none focus:ring-2 focus:ring-primary"
						)}
						aria-label="Close">
						<X size={20} />
					</button>
				</div>
			</header>

			{/* Main content area */}
			<div className="flex-1 relative min-h-0 flex items-center justify-center px-12 md:px-16">
				{/* Previous button */}
				{showNavigation && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							goToPrevious();
						}}
						className={cn(
							"absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10",
							"p-2 md:p-3 rounded-full",
							"bg-black/40 hover:bg-black/60",
							"text-white/70 hover:text-white",
							"transition-colors",
							"focus:outline-none focus:ring-2 focus:ring-primary",
							"min-w-[44px] min-h-[44px] flex items-center justify-center"
						)}
						aria-label="Previous">
						<ChevronLeft size={24} />
					</button>
				)}

				{/* Media content */}
				<div className="w-full h-full max-w-[90vw] max-h-[70vh] md:max-h-[75vh]" onClick={(e) => e.stopPropagation()}>
					{currentItem.type === "image" && <ImagePreview item={currentItem} />}
					{currentItem.type === "video" && <VideoPreview item={currentItem} />}
					{currentItem.type === "document" && <DocumentPreview item={currentItem} />}
					{currentItem.type === "embed" && <EmbedPreview item={currentItem} autoPlay />}
					{currentItem.type === "animation" && <AnimationPreview item={currentItem} showControls />}
				</div>

				{/* Next button */}
				{showNavigation && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							goToNext();
						}}
						className={cn(
							"absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10",
							"p-2 md:p-3 rounded-full",
							"bg-black/40 hover:bg-black/60",
							"text-white/70 hover:text-white",
							"transition-colors",
							"focus:outline-none focus:ring-2 focus:ring-primary",
							"min-w-[44px] min-h-[44px] flex items-center justify-center"
						)}
						aria-label="Next">
						<ChevronRight size={24} />
					</button>
				)}
			</div>

			{/* Thumbnail strip */}
			{showThumbnailStrip && (
				<div className="shrink-0 py-3 px-4 safe-area-inset-bottom" onClick={(e) => e.stopPropagation()}>
					<ThumbnailStrip items={items} currentIndex={currentIndex} onSelect={setCurrentIndex} />
				</div>
			)}
		</div>
	);

	// Use Portal to render at document body level for proper fullscreen positioning
	return createPortal(lightboxContent, document.body);
}
