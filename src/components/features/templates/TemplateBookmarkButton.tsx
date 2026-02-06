"use client";

import { Button } from "@/components";
import { useBookmarkTemplate, useUnbookmarkTemplate } from "@/hooks/useTemplates";
import { useAuth } from "@/providers";
import { Bookmark } from "lucide-react";
import { useState } from "react";

interface TemplateBookmarkButtonProps {
	templateId: string;
	/** Initial bookmarked state */
	isBookmarked?: boolean;
	/** Variant style */
	variant?: "default" | "compact";
}

export default function TemplateBookmarkButton({ templateId, isBookmarked: initialIsBookmarked = false, variant = "default" }: TemplateBookmarkButtonProps) {
	const { isAuthenticated } = useAuth();
	const bookmarkTemplate = useBookmarkTemplate();
	const unbookmarkTemplate = useUnbookmarkTemplate();

	// Local state for optimistic updates
	const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);

	const handleToggleBookmark = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!isAuthenticated) return;

		// Optimistic update
		const newIsBookmarked = !isBookmarked;
		setIsBookmarked(newIsBookmarked);

		try {
			if (newIsBookmarked) {
				await bookmarkTemplate.mutateAsync(templateId);
			} else {
				await unbookmarkTemplate.mutateAsync(templateId);
			}
		} catch (error) {
			// Revert on error
			setIsBookmarked(!newIsBookmarked);
			console.error("Failed to toggle bookmark:", error);
		}
	};

	if (variant === "compact") {
		return (
			<button
				onClick={handleToggleBookmark}
				disabled={!isAuthenticated}
				className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
			>
				<Bookmark size={14} className={isBookmarked ? "fill-accent text-accent" : ""} />
				<span className="hidden sm:inline">Bookmark</span>
			</button>
		);
	}

	return (
		<Button
			variant="ghost"
			color="neutral"
			size="sm"
			leftIcon={<Bookmark size={16} className={isBookmarked ? "fill-accent text-accent" : ""} />}
			onClick={handleToggleBookmark}
			disabled={!isAuthenticated}
		>
			<span className="hidden sm:inline">Bookmark</span>
		</Button>
	);
}
