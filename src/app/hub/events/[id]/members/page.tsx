"use client";

import { Avatar, Button, DropdownMenu, EmptyState, Modal, TextArea } from "@/components";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserSelectorModal } from "@/components/features/users";
import { inviteUsers, removeParticipant, revokeInvitation, updateParticipantStatus } from "@/lib/api/events";
import { InvitedVia } from "@/lib/models/EventParticipant";
import { UserProfile } from "@/lib/models/User";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ArrowDownAZ, Clock, CreditCard, MailX, Search, UserMinus, UserPlus, Users, XCircle } from "lucide-react";
import { useState } from "react";
import { useEventContext } from "../layout";

// Status values as returned by the API (strings)
type ParticipantStatus = "Invited" | "Waitlisted" | "Accepted" | "Declined" | "Attended" | "NoShow";
type StatusFilter = "all" | ParticipantStatus;

const ALL_STATUSES: { value: ParticipantStatus; label: string }[] = [
	{ value: "Accepted", label: "Accepted" },
	{ value: "Invited", label: "Invited" },
	{ value: "Waitlisted", label: "Waitlisted" },
	{ value: "Declined", label: "Declined" },
	{ value: "Attended", label: "Attended" },
	{ value: "NoShow", label: "No Show" },
];

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
	{ value: "all", label: "All Statuses" },
	...ALL_STATUSES,
];

const MEMBER_SORT_OPTIONS = [
	{ value: "joined-desc", label: "Newest First", icon: <Clock size={14} /> },
	{ value: "joined-asc", label: "Oldest First", icon: <Clock size={14} /> },
	{ value: "name-asc", label: "Name (A-Z)", icon: <ArrowDownAZ size={14} /> },
	{ value: "name-desc", label: "Name (Z-A)", icon: <ArrowDownAZ size={14} /> },
	{ value: "status", label: "Status", icon: <Clock size={14} /> },
];

const getStatusLabel = (status: string): string => {
	return ALL_STATUSES.find((s) => s.value === status)?.label || status || "Unknown";
};

const getStatusColor = (status: string): string => {
	switch (status) {
		case "Invited":
			return "bg-info/20 text-info border-info/30";
		case "Waitlisted":
			return "bg-warning/20 text-warning border-warning/30";
		case "Accepted":
		case "Attended":
			return "bg-success/20 text-success border-success/30";
		case "Declined":
		case "NoShow":
			return "bg-error/20 text-error border-error/30";
		default:
			return "bg-hover text-muted border-border";
	}
};

const getInvitedViaLabel = (invitedVia: InvitedVia | string): string => {
	switch (invitedVia) {
		case InvitedVia.Direct:
		case "Direct":
			return "Direct Invite";
		case InvitedVia.ClubMembership:
		case "ClubMembership":
			return "Club Member";
		case InvitedVia.SeriesParticipation:
		case "SeriesParticipation":
			return "Series";
		case InvitedVia.PublicJoin:
		case "PublicJoin":
			return "Public Join";
		default:
			return "—";
	}
};

const getPaymentLabel = (paymentStatus?: string | null): { label: string; color: string } => {
	switch (paymentStatus) {
		case "completed":
			return { label: "Paid", color: "text-success" };
		case "pending":
			return { label: "Pending", color: "text-warning" };
		default:
			return { label: "Unpaid", color: "text-muted" };
	}
};

export default function EventMembersPage() {
	const { event, eventId, participants, isAdmin } = useEventContext();
	const queryClient = useQueryClient();

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [sortBy, setSortBy] = useState("joined-desc");
	const [showInviteModal, setShowInviteModal] = useState(false);
	const [removingParticipant, setRemovingParticipant] = useState<{ id: string; userId: string; name: string } | null>(null);
	const [decliningParticipant, setDecliningParticipant] = useState<{ userId: string; name: string } | null>(null);
	const [declineNote, setDeclineNote] = useState("");

	const inviteMutation = useMutation({
		mutationFn: (userIds: string[]) => inviteUsers(eventId, userIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
			setShowInviteModal(false);
		},
	});

	const removeMutation = useMutation({
		mutationFn: (userId: string) => removeParticipant(eventId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
			setRemovingParticipant(null);
		},
	});

	const revokeMutation = useMutation({
		mutationFn: (userId: string) => revokeInvitation(eventId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
		},
	});

	const statusMutation = useMutation({
		mutationFn: ({ userId, status, declineNote }: { userId: string; status: string; declineNote?: string }) =>
			updateParticipantStatus(eventId, userId, status, declineNote),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
			setDecliningParticipant(null);
			setDeclineNote("");
		},
	});

	if (!event) return null;

	const hasPaymentConfig = !!(event.paymentConfig || event.costToEnter);

	// Get existing participant user IDs to exclude from invite modal
	const existingUserIds = participants.map((p) => p.userId);

	// Filter and sort participants
	const filteredParticipants = participants
		.filter((p) => {
			const profile = p.userProfile;
			const participantStatus = p.status as unknown as string;

			if (statusFilter !== "all" && participantStatus !== statusFilter) return false;

			if (searchQuery) {
				const fullName = `${profile.name} ${profile.surname}`.toLowerCase();
				if (!fullName.includes(searchQuery.toLowerCase())) return false;
			}

			return true;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "name-asc":
					return `${a.userProfile.name} ${a.userProfile.surname}`.localeCompare(`${b.userProfile.name} ${b.userProfile.surname}`);
				case "name-desc":
					return `${b.userProfile.name} ${b.userProfile.surname}`.localeCompare(`${a.userProfile.name} ${a.userProfile.surname}`);
				case "joined-desc":
					return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
				case "joined-asc":
					return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
				case "status":
					return (a.status as unknown as string).localeCompare(b.status as unknown as string);
				default:
					return 0;
			}
		});

	const activeFilterCount = statusFilter !== "all" ? 1 : 0;
	const clearFilters = () => setStatusFilter("all");

	const filterContent = (
		<div className="space-y-2">
			<p className="text-xs font-medium text-muted-foreground">Status</p>
			<div className="flex flex-wrap gap-2">
				{STATUS_FILTER_OPTIONS.map((option) => (
					<button
						key={option.value}
						type="button"
						onClick={() => setStatusFilter(option.value)}
						className={cn(
							"px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
							statusFilter === option.value
								? "bg-foreground/10 text-foreground border-foreground/30"
								: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground hover:border-foreground/20"
						)}>
						{option.label}
					</button>
				))}
			</div>
		</div>
	);

	const handleInviteUsers = (users: UserProfile[]) => {
		const userIds = users.map((u) => u.id).filter((id): id is string => id !== undefined);
		if (userIds.length > 0) {
			inviteMutation.mutate(userIds);
		}
	};

	const handleStatusChange = (userId: string, name: string, newStatus: string) => {
		if (newStatus === "Declined") {
			setDecliningParticipant({ userId, name });
		} else {
			statusMutation.mutate({ userId, status: newStatus });
		}
	};

	const getParticipantName = (profile: { name?: string; surname?: string }) =>
		`${profile.name || ""} ${profile.surname || ""}`.trim() || "Unknown";

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-foreground">Members</h2>
				{isAdmin && (
					<Button variant="outline" leftIcon={<UserPlus size={16} />} onClick={() => setShowInviteModal(true)} data-testid="invite-members-button">
						Invite
					</Button>
				)}
			</div>

			{/* Toolbar */}
			<ListToolbar
				search={searchQuery}
				onSearchChange={setSearchQuery}
				searchPlaceholder="Search members..."
				sortOptions={MEMBER_SORT_OPTIONS}
				sortBy={sortBy}
				onSortChange={setSortBy}
				filterContent={filterContent}
				activeFilterCount={activeFilterCount}
				onClearFilters={clearFilters}
				count={filteredParticipants.length}
				itemLabel="member"
				showViewToggle={false}
				searchTestId="members-search"
			/>

			{/* Participants Table */}
			{filteredParticipants.length > 0 ? (
				<div className="rounded-xl bg-surface border border-border overflow-hidden">
					<table className="w-full" data-testid="members-table">
						<thead>
							<tr className="border-b border-border">
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Member</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Status</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3 hidden md:table-cell">Joined</th>
								{hasPaymentConfig && (
									<th className="text-left text-xs font-medium text-muted px-4 py-3 hidden lg:table-cell">Payment</th>
								)}
								<th className="text-left text-xs font-medium text-muted px-4 py-3 hidden lg:table-cell">Source</th>
								{isAdmin && (
									<th className="text-right text-xs font-medium text-muted px-4 py-3">Actions</th>
								)}
							</tr>
						</thead>
						<tbody>
							{filteredParticipants.map((participant, index) => {
								const { userProfile } = participant;
								const statusStr = participant.status as unknown as string;
								const name = getParticipantName(userProfile);
								const payment = getPaymentLabel(participant.payment?.status);

								return (
									<tr key={participant.id} className="border-b border-border last:border-b-0 hover:bg-hover transition-colors" data-testid={`participant-row-${index}`}>
										{/* Member */}
										<td className="px-4 py-3">
											<div className="flex items-center gap-3">
												<Avatar name={name} src={userProfile.imageUrl} />
												<div className="min-w-0">
													<div className="font-medium text-white truncate">{name}</div>
													{userProfile.email && (
														<div className="text-xs text-muted truncate hidden sm:block">{userProfile.email}</div>
													)}
												</div>
											</div>
										</td>

										{/* Status */}
										<td className="px-4 py-3">
											{isAdmin ? (
												<Select
													value={statusStr}
													onValueChange={(value) => value && handleStatusChange(participant.userId, name, value)}
												>
													<SelectTrigger className="w-[130px] h-7 text-xs" size="sm" data-testid={`participant-status-${index}`}>
														<span className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(statusStr)}`}>
															{getStatusLabel(statusStr)}
														</span>
													</SelectTrigger>
													<SelectContent align="start">
														{ALL_STATUSES.map((s) => (
															<SelectItem key={s.value} value={s.value} disabled={s.value === statusStr}>
																<span className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(s.value)}`}>
																	{s.label}
																</span>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											) : (
												<span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(statusStr)}`} data-testid={`participant-status-${index}`}>
													{getStatusLabel(statusStr)}
												</span>
											)}
										</td>

										{/* Joined */}
										<td className="px-4 py-3 hidden md:table-cell">
											<span className="text-sm text-muted">
												{participant.createdAt
													? formatDistanceToNow(new Date(participant.createdAt), { addSuffix: true })
													: "—"}
											</span>
										</td>

										{/* Payment */}
										{hasPaymentConfig && (
											<td className="px-4 py-3 hidden lg:table-cell">
												<div className="flex items-center gap-1.5">
													<CreditCard size={14} className={payment.color} />
													<span className={`text-sm font-medium ${payment.color}`} data-testid={`participant-payment-${index}`}>{payment.label}</span>
												</div>
											</td>
										)}

										{/* Source */}
										<td className="px-4 py-3 hidden lg:table-cell">
											<span className="text-sm text-muted">
												{getInvitedViaLabel(participant.invitedVia)}
											</span>
										</td>

										{/* Actions */}
										{isAdmin && (
											<td className="px-4 py-3 text-right">
												<DropdownMenu
											data-testid={`participant-actions-${index}`}
													items={[
														...(statusStr === "Invited"
															? [
																	{
																		label: "Revoke Invitation",
																	"data-testid": "revoke-invitation-action",
																		icon: <MailX size={16} />,
																		variant: "destructive" as const,
																		onClick: () => revokeMutation.mutate(participant.userId),
																	},
																]
															: []),
														{
															label: "Remove",
															"data-testid": "remove-participant-action",
															icon: <UserMinus size={16} />,
															variant: "destructive" as const,
															onClick: () => setRemovingParticipant({ id: participant.id, userId: participant.userId, name }),
														},
													]}
												/>
											</td>
										)}
									</tr>
								);
							})}
						</tbody>
					</table>
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

			{/* Decline Modal */}
			<Modal
				isOpen={!!decliningParticipant}
				onClose={() => { setDecliningParticipant(null); setDeclineNote(""); }}
				size="sm"
				showCloseButton={false}
			>
				<div>
					<div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
						<XCircle className="text-warning" size={24} />
					</div>
					<h3 className="text-lg font-bold text-white mb-2 text-center">Decline Participant</h3>
					<p className="text-sm text-muted mb-4 text-center">
						Decline <span className="font-medium text-white">{decliningParticipant?.name}</span> from this event?
					</p>
					<TextArea
						placeholder="Reason for declining (optional)"
						value={declineNote}
						onChange={(e) => setDeclineNote(e.target.value)}
						rows={3}
					/>
					<div className="flex gap-12 justify-center mt-6">
						<Button
							variant="destructive"
							loading={statusMutation.isPending}
							onClick={() => decliningParticipant && statusMutation.mutate({
								userId: decliningParticipant.userId,
								status: "Declined",
								declineNote: declineNote || undefined,
							})}
						>
							Decline
						</Button>
						<Button
							variant="secondary"
							disabled={statusMutation.isPending}
							onClick={() => { setDecliningParticipant(null); setDeclineNote(""); }}
						>
							Cancel
						</Button>
					</div>
				</div>
			</Modal>

			{/* Remove Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={!!removingParticipant}
				title="Remove Participant"
				itemName={removingParticipant?.name || ""}
				description={
					removingParticipant
						? `Are you sure you want to remove ${removingParticipant.name} from this event?`
						: undefined
				}
				onClose={() => setRemovingParticipant(null)}
				onConfirm={() => removingParticipant && removeMutation.mutate(removingParticipant.userId)}
				isLoading={removeMutation.isPending}
				confirmText="Remove"
			/>
		</div>
	);
}
