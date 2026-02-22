"use client";

import { Button, EmptyState, Loader } from "@/components";
import { FeedbackCard } from "@/components/features/player-development/FeedbackCard";
import { FeedbackDetailModal } from "@/components/features/player-development/FeedbackDetailModal";
import { FeedbackFormModal } from "@/components/features/feedback/FeedbackFormModal";
import { UserSelectorModal } from "@/components/features/users";
import { ListToolbar, ViewMode } from "@/components/ui/list-toolbar";
import { useMyGivenFeedbackInfinite } from "@/hooks/useFeedbackCoach";
import { useRoleSummary } from "@/hooks/useRoleSummary";
import { ClubRole, GroupRole, TeamRole } from "@/lib/models/Club";
import type { Feedback } from "@/lib/models/Feedback";
import type { UserProfile } from "@/lib/models/User";
import { useClub } from "@/providers";
import { MessageSquarePlus } from "lucide-react";
import { useMemo, useRef, useState } from "react";

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

	const { data: roleSummary } = useRoleSummary();
	const { clubs } = useClub();

	// Track the selected club from the UserSelector for feedback creation
	const selectedClubRef = useRef<{ id: string; name: string } | null>(null);

	// Filter clubs to only those where user is a coach
	const coachClubs = useMemo(() => {
		if (!roleSummary) return [];
		const coachClubIds = new Set<string>();

		// Club-level coaching roles (HeadCoach, Owner)
		roleSummary.clubs.forEach((club) => {
			if (club.roles.some((r) => r === ClubRole.HeadCoach || r === ClubRole.Owner)) {
				coachClubIds.add(club.clubId);
			}
		});

		// Group-level coaching roles -> include parent club
		roleSummary.groups.forEach((group) => {
			if (group.roles.some((r) => r === GroupRole.Coach || r === GroupRole.AssistantCoach)) {
				coachClubIds.add(group.clubId);
			}
		});

		// Team-level coaching roles -> include parent club
		roleSummary.teams.forEach((team) => {
			if (team.roles.some((r) => r === TeamRole.Coach || r === TeamRole.AssistantCoach)) {
				coachClubIds.add(team.clubId);
			}
		});

		return clubs.filter((c) => coachClubIds.has(c.id));
	}, [roleSummary, clubs]);

	const handlePlayerSelected = (users: UserProfile[]) => {
		if (users.length === 0) return;
		// NOTE: UserSelectorModal is multi-select by design (no maxSelections prop exists).
		// Only the first selected user is used for feedback. This is a known UX limitation —
		// if the user selects multiple players, only the first one gets feedback.
		const user = users[0];

		// Determine clubId: use the single coaching club if there's only one.
		// NOTE: selectedClubRef is declared for future use but currently never set,
		// because UserSelectorModal has no onClubChange callback. For multi-club coaches,
		// clubId will be undefined and the backend will reject the request (which is correct
		// behavior — the error toast will inform the user). A follow-up task should add an
		// onClubChange callback to UserSelectorModal to capture the selected club.
		const club = selectedClubRef.current
			?? (coachClubs.length === 1 ? { id: coachClubs[0].id, name: coachClubs[0].name } : null);

		setFeedbackRecipient({
			userId: user.id,
			name: `${user.name || ""} ${user.surname || ""}`.trim(),
			imageUrl: user.imageUrl,
			clubId: club?.id,
			clubName: club?.name,
		});
		setShowNewFeedback(false);
	};

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
			{showNewFeedback && (
				<UserSelectorModal
					isOpen={showNewFeedback}
					onClose={() => setShowNewFeedback(false)}
					selectedUsers={[]}
					onConfirm={handlePlayerSelected}
					title="Select Player"
					confirmLabel="Give Feedback"
					showFilters={true}
					{...(coachClubs.length === 1 ? { restrictToClub: coachClubs[0] } : {})}
					// TODO: When multiple coaching clubs, filter UserSelector club dropdown
					// to only show coachClubs. Requires adding a `clubFilter` prop to UserSelector.
					// Also needs an onClubChange callback to capture the selected club for feedback
					// creation (see selectedClubRef above). For now, backend rejects unauthorized
					// feedback attempts and missing clubId.
				/>
			)}

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
