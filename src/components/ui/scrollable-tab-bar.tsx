"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ScrollableTabBarProps {
	children: React.ReactNode;
	className?: string;
}

export default function ScrollableTabBar({ children, className }: ScrollableTabBarProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const checkScroll = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		setCanScrollLeft(el.scrollLeft > 2);
		setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
	}, []);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		checkScroll();
		el.addEventListener("scroll", checkScroll, { passive: true });

		const observer = new ResizeObserver(checkScroll);
		observer.observe(el);

		return () => {
			el.removeEventListener("scroll", checkScroll);
			observer.disconnect();
		};
	}, [checkScroll]);

	const scroll = (direction: "left" | "right") => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollBy({ left: direction === "left" ? -120 : 120, behavior: "smooth" });
	};

	return (
		<div className={`relative border-t border-border ${className ?? ""}`}>
			{/* Left fade + chevron */}
			{canScrollLeft && (
				<button
					onClick={() => scroll("left")}
					className="absolute left-0 top-0 bottom-0 z-10 flex items-center pl-1 pr-2 bg-gradient-to-r from-surface via-surface/80 to-transparent sm:hidden"
					aria-label="Scroll tabs left"
				>
					<ChevronLeft size={16} className="text-muted" />
				</button>
			)}

			{/* Scrollable area */}
			<div ref={scrollRef} className="overflow-x-auto no-scrollbar px-6">
				<div className="flex gap-1">{children}</div>
			</div>

			{/* Right fade + chevron */}
			{canScrollRight && (
				<button
					onClick={() => scroll("right")}
					className="absolute right-0 top-0 bottom-0 z-10 flex items-center pr-1 pl-2 bg-gradient-to-l from-surface via-surface/80 to-transparent sm:hidden"
					aria-label="Scroll tabs right"
				>
					<ChevronRight size={16} className="text-muted" />
				</button>
			)}
		</div>
	);
}
