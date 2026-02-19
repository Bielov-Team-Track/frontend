"use client";

import { useState } from "react";
import { Button, EmptyState } from "@/components/ui";
import { FeedbackCard } from "@/components/features/player-development/FeedbackCard";
import { FeedbackDetailModal } from "@/components/features/player-development/FeedbackDetailModal";
import { useMyGivenFeedback } from "@/hooks/useFeedbackCoach";
import type { Feedback } from "@/lib/models/Feedback";
import { MessageSquare } from "lucide-react";

export default function CoachFeedbackPage() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useMyGivenFeedback(page, 20);
	const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

	const feedbackItems = data?.items ?? [];
	const totalCount = data?.totalCount ?? 0;
	const totalPages = Math.ceil(totalCount / 20);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-foreground">My Feedback</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Feedback you&apos;ve given to players ({totalCount} total)
					</p>
				</div>
			</div>

			{isLoading ? (
				<div className="space-y-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="h-32 rounded-lg bg-surface animate-pulse" />
					))}
				</div>
			) : feedbackItems.length === 0 ? (
				<EmptyState
					icon={MessageSquare}
					title="No feedback yet"
					description="You haven't given any feedback to players yet. Give feedback from an event page or club member profile."
				/>
			) : (
				<>
					<div className="space-y-4">
						{feedbackItems.map((feedback) => (
							<FeedbackCard
								key={feedback.id}
								feedback={feedback}
								viewMode="list"
								onClick={() => setSelectedFeedback(feedback)}
							/>
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex justify-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
							>
								Previous
							</Button>
							<span className="text-sm text-muted-foreground self-center">
								Page {page} of {totalPages}
							</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page === totalPages}
							>
								Next
							</Button>
						</div>
					)}
				</>
			)}

			{selectedFeedback && (
				<FeedbackDetailModal
					feedback={selectedFeedback}
					isOpen={!!selectedFeedback}
					onClose={() => setSelectedFeedback(null)}
				/>
			)}
		</div>
	);
}
