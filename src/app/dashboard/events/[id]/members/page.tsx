"use client";

import { Avatar, Button, DropdownMenu, EmptyState, Input } from "@/components";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserSelectorModal } from "@/components/features/users";
import { inviteUsers } from "@/lib/api/events";
import { UserProfile } from "@/lib/models/User";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Filter, Search, UserMinus, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useEventContext } from "../layout";

// Status values as returned by the API (strings)
type ParticipantStatus = "Invited" | "Waitlisted" | "Accepted" | "Declined" | "Attended" | "NoShow";
type StatusFilter = "all" | ParticipantStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
	{ value: "all", label: "All Statuses" },
	{ value: "Accepted", label: "Accepted" },
	{ value: "Invited", label: "Invited" },
	{ value: "Waitlisted", label: "Waitlisted" },
	{ value: "Declined", label: "Declined" },
	{ value: "Attended", label: "Attended" },
	{ value: "NoShow", label: "No Show" },
];

const getStatusLabel = (status: string): string => {
	switch (status) {
		case "Invited":
			return "Invited";
		case "Waitlisted":
			return "Waitlisted";
		case "Accepted":
			return "Accepted";
		case "Declined":
			return "Declined";
		case "Attended":
			return "Attended";
		case "NoShow":
			return "No Show";
		default:
			return status || "Unknown";
	}
};

const getStatusColor = (status: string): string => {
	switch (status) {
		case "Invited":
			return "bg-info/20 text-info border-info/30";
		case "Waitlisted":
			return "bg-warning/20 text-warning border-warning/30";
		case "Accepted":
			return "bg-success/20 text-success border-success/30";
		case "Declined":
			return "bg-error/20 text-error border-error/30";
		case "Attended":
			return "bg-success/20 text-success border-success/30";
		case "NoShow":
			return "bg-error/20 text-error border-error/30";
		default:
			return "bg-white/10 text-muted border-white/20";
	}
};

export default function EventMembersPage() {
	const { event, eventId, participants, isAdmin } = useEventContext();
	const queryClient = useQueryClient();

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [showInviteModal, setShowInviteModal] = useState(false);

	const inviteMutation = useMutation({
		mutationFn: (userIds: string[]) => inviteUsers(eventId, userIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
			setShowInviteModal(false);
		},
	});

	if (!event) return null;

	// Get existing participant user IDs to exclude from invite modal
	const existingUserIds = participants.map((p) => p.userId);

	// Filter participants based on search and status
	const filteredParticipants = participants.filter((p) => {
		const profile = p.userProfile;
		const participantStatus = p.status as unknown as string;

		// Status filter
		if (statusFilter !== "all" && participantStatus !== statusFilter) {
			return false;
		}

		// Search filter
		if (searchQuery) {
			const fullName = `${profile.name} ${profile.surname}`.toLowerCase();
			if (!fullName.includes(searchQuery.toLowerCase())) {
				return false;
			}
		}

		return true;
	});

	const handleRemoveParticipant = (participantId: string) => {
		// TODO: Implement remove participant API call
		void participantId; // Placeholder until API is implemented
	};

	const handleInviteUsers = (users: UserProfile[]) => {
		const userIds = users.map((u) => u.id).filter((id): id is string => id !== undefined);
		if (userIds.length > 0) {
			inviteMutation.mutate(userIds);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-bold text-white">Members</h2>
				{isAdmin && (
					<Button color="primary" leftIcon={<UserPlus size={16} />} onClick={() => setShowInviteModal(true)}>
						Invite
					</Button>
				)}
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col sm:flex-row gap-3">
				{/* Search */}
				<div className="flex-1">
					<Input
						placeholder="Search members..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						leftIcon={<Search size={18} />}
					/>
				</div>

				{/* Status Filter */}
				<Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
					<SelectTrigger className="w-[180px]">
						<Filter size={16} className="mr-2 text-muted-foreground" />
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						{STATUS_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Participants List */}
			{filteredParticipants.length > 0 ? (
				<div className="rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/10">
					{filteredParticipants.map((participant) => {
						const { userProfile } = participant;
						const statusStr = participant.status as unknown as string;

						return (
							<div key={participant.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
								<div className="flex items-center gap-3">
									<Avatar name={`${userProfile.name} ${userProfile.surname}`} src={userProfile.imageUrl} />
									<div>
										<div className="font-medium text-white">
											{userProfile.name} {userProfile.surname}
										</div>
										<div className="flex items-center gap-2 mt-0.5">
											<span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(statusStr)}`}>
												{getStatusLabel(statusStr)}
											</span>
										</div>
									</div>
								</div>

								{isAdmin && (
									<DropdownMenu
										items={[
											{
												label: "Remove",
												icon: <UserMinus size={16} />,
												variant: "destructive",
												onClick: () => handleRemoveParticipant(participant.id),
											},
										]}
									/>
								)}
							</div>
						);
					})}
				</div>
			) : (
				<EmptyState
					icon={Users}
					title={searchQuery || statusFilter !== "all" ? "No matches found" : "No participants yet"}
					description={
						searchQuery || statusFilter !== "all"
							? "Try adjusting your search or filter criteria"
							: "Invite people to join this event"
					}
					action={
						isAdmin && !searchQuery && statusFilter === "all"
							? {
									label: "Invite People",
									onClick: () => setShowInviteModal(true),
									icon: UserPlus,
								}
							: undefined
					}
				/>
			)}

			{/* Invite Modal */}
			<UserSelectorModal
				isOpen={showInviteModal}
				onClose={() => setShowInviteModal(false)}
				onConfirm={handleInviteUsers}
				selectedUsers={[]}
				title="Invite to Event"
				confirmLabel="Send Invitations"
				excludeUserIds={existingUserIds}
			/>
		</div>
	);
}
