"use client";

import { Button, EmptyState, Loader } from "@/components";
import { FeedbackCard } from "@/components/features/player-development/FeedbackCard";
import { FeedbackDetailModal } from "@/components/features/player-development/FeedbackDetailModal";
import { FeedbackFormModal } from "@/components/features/feedback/FeedbackFormModal";
import { ListToolbar, ViewMode } from "@/components/ui/list-toolbar";
import { useMyGivenFeedbackInfinite } from "@/hooks/useFeedbackCoach";
import type { Feedback } from "@/lib/models/Feedback";
import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";

const PAGE_SIZE = 12;

export default function CoachingFeedbackPage() {
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
	const [showNewFeedback, setShowNewFeedback] = useState(false);
	const [feedbackRecipient, setFeedbackRecipient] = useState<{
		userId: string;
		name: string;
		imageUrl?: string;
		clubId?: string;
		clubName?: string;
	} | null>(null);

	const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useMyGivenFeedbackInfinite(PAGE_SIZE);

	const feedbackItems = data?.pages.flatMap((p) => p.items) ?? [];
	const totalCount = data?.pages[0]?.totalCount ?? 0;

	return (
		<div className="h-full flex flex-col space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between shrink-0">
				<div>
					<h2 className="text-lg font-semibold text-foreground">My Feedback</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Feedback you&apos;ve given to players ({totalCount} total)
					</p>
				</div>
				<Button onClick={() => setShowNewFeedback(true)}>
					New Feedback
				</Button>
			</div>

			{/* Toolbar (view toggle only, no search/sort) */}
			<ListToolbar
				count={feedbackItems.length}
				itemLabel="feedback"
				viewMode={viewMode}
				onViewModeChange={setViewMode}
				showViewToggle={true}
			/>

			{/* Content Area */}
			<div className="flex-1 min-h-0">
				{isLoading ? (
					<div className="flex flex-col items-center justify-center h-64">
						<Loader />
						<div className="text-muted-foreground">Loading feedback...</div>
					</div>
				) : feedbackItems.length === 0 ? (
					<EmptyState
						icon={MessageSquarePlus}
						title="No feedback yet"
						description="You haven't given any feedback to players yet. Click 'New Feedback' to get started."
					/>
				) : viewMode === "grid" ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{feedbackItems.map((feedback) => (
							<FeedbackCard
								key={feedback.id}
								feedback={feedback}
								viewMode={viewMode}
								perspective="coach"
								onClick={() => setSelectedFeedback(feedback)}
							/>
						))}
					</div>
				) : (
					<div className="space-y-2">
						{feedbackItems.map((feedback) => (
							<FeedbackCard
								key={feedback.id}
								feedback={feedback}
								viewMode={viewMode}
								perspective="coach"
								onClick={() => setSelectedFeedback(feedback)}
							/>
						))}
					</div>
				)}
			</div>

			{/* Load More */}
			{hasNextPage && !isLoading && (
				<div className="flex justify-center pt-4">
					<Button
						onClick={() => fetchNextPage()}
						variant="outline"
						disabled={isFetchingNextPage}
					>
						{isFetchingNextPage ? "Loading..." : "Load More"}
					</Button>
				</div>
			)}

			{/* Detail Modal */}
			<FeedbackDetailModal
				feedback={selectedFeedback}
				isOpen={!!selectedFeedback}
				onClose={() => setSelectedFeedback(null)}
			/>

			{/* New Feedback: Player Selector -> Form Modal */}
			{/* Phase 1: Just the form modal when recipient is selected */}
			{feedbackRecipient && (
				<FeedbackFormModal
					isOpen={!!feedbackRecipient}
					onClose={() => setFeedbackRecipient(null)}
					recipientUserId={feedbackRecipient.userId}
					recipientName={feedbackRecipient.name}
					recipientAvatarUrl={feedbackRecipient.imageUrl}
					clubId={feedbackRecipient.clubId}
					clubName={feedbackRecipient.clubName}
				/>
			)}
		</div>
	);
}
