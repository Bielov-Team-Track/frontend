"use client";

import { useLikeDrill, useLikeStatus, useUnlikeDrill } from "@/hooks/useDrills";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers";
import { Heart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface DrillLikeButtonProps {
	drillId: string;
	/** Initial like count from drill data */
	initialLikeCount?: number;
	/** Variant style */
	variant?: "default" | "compact" | "icon-only";
	/** Custom class name */
	className?: string;
}

export default function DrillLikeButton({
	drillId,
	initialLikeCount = 0,
	variant = "default",
	className,
}: DrillLikeButtonProps) {
	const { isAuthenticated } = useAuth();
	const { data: likeStatus, isLoading: isLoadingStatus } = useLikeStatus(drillId, isAuthenticated);
	const likeMutation = useLikeDrill();
	const unlikeMutation = useUnlikeDrill();

	// Optimistic state
	const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
	const [optimisticCount, setOptimisticCount] = useState<number | null>(null);

	// Reset optimistic state when server data arrives
	useEffect(() => {
		if (likeStatus) {
			setOptimisticLiked(null);
			setOptimisticCount(null);
		}
	}, [likeStatus]);

	const isLiked = optimisticLiked ?? likeStatus?.isLiked ?? false;
	const likeCount = optimisticCount ?? likeStatus?.likeCount ?? initialLikeCount;
	const isLoading = likeMutation.isPending || unlikeMutation.isPending;

	const handleClick = async () => {
		if (!isAuthenticated) {
			// Could show a login prompt here
			return;
		}

		// Optimistic update
		const newLiked = !isLiked;
		setOptimisticLiked(newLiked);
		setOptimisticCount(likeCount + (newLiked ? 1 : -1));

		try {
			if (newLiked) {
				await likeMutation.mutateAsync(drillId);
			} else {
				await unlikeMutation.mutateAsync(drillId);
			}
		} catch {
			// Revert on error
			setOptimisticLiked(null);
			setOptimisticCount(null);
		}
	};

	if (variant === "icon-only") {
		return (
			<button
				onClick={handleClick}
				disabled={isLoading || isLoadingStatus}
				className={cn(
					"p-2 rounded-lg transition-all",
					isLiked
						? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
						: "text-muted hover:text-red-500 hover:bg-hover",
					(isLoading || isLoadingStatus) && "opacity-50 cursor-not-allowed",
					className
				)}
				title={isLiked ? "Unlike" : "Like"}
			>
				{isLoading ? (
					<Loader2 size={18} className="animate-spin" />
				) : (
					<Heart size={18} className={isLiked ? "fill-current" : ""} />
				)}
			</button>
		);
	}

	if (variant === "compact") {
		return (
			<button
				onClick={handleClick}
				disabled={isLoading || isLoadingStatus}
				className={cn(
					"flex items-center gap-1.5 text-xs font-medium transition-colors",
					isLiked ? "text-red-500" : "text-muted hover:text-red-500",
					(isLoading || isLoadingStatus) && "opacity-50 cursor-not-allowed",
					className
				)}
			>
				{isLoading ? (
					<Loader2 size={14} className="animate-spin" />
				) : (
					<Heart size={14} className={isLiked ? "fill-current" : ""} />
				)}
				{likeCount > 0 && <span>{likeCount}</span>}
			</button>
		);
	}

	// Default variant
	return (
		<button
			onClick={handleClick}
			disabled={isLoading || isLoadingStatus}
			className={cn(
				"flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
				isLiked
					? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
					: "bg-surface text-muted hover:text-white hover:bg-hover",
				(isLoading || isLoadingStatus) && "opacity-50 cursor-not-allowed",
				className
			)}
		>
			{isLoading ? (
				<Loader2 size={16} className="animate-spin" />
			) : (
				<Heart size={16} className={isLiked ? "fill-current" : ""} />
			)}
			<span>{likeCount > 0 ? likeCount : ""}</span>
			<span className="hidden sm:inline">{isLiked ? "Liked" : "Like"}</span>
		</button>
	);
}
