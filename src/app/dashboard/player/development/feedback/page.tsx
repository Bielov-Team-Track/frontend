"use client";

import { Button, EmptyState, Loader } from "@/components";
import { FeedbackCard } from "@/components/features/player-development/FeedbackCard";
import { FeedbackDetailModal } from "@/components/features/player-development/FeedbackDetailModal";
import { ListToolbar, ViewMode } from "@/components/ui/list-toolbar";
import { useMyFeedback } from "@/hooks/useFeedback";
import { Feedback } from "@/lib/models/Feedback";
import { useFeedbackById } from "@/hooks/useFeedback";
import { MessageSquare } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PAGE_SIZE = 12;

export default function PlayerFeedbackPage() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [sort, setSort] = useState("newest");
	const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

	// Auto-open modal if ?id= query param is present
	const searchParams = useSearchParams();
	const feedbackIdParam = searchParams.get("id");
	const { data: linkedFeedback } = useFeedbackById(feedbackIdParam || undefined);

	useEffect(() => {
		if (linkedFeedback && !selectedFeedback) {
			setSelectedFeedback(linkedFeedback);
		}
	}, [linkedFeedback]);

	const { data, isLoading } = useMyFeedback(page, PAGE_SIZE);

	// Client-side filtering
	const filteredFeedback = (data?.items || []).filter((feedback) => {
		if (!search) return true;
		const searchLower = search.toLowerCase();

		// Search by comment
		if (feedback.comment?.toLowerCase().includes(searchLower)) return true;

		// Search by improvement point descriptions
		if (
			feedback.improvementPoints.some((point) =>
				point.description.toLowerCase().includes(searchLower)
			)
		)
			return true;

		// Search by praise message
		if (feedback.praise?.message.toLowerCase().includes(searchLower)) return true;

		return false;
	});

	// Client-side sorting
	const sortedFeedback = [...filteredFeedback].sort((a, b) => {
		if (sort === "oldest") {
			return (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0);
		}
		// Default: newest first
		return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
	});

	const hasMore = (data?.totalCount || 0) > page * PAGE_SIZE;

	const handleLoadMore = () => {
		setPage((prev) => prev + 1);
	};

	return (
		<div className="h-full flex flex-col space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between shrink-0">
				<h2 className="text-lg font-semibold text-foreground">My Feedback</h2>
			</div>

			{/* Toolbar */}
			<ListToolbar
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search feedback..."
				count={sortedFeedback.length}
				itemLabel="feedback"
				viewMode={viewMode}
				onViewModeChange={setViewMode}
				showViewToggle={true}
				sortOptions={[
					{ value: "newest", label: "Newest First" },
					{ value: "oldest", label: "Oldest First" },
				]}
				sortBy={sort}
				onSortChange={setSort}
			/>

			{/* Content Area */}
			<div className="flex-1 min-h-0">
				{isLoading ? (
					<div className="flex flex-col items-center justify-center h-64">
						<Loader />
						<div className="text-muted-foreground">Loading feedback...</div>
					</div>
				) : sortedFeedback.length === 0 ? (
					<EmptyState
						icon={MessageSquare}
						title="No feedback found"
						description={
							search
								? "We couldn't find any feedback matching your search. Try adjusting your search terms."
								: "You haven't received any feedback yet. Your coaches will provide feedback on your performance and areas for improvement."
						}
					/>
				) : viewMode === "grid" ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{sortedFeedback.map((feedback) => (
							<FeedbackCard
								key={feedback.id}
								feedback={feedback}
								viewMode={viewMode}
								onClick={() => setSelectedFeedback(feedback)}
							/>
						))}
					</div>
				) : (
					<div className="space-y-2">
						{sortedFeedback.map((feedback) => (
							<FeedbackCard
								key={feedback.id}
								feedback={feedback}
								viewMode={viewMode}
								onClick={() => setSelectedFeedback(feedback)}
							/>
						))}
					</div>
				)}
			</div>

			{/* Load More */}
			{hasMore && !isLoading && (
				<div className="flex justify-center pt-4">
					<Button onClick={handleLoadMore} variant="outline">
						Load More
					</Button>
				</div>
			)}

			{/* Detail Modal */}
			<FeedbackDetailModal
				feedback={selectedFeedback}
				isOpen={!!selectedFeedback}
				onClose={() => setSelectedFeedback(null)}
			/>
		</div>
	);
}
