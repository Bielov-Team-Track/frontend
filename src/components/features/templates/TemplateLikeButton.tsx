"use client";

import { Button } from "@/components";
import { usePlanLikeStatus, useLikePlan, useUnlikePlan } from "@/hooks/useTemplates";
import { useAuth } from "@/providers";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface TemplateLikeButtonProps {
	templateId: string;
	/** Initial like count from template data */
	initialLikeCount?: number;
	/** Variant style */
	variant?: "default" | "compact";
}

export default function TemplateLikeButton({ templateId, initialLikeCount = 0, variant = "default" }: TemplateLikeButtonProps) {
	const { isAuthenticated } = useAuth();
	const { data: likeStatus } = usePlanLikeStatus(templateId, isAuthenticated);
	const likePlanMutation = useLikePlan();
	const unlikePlanMutation = useUnlikePlan();

	// Local state for optimistic updates
	const [isLiked, setIsLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(initialLikeCount);

	// Sync with server state
	useEffect(() => {
		if (likeStatus) {
			setIsLiked(likeStatus.isLiked);
			setLikeCount(likeStatus.likeCount);
		}
	}, [likeStatus]);

	const handleToggleLike = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!isAuthenticated) return;

		// Optimistic update
		const newIsLiked = !isLiked;
		setIsLiked(newIsLiked);
		setLikeCount((prev) => (newIsLiked ? prev + 1 : Math.max(0, prev - 1)));

		try {
			if (newIsLiked) {
				await likePlanMutation.mutateAsync(templateId);
			} else {
				await unlikePlanMutation.mutateAsync(templateId);
			}
		} catch (error) {
			// Revert on error
			setIsLiked(!newIsLiked);
			setLikeCount((prev) => (newIsLiked ? Math.max(0, prev - 1) : prev + 1));
			console.error("Failed to toggle like:", error);
		}
	};

	if (variant === "compact") {
		return (
			<button
				onClick={handleToggleLike}
				disabled={!isAuthenticated}
				className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
			>
				<Heart size={14} className={isLiked ? "fill-red-500 text-red-500" : ""} />
				{likeCount > 0 && <span>{likeCount}</span>}
				<span className="hidden sm:inline">Like</span>
			</button>
		);
	}

	return (
		<Button
			variant="ghost"
			color="neutral"
			size="sm"
			leftIcon={<Heart size={16} className={isLiked ? "fill-red-500 text-red-500" : ""} />}
			onClick={handleToggleLike}
			disabled={!isAuthenticated}
		>
			{likeCount > 0 && <span>{likeCount}</span>}
			<span className="hidden sm:inline">Like</span>
		</Button>
	);
}
