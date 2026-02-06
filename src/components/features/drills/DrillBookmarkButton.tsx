"use client";

import { useBookmarkDrill, useMyBookmarkedDrills, useUnbookmarkDrill } from "@/hooks/useDrills";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers";
import { Bookmark, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface DrillBookmarkButtonProps {
	drillId: string;
	/** Initial bookmark state from drill data */
	initialIsBookmarked?: boolean;
	/** Variant style */
	variant?: "default" | "compact" | "icon-only";
	/** Custom class name */
	className?: string;
}

export default function DrillBookmarkButton({
	drillId,
	initialIsBookmarked,
	variant = "default",
	className,
}: DrillBookmarkButtonProps) {
	const { isAuthenticated } = useAuth();
	// Only fetch all bookmarks if we don't have initial state
	const shouldFetchBookmarks = isAuthenticated && initialIsBookmarked === undefined;
	const { data: bookmarks, isLoading: isLoadingBookmarks } = useMyBookmarkedDrills(shouldFetchBookmarks);
	const bookmarkMutation = useBookmarkDrill();
	const unbookmarkMutation = useUnbookmarkDrill();

	// Optimistic state
	const [optimisticBookmarked, setOptimisticBookmarked] = useState<boolean | null>(null);

	// Check if drill is bookmarked from server data
	const isBookmarkedFromServer = useMemo(() => {
		// If we have initial state, use it
		if (initialIsBookmarked !== undefined) return initialIsBookmarked;
		// Otherwise check the bookmarks list
		if (!bookmarks) return false;
		return bookmarks.some((b) => b.id === drillId);
	}, [bookmarks, drillId, initialIsBookmarked]);

	// Reset optimistic state when server data arrives
	useEffect(() => {
		if (bookmarks || initialIsBookmarked !== undefined) {
			setOptimisticBookmarked(null);
		}
	}, [bookmarks, initialIsBookmarked]);

	const isBookmarked = optimisticBookmarked ?? isBookmarkedFromServer;
	const isLoading = bookmarkMutation.isPending || unbookmarkMutation.isPending;

	const handleClick = async () => {
		if (!isAuthenticated) {
			// Could show a login prompt here
			return;
		}

		// Optimistic update
		const newBookmarked = !isBookmarked;
		setOptimisticBookmarked(newBookmarked);

		try {
			if (newBookmarked) {
				await bookmarkMutation.mutateAsync(drillId);
			} else {
				await unbookmarkMutation.mutateAsync(drillId);
			}
		} catch {
			// Revert on error
			setOptimisticBookmarked(null);
		}
	};

	if (variant === "icon-only") {
		return (
			<button
				onClick={handleClick}
				disabled={isLoading || isLoadingBookmarks}
				className={cn(
					"p-2 rounded-lg transition-all",
					isBookmarked
						? "text-accent bg-accent/10 hover:bg-accent/20"
						: "text-muted hover:text-accent hover:bg-hover",
					(isLoading || isLoadingBookmarks) && "opacity-50 cursor-not-allowed",
					className
				)}
				title={isBookmarked ? "Remove bookmark" : "Bookmark"}
			>
				{isLoading ? (
					<Loader2 size={18} className="animate-spin" />
				) : (
					<Bookmark size={18} className={isBookmarked ? "fill-current" : ""} />
				)}
			</button>
		);
	}

	if (variant === "compact") {
		return (
			<button
				onClick={handleClick}
				disabled={isLoading || isLoadingBookmarks}
				className={cn(
					"flex items-center gap-1.5 text-xs font-medium transition-colors",
					isBookmarked ? "text-accent" : "text-muted hover:text-accent",
					(isLoading || isLoadingBookmarks) && "opacity-50 cursor-not-allowed",
					className
				)}
			>
				{isLoading ? (
					<Loader2 size={14} className="animate-spin" />
				) : (
					<Bookmark size={14} className={isBookmarked ? "fill-current" : ""} />
				)}
				<span className="hidden sm:inline">{isBookmarked ? "Saved" : "Save"}</span>
			</button>
		);
	}

	// Default variant
	return (
		<button
			onClick={handleClick}
			disabled={isLoading || isLoadingBookmarks}
			className={cn(
				"flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
				isBookmarked
					? "bg-accent/10 text-accent hover:bg-accent/20"
					: "bg-surface text-muted hover:text-white hover:bg-hover",
				(isLoading || isLoadingBookmarks) && "opacity-50 cursor-not-allowed",
				className
			)}
		>
			{isLoading ? (
				<Loader2 size={16} className="animate-spin" />
			) : (
				<Bookmark size={16} className={isBookmarked ? "fill-current" : ""} />
			)}
			<span>{isBookmarked ? "Saved" : "Save"}</span>
		</button>
	);
}
