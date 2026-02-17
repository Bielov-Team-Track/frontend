"use client";

import { EditMemberModal, MemberRow } from "@/components/features/clubs";
import { Avatar, Button, EmptyState } from "@/components/ui";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import { ListToolbar, StatusTabs } from "@/components/ui/list-toolbar";
import Skeleton, { SkeletonAvatar } from "@/components/ui/skeleton";
import {
	getClubRegistrationsPaged,
	getRegistrationStatusCounts,
	leaveClub,
	searchClubMembers,
	updateClubMember,
	UpdateClubMemberRequest,
	updateRegistrationStatus,
} from "@/lib/api/clubs";
import { ClubMember, ClubMembersSortBy, ClubRegistration, ClubRole, RegistrationSortBy, RegistrationStatus } from "@/lib/models/Club";
import { SortDirection } from "@/lib/models/filteringAndPagination";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownAZ, Calendar, Check, Clock, Loader2, Plus, RotateCcw, Search, UserCheck, UserMinus, UserPlus, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Optimized infinite scroll hook using callback ref pattern
function useInfiniteScroll(fetchNextPage: () => void, hasNextPage: boolean | undefined, isFetchingNextPage: boolean) {
	const observerRef = useRef<IntersectionObserver | null>(null);

	const targetRef = useCallback(
		(node: HTMLDivElement | null) => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}

			if (!node || !hasNextPage || isFetchingNextPage) return;

			observerRef.current = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						fetchNextPage();
					}
				},
				{ threshold: 0.1, rootMargin: "100px" },
			);

			observerRef.current.observe(node);
		},
		[fetchNextPage, hasNextPage, isFetchingNextPage],
	);

	useEffect(() => {
		return () => {
			observerRef.current?.disconnect();
		};
	}, []);

	return targetRef;
}

interface MembersTabProps {
	members: ClubMember[];
	clubId: string;
	currentUserRole?: ClubRole;
	onInvite: () => void;
}

type SubTab = "members" | "registrations" | "waitlist" | "declined";

export default function MembersTab({ members, clubId, currentUserRole, onInvite }: MembersTabProps) {
	const [activeSubTab, setActiveSubTab] = useState<SubTab>("members");

	// Fetch registration status counts
	const { data: statusCounts } = useQuery({
		queryKey: ["club-registrations-counts", clubId],
		queryFn: () => getRegistrationStatusCounts(clubId),
	});

	// Build tabs for StatusTabs component
	const tabs = [
		{ id: "members", label: "Members", count: members.length, icon: <Users size={16} /> },
		{ id: "registrations", label: "Pending", count: statusCounts?.pending, icon: <UserPlus size={16} /> },
		{ id: "waitlist", label: "Waitlist", count: statusCounts?.waitlist, icon: <UserCheck size={16} /> },
		{ id: "declined", label: "Declined", count: statusCounts?.declined, icon: <UserMinus size={16} /> },
	];

	return (
		<div className="flex flex-col gap-4 h-full">
			{/* Header Row: Title + Invite Button */}
			<div className="flex items-center justify-between shrink-0">
				<h2 className="text-lg font-semibold text-foreground">Members</h2>
				<Button variant="outline" onClick={onInvite} leftIcon={<Plus size={16} />}>
					Invite
				</Button>
			</div>

			{/* Status Tabs */}
			<div className="shrink-0">
				<StatusTabs tabs={tabs} activeTab={activeSubTab} onTabChange={(id) => setActiveSubTab(id as SubTab)} />
			</div>

			{/* Main Content */}
			<main className="flex-1 min-h-0" role="tabpanel" aria-label={`${activeSubTab} content`}>
				<AnimatePresence mode="wait">
					<motion.div
						key={activeSubTab}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.15 }}
						className="h-full">
						{activeSubTab === "members" && <MembersList clubId={clubId} currentUserRole={currentUserRole} onInvite={onInvite} />}
						{activeSubTab === "registrations" && <RegistrationsList clubId={clubId} status={RegistrationStatus.Pending} />}
						{activeSubTab === "waitlist" && <RegistrationsList clubId={clubId} status={RegistrationStatus.Waitlist} />}
						{activeSubTab === "declined" && <RegistrationsList clubId={clubId} status={RegistrationStatus.Declined} />}
					</motion.div>
				</AnimatePresence>
			</main>
		</div>
	);
}

// --- Members List ---

// Sort options for members (mapped to backend ClubMembersSortBy + SortDirection)
const MEMBER_SORT_OPTIONS = [
	{ value: "joined-desc", label: "Newest First", icon: <Clock size={14} /> },
	{ value: "joined-asc", label: "Oldest First", icon: <Clock size={14} /> },
	{ value: "name-asc", label: "Name (A-Z)", icon: <ArrowDownAZ size={14} /> },
];

// Map frontend sort value to backend params
function parseMemberSort(sortBy: string): { sortBy: ClubMembersSortBy; sortDirection: SortDirection } {
	switch (sortBy) {
		case "name-asc":
			return { sortBy: ClubMembersSortBy.Name, sortDirection: SortDirection.Ascending };
		case "joined-asc":
			return { sortBy: ClubMembersSortBy.JoinDate, sortDirection: SortDirection.Ascending };
		case "joined-desc":
		default:
			return { sortBy: ClubMembersSortBy.JoinDate, sortDirection: SortDirection.Descending };
	}
}

// Loading skeleton for member rows
function MemberRowSkeleton() {
	return (
		<tr className="border-b border-border last:border-b-0">
			<td className="px-4 py-3">
				<div className="flex items-center gap-3">
					<SkeletonAvatar size="sm" />
					<div className="space-y-1.5">
						<Skeleton height="0.875rem" width="8rem" rounded="md" />
						<Skeleton height="0.75rem" width="12rem" rounded="md" />
					</div>
				</div>
			</td>
			<td className="px-4 py-3"><Skeleton height="1.5rem" width="4rem" rounded="lg" /></td>
			<td className="px-4 py-3"><Skeleton height="0.875rem" width="5rem" rounded="md" /></td>
			<td className="px-4 py-3"><Skeleton height="0.875rem" width="6rem" rounded="md" /></td>
			<td className="px-4 py-3"><Skeleton height="1.5rem" width="4rem" rounded="lg" /></td>
			<td className="px-4 py-3 text-right"><Skeleton height="2rem" width="2rem" rounded="md" /></td>
		</tr>
	);
}

function MembersList({ clubId, currentUserRole, onInvite }: Omit<MembersTabProps, "members">) {
	const [editingMember, setEditingMember] = useState<ClubMember | null>(null);
	const [removingMember, setRemovingMember] = useState<ClubMember | null>(null);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<string>("joined-desc");

	const queryClient = useQueryClient();

	// Compute backend sort params
	const { sortBy: apiSortBy, sortDirection: apiSortDirection } = parseMemberSort(sortBy);

	// Use infinite query with backend search endpoint
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
		queryKey: ["club-members-search", clubId, search, apiSortBy, apiSortDirection],
		queryFn: ({ pageParam }) =>
			searchClubMembers(clubId, {
				query: search || undefined,
				sortBy: apiSortBy,
				sortDirection: apiSortDirection,
				cursor: pageParam as string | undefined,
				limit: 20,
			}),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
	});

	const loadMoreRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

	const allMembers = data?.pages.flatMap((page) => page.items ?? []).filter((item): item is ClubMember => item != null) || [];
	const totalCount = data?.pages[0]?.totalCount;

	const updateMutation = useMutation({
		mutationFn: (data: UpdateClubMemberRequest) => updateClubMember(clubId, editingMember!.userId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-members-search", clubId] });
			queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
			setEditingMember(null);
		},
	});

	const removeMutation = useMutation({
		mutationFn: (userId: string) => leaveClub(clubId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-members-search", clubId] });
			queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
			setRemovingMember(null);
		},
	});

	const getMemberDisplayName = (member: ClubMember) => {
		if (member.userProfile) {
			return `${member.userProfile.name} ${member.userProfile.surname}`;
		}
		return "this member";
	};

	return (
		<div className="flex flex-col gap-4 h-full">
			{/* Toolbar */}
			<ListToolbar
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search by name or email..."
				sortOptions={MEMBER_SORT_OPTIONS}
				sortBy={sortBy}
				onSortChange={setSortBy}
				count={totalCount ?? allMembers.length}
				itemLabel="member"
				showViewToggle={false}
			/>

			{/* Content Area */}
			<div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
			{isLoading && allMembers.length === 0 ? (
				<div className="rounded-xl bg-surface border border-border overflow-hidden">
					<table className="w-full">
						<thead>
							<tr className="border-b border-border">
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Member</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Role</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Skill Level</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Joined</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Status</th>
								<th className="text-right text-xs font-medium text-muted px-4 py-3">Actions</th>
							</tr>
						</thead>
						<tbody>
							{[...Array(5)].map((_, i) => (
								<MemberRowSkeleton key={i} />
							))}
						</tbody>
					</table>
				</div>
			) : allMembers.length === 0 ? (
				<EmptyState
					icon={search ? Search : UserPlus}
					title={search ? "No members found" : "No members yet"}
					description={search ? "Try adjusting your search terms." : "Invite members to join your club"}
					action={
						search
							? {
									label: "Clear Search",
									onClick: () => setSearch(""),
									icon: Search,
								}
							: {
									label: "Invite Member",
									onClick: onInvite,
									icon: Plus,
								}
					}
				/>
			) : (
				<div className="pb-4">
					<div className="rounded-xl bg-surface border border-border overflow-hidden">
						<table className="w-full">
							<thead>
								<tr className="border-b border-border">
									<th className="text-left text-xs font-medium text-muted px-4 py-3">Member</th>
									<th className="text-left text-xs font-medium text-muted px-4 py-3">Role</th>
									<th className="text-left text-xs font-medium text-muted px-4 py-3">Skill Level</th>
									<th className="text-left text-xs font-medium text-muted px-4 py-3">Joined</th>
									<th className="text-left text-xs font-medium text-muted px-4 py-3">Status</th>
									<th className="text-right text-xs font-medium text-muted px-4 py-3">Actions</th>
								</tr>
							</thead>
							<tbody>
								{allMembers.map((member) => (
									<MemberRow
										key={member.userId}
										member={member}
										clubId={clubId}
										currentUserRole={currentUserRole}
										onEdit={() => setEditingMember(member)}
										onRemove={() => setRemovingMember(member)}
									/>
								))}
							</tbody>
						</table>
					</div>

					{/* Infinite Scroll Trigger */}
					<div ref={loadMoreRef} className="h-12 flex items-center justify-center">
						{isFetchingNextPage && (
							<div className="flex items-center gap-2 text-muted">
								<Loader2 className="w-5 h-5 animate-spin" />
								<span className="text-sm">Loading more...</span>
							</div>
						)}
						{!hasNextPage && allMembers.length > 0 && <span className="text-xs text-muted">All members loaded</span>}
					</div>
				</div>
			)}
			</div>

			<EditMemberModal
				isOpen={!!editingMember}
				member={editingMember}
				onClose={() => setEditingMember(null)}
				onSubmit={(data) => updateMutation.mutate(data)}
				isLoading={updateMutation.isPending}
			/>

			<DeleteConfirmModal
				isOpen={!!removingMember}
				title="Remove Member"
				itemName={removingMember ? getMemberDisplayName(removingMember) : ""}
				description={
					removingMember
						? `Are you sure you want to remove ${getMemberDisplayName(removingMember)} from this club? They will lose access to all club resources.`
						: undefined
				}
				onClose={() => setRemovingMember(null)}
				onConfirm={() => removingMember && removeMutation.mutate(removingMember.userId)}
				isLoading={removeMutation.isPending}
				confirmText="Remove"
			/>
		</div>
	);
}

// --- Registrations List ---

interface RegistrationsListProps {
	clubId: string;
	status: RegistrationStatus;
}

// Sort options for registrations
const REGISTRATION_SORT_OPTIONS = [
	{ value: "submitted-desc", label: "Newest First", icon: <Clock size={14} /> },
	{ value: "submitted-asc", label: "Oldest First", icon: <Clock size={14} /> },
	{ value: "name-asc", label: "Name (A-Z)", icon: <ArrowDownAZ size={14} /> },
];

// Loading skeleton for registration cards
function RegistrationCardSkeleton() {
	return (
		<div className="p-4 rounded-xl bg-surface border border-border">
			<div className="flex items-center gap-4">
				<SkeletonAvatar size="md" />
				<div className="flex-1 space-y-2">
					<Skeleton height="1rem" width="40%" rounded="md" />
					<Skeleton height="0.75rem" width="60%" rounded="md" />
				</div>
				<div className="flex gap-2">
					<Skeleton height="2rem" width="5rem" rounded="lg" />
					<Skeleton height="2rem" width="5rem" rounded="lg" />
				</div>
			</div>
		</div>
	);
}

function RegistrationsList({ clubId, status }: RegistrationsListProps) {
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<string>("submitted-desc");

	// Convert sortBy to API params
	const apiSortBy = sortBy.startsWith("name") ? RegistrationSortBy.UserName : RegistrationSortBy.SubmittedAt;
	const apiSortDirection = sortBy.endsWith("-asc") ? SortDirection.Ascending : SortDirection.Descending;

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
		queryKey: ["club-registrations", clubId, status, search, apiSortBy, apiSortDirection],
		queryFn: ({ pageParam }) =>
			getClubRegistrationsPaged(clubId, {
				status,
				search,
				sortBy: apiSortBy,
				sortDirection: apiSortDirection,
				cursor: pageParam as string | undefined,
				limit: 20,
			}),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
	});

	const loadMoreRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

	const queryClient = useQueryClient();
	const statusMutation = useMutation({
		mutationFn: ({ id, status, privateNote, publicNote }: { id: string; status: RegistrationStatus; privateNote?: string; publicNote?: string }) =>
			updateRegistrationStatus(clubId, id, { status, privateNote, publicNote }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-registrations", clubId] });
			queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
			queryClient.invalidateQueries({ queryKey: ["club-registrations-counts", clubId] });
		},
	});

	const handleStatusChange = (id: string, newStatus: RegistrationStatus) => {
		statusMutation.mutate({ id, status: newStatus });
	};

	const registrations = data?.pages.flatMap((page) => page.items ?? []).filter((item): item is ClubRegistration => item != null) || [];

	const statusLabels: Record<RegistrationStatus, string> = {
		[RegistrationStatus.Pending]: "Pending",
		[RegistrationStatus.Waitlist]: "Waitlisted",
		[RegistrationStatus.Accepted]: "Accepted",
		[RegistrationStatus.Declined]: "Declined",
	};

	return (
		<div className="flex flex-col gap-4 h-full">
			{/* Toolbar */}
			<ListToolbar
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search by name or email..."
				sortOptions={REGISTRATION_SORT_OPTIONS}
				sortBy={sortBy}
				onSortChange={setSortBy}
				count={isLoading ? 0 : registrations.length}
				itemLabel="registration"
				showViewToggle={false}
			/>

			{/* Content Area */}
			<div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
				{isLoading && registrations.length === 0 ? (
					<div className="space-y-2" role="status" aria-label="Loading registrations">
						{[...Array(5)].map((_, i) => (
							<RegistrationCardSkeleton key={i} />
						))}
					</div>
				) : registrations.length === 0 ? (
					<EmptyState
						icon={UserPlus}
						title="No registrations found"
						description={
							search
								? "Try adjusting your search terms."
								: `No ${statusLabels[status].toLowerCase()} registrations yet.`
						}
						action={
							search
								? {
										label: "Clear Search",
										onClick: () => setSearch(""),
										icon: Search,
									}
								: undefined
						}
					/>
				) : (
					<div className="space-y-2 pb-4" role="list" aria-label={`${statusLabels[status]} registrations list`}>
						<AnimatePresence mode="popLayout">
							{registrations.map((reg, index) => (
								<motion.div
									key={reg.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95 }}
									transition={{ duration: 0.2, delay: index * 0.03 }}
									layout>
									<RegistrationCard
										registration={reg}
										clubId={clubId}
										onStatusChange={handleStatusChange}
										isUpdating={statusMutation.isPending}
										updatingId={statusMutation.variables?.id}
									/>
								</motion.div>
							))}
						</AnimatePresence>

						{/* Infinite Scroll Trigger */}
						<div ref={loadMoreRef} className="h-12 flex items-center justify-center">
							{isFetchingNextPage && (
								<div className="flex items-center gap-2 text-muted">
									<Loader2 className="w-5 h-5 animate-spin" />
									<span className="text-sm">Loading more...</span>
								</div>
							)}
							{!hasNextPage && registrations.length > 0 && <span className="text-xs text-muted">All registrations loaded</span>}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function RegistrationCard({
	registration,
	clubId,
	onStatusChange,
	isUpdating,
	updatingId,
}: {
	registration: ClubRegistration;
	clubId: string;
	onStatusChange: (id: string, status: RegistrationStatus) => void;
	isUpdating: boolean;
	updatingId?: string;
}) {
	const router = useRouter();
	const userProfile = registration.user;
	const isThisUpdating = isUpdating && updatingId === registration.id;

	const handleCardClick = (e: React.MouseEvent) => {
		// Don't navigate if clicking on buttons
		if ((e.target as HTMLElement).closest("button")) return;
		router.push(`/hub/clubs/${clubId}/registrations/${registration.id}`);
	};

	const userName = userProfile ? `${userProfile.name || ""} ${userProfile.surname || ""}`.trim() : null;
	const userEmail = userProfile?.email;
	const formName = registration.formTemplate?.name || "Club Membership";

	// Generate initials for avatar fallback
	const initials = userName
		? userName
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "?";

	return (
		<div
			className={`group p-4 rounded-xl bg-surface border border-border hover:border-border hover:bg-hover transition-all duration-200 cursor-pointer ${
				isThisUpdating ? "opacity-70 pointer-events-none" : ""
			}`}
			role="listitem"
			aria-label={`Registration from ${userName || "Unknown user"}`}
			onClick={handleCardClick}>
			<div className="flex items-center gap-4">
				{/* Avatar */}
				<div className="shrink-0">
					{userProfile ? (
						<Avatar name={userProfile.name + " " + userProfile.surname} src={userProfile.imageUrl} variant={"user"} />
					) : (
						<div className="w-10 h-10 rounded-lg bg-linear-to-br from-accent/30 to-primary/30 flex items-center justify-center text-sm font-bold text-white border border-border">
							{initials}
						</div>
					)}
				</div>

				{/* User Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<h4 className="font-medium text-white truncate">{userName || "Unknown User"}</h4>
						{userEmail && <span className="text-xs text-muted truncate hidden sm:inline">({userEmail})</span>}
					</div>
					<div className="flex items-center gap-1 mt-1 text-sm text-muted">
						<Clock size={12} className="shrink-0" />
						<span className="truncate">{formatDistanceToNow(new Date(registration.submittedAt), { addSuffix: true })}</span>
						<span className="text-white/20">•</span>
						<span className="truncate">{formName}</span>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex items-center gap-2 shrink-0">
					{registration.status === RegistrationStatus.Pending && (
						<>
							<Button
								color="success"
								size="sm"
								onClick={() => onStatusChange(registration.id, RegistrationStatus.Accepted)}
								disabled={isUpdating}
								loading={isThisUpdating}
								leftIcon={!isThisUpdating ? <Check size={14} /> : undefined}
								aria-label={`Accept ${userName || "user"}'s registration`}>
								<span className="hidden sm:inline">Accept</span>
							</Button>
							<Button
								variant="outline"
								color="error"
								size="sm"
								onClick={() => onStatusChange(registration.id, RegistrationStatus.Declined)}
								disabled={isUpdating}
								leftIcon={<X size={14} />}
								aria-label={`Decline ${userName || "user"}'s registration`}>
								<span className="hidden sm:inline">Decline</span>
							</Button>
							<Button
								variant="ghost"
								color="neutral"
								size="sm"
								onClick={() => onStatusChange(registration.id, RegistrationStatus.Waitlist)}
								disabled={isUpdating}
								leftIcon={<Users size={14} />}
								className="hidden md:flex"
								aria-label={`Add ${userName || "user"} to waitlist`}>
								Waitlist
							</Button>
						</>
					)}
					{registration.status === RegistrationStatus.Waitlist && (
						<>
							<Button
								color="success"
								size="sm"
								onClick={() => onStatusChange(registration.id, RegistrationStatus.Accepted)}
								disabled={isUpdating}
								loading={isThisUpdating}
								leftIcon={!isThisUpdating ? <Check size={14} /> : undefined}
								aria-label={`Accept ${userName || "user"} from waitlist`}>
								<span className="hidden sm:inline">Accept</span>
							</Button>
							<Button
								variant="ghost"
								color="neutral"
								size="sm"
								onClick={() => onStatusChange(registration.id, RegistrationStatus.Declined)}
								disabled={isUpdating}
								leftIcon={<X size={14} />}
								aria-label={`Decline ${userName || "user"}'s registration`}>
								<span className="hidden sm:inline">Decline</span>
							</Button>
						</>
					)}
					{registration.status === RegistrationStatus.Declined && (
						<Button
							variant="outline"
							color="accent"
							size="sm"
							onClick={() => onStatusChange(registration.id, RegistrationStatus.Pending)}
							disabled={isUpdating}
							loading={isThisUpdating}
							leftIcon={!isThisUpdating ? <RotateCcw size={14} /> : undefined}
							aria-label={`Reconsider ${userName || "user"}'s registration`}>
							Reconsider
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
