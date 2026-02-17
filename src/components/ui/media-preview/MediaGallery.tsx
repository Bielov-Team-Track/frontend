"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import MediaLightbox from "./MediaLightbox";
import MediaThumbnail from "./MediaThumbnail";
import type { MediaGalleryProps } from "./types";

export default function MediaGallery({
	items,
	maxVisible = 20,
	thumbnailSize = "md",
	className,
}: MediaGalleryProps) {
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const [isOverflowing, setIsOverflowing] = useState(false);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const visibleItems = items.slice(0, maxVisible);
	const hiddenCount = items.length - maxVisible;
	const hasMore = hiddenCount > 0;

	// Check scroll position and overflow
	const updateScrollState = useCallback(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const isOverflow = container.scrollWidth > container.clientWidth;
		setIsOverflowing(isOverflow);
		setCanScrollLeft(container.scrollLeft > 0);
		setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
	}, []);

	// Detect overflow using ResizeObserver
	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		// Initial check
		updateScrollState();

		// Watch for size changes
		const resizeObserver = new ResizeObserver(updateScrollState);
		resizeObserver.observe(container);

		// Watch for scroll events
		container.addEventListener("scroll", updateScrollState);

		return () => {
			resizeObserver.disconnect();
			container.removeEventListener("scroll", updateScrollState);
		};
	}, [items.length, updateScrollState]);

	const handleThumbnailClick = useCallback((index: number) => {
		setLightboxIndex(index);
		setLightboxOpen(true);
	}, []);

	const handleCloseLightbox = useCallback(() => {
		setLightboxOpen(false);
	}, []);

	const scrollLeft = useCallback(() => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
		}
	}, []);

	const scrollRight = useCallback(() => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
		}
	}, []);

	if (items.length === 0) {
		return null;
	}

	return (
		<>
			<div data-testid="media-gallery" className={cn("relative", className)}>
				{/* Carousel navigation buttons */}
				{canScrollLeft && (
					<button
						type="button"
						onClick={scrollLeft}
						className={cn(
							"absolute left-0 top-1/2 -translate-y-1/2 z-10",
							"p-1.5 rounded-full",
							"bg-black/60 hover:bg-black/80",
							"text-white/80 hover:text-white",
							"transition-colors",
							"focus:outline-none focus:ring-2 focus:ring-primary"
						)}
						aria-label="Scroll left">
						<ChevronLeft size={16} />
					</button>
				)}
				{canScrollRight && (
					<button
						type="button"
						onClick={scrollRight}
						className={cn(
							"absolute right-0 top-1/2 -translate-y-1/2 z-10",
							"p-1.5 rounded-full",
							"bg-black/60 hover:bg-black/80",
							"text-white/80 hover:text-white",
							"transition-colors",
							"focus:outline-none focus:ring-2 focus:ring-primary"
						)}
						aria-label="Scroll right">
						<ChevronRight size={16} />
					</button>
				)}

				{/* Media items container */}
				<div
					ref={scrollContainerRef}
					className={cn(
						"flex gap-2 overflow-x-auto",
						isOverflowing
							? "scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent px-6"
							: "scrollbar-none"
					)}>
					{visibleItems.map((item, index) => {
						const isLastVisible = index === visibleItems.length - 1 && hasMore;

						return (
							<div key={item.id} data-testid="media-gallery-item" className="relative shrink-0">
								<MediaThumbnail
									item={item}
									size={thumbnailSize}
									onClick={() => handleThumbnailClick(index)}
								/>

								{/* "+X more" overlay on last visible item */}
								{isLastVisible && (
									<button
										type="button"
										onClick={() => handleThumbnailClick(index)}
										className={cn(
											"absolute inset-0 rounded-lg",
											"bg-black/60 hover:bg-black/70",
											"flex items-center justify-center",
											"transition-colors",
											"focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
										)}
										aria-label={`View ${hiddenCount} more items`}>
										<span className="text-white font-semibold text-lg">+{hiddenCount}</span>
									</button>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Lightbox */}
			<MediaLightbox
				items={items}
				initialIndex={lightboxIndex}
				isOpen={lightboxOpen}
				onClose={handleCloseLightbox}
			/>
		</>
	);
}
