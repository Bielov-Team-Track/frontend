"use client";

import { Post } from "@/lib/models/Post";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Pin } from "lucide-react";
import { useRef, useState } from "react";
import PostCard from "./PostCard";

interface PinnedPostsCarouselProps {
	posts: Post[];
	onEdit?: (post: Post) => void;
	onDelete?: (postId: string) => void;
	onUnpin?: (postId: string) => void;
}

export default function PinnedPostsCarousel({ posts, onEdit, onDelete, onUnpin }: PinnedPostsCarouselProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(posts.length > 1);

	const checkScroll = () => {
		if (!scrollRef.current) return;
		const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
		setCanScrollLeft(scrollLeft > 0);
		setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
	};

	const scroll = (direction: "left" | "right") => {
		if (!scrollRef.current) return;
		const scrollAmount = scrollRef.current.clientWidth * 0.8;
		scrollRef.current.scrollBy({
			left: direction === "left" ? -scrollAmount : scrollAmount,
			behavior: "smooth",
		});
	};

	if (posts.length === 0) return null;

	return (
		<div className="relative">
			{/* Header */}
			<div className="flex items-center gap-2 mb-3">
				<Pin size={16} className="text-primary" />
				<h3 className="text-sm font-medium text-white">Pinned Posts</h3>
			</div>

			{/* Carousel */}
			<div className="relative group">
				{/* Left arrow */}
				{canScrollLeft && (
					<button
						onClick={() => scroll("left")}
						className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
						<ChevronLeft size={20} />
					</button>
				)}

				{/* Posts container */}
				<div
					ref={scrollRef}
					onScroll={checkScroll}
					className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
					style={{ scrollSnapType: "x mandatory" }}>
					{posts.map((post) => (
						<div key={post.id} className="flex-shrink-0 w-full max-w-md" style={{ scrollSnapAlign: "start" }}>
							<PostCard post={post} onEdit={onEdit} onDelete={onDelete} onUnpin={onUnpin} showUnpin />
						</div>
					))}
				</div>

				{/* Right arrow */}
				{canScrollRight && (
					<button
						onClick={() => scroll("right")}
						className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
						<ChevronRight size={20} />
					</button>
				)}
			</div>

			{/* Dots indicator */}
			{posts.length > 1 && (
				<div className="flex justify-center gap-1.5 mt-3">
					{posts.map((_, idx) => (
						<div key={idx} className={cn("w-1.5 h-1.5 rounded-full transition-colors", idx === 0 ? "bg-primary" : "bg-white/20")} />
					))}
				</div>
			)}
		</div>
	);
}
