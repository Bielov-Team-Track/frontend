"use client";

import { EditMemberModal, MemberRow } from "@/components/features/clubs";
import { Avatar, Button, EmptyState, Input, Select } from "@/components/ui";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import Skeleton, { SkeletonAvatar } from "@/components/ui/skeleton";
import {
	getClubRegistrationsPaged,
	getRegistrationStatusCounts,
	leaveClub,
	updateClubMember,
	UpdateClubMemberRequest,
	updateRegistrationStatus,
} from "@/lib/api/clubs";
import { ClubMember, ClubRegistration, ClubRole, RegistrationSortBy, RegistrationStatus } from "@/lib/models/Club";
import { SortDirection } from "@/lib/models/filteringAndPagination";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownUp, Calendar, Check, Clock, Filter, Loader2, Plus, RotateCcw, Search, UserCheck, UserMinus, UserPlus, Users, X } from "lucide-react";
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
				{ threshold: 0.1, rootMargin: "100px" }
			);

			observerRef.current.observe(node);
		},
		[fetchNextPage, hasNextPage, isFetchingNextPage]
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

	return (
		<div className="flex flex-col gap-6">
			{/* Horizontal Tabs Navigation */}
			<nav
				role="tablist"
				aria-label="Member categories"
				className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto scrollbar-none">
				<TabButton active={activeSubTab === "members"} onClick={() => setActiveSubTab("members")} icon={Users} label="Members" count={members.length} />
				<TabButton
					active={activeSubTab === "registrations"}
					onClick={() => setActiveSubTab("registrations")}
					icon={UserPlus}
					label="Registrations"
					count={statusCounts?.pending}
				/>
				<TabButton
					active={activeSubTab === "waitlist"}
					onClick={() => setActiveSubTab("waitlist")}
					icon={UserCheck}
					label="Waitlist"
					count={statusCounts?.waitlist}
				/>
				<TabButton
					active={activeSubTab === "declined"}
					onClick={() => setActiveSubTab("declined")}
					icon={UserMinus}
					label="Declined"
					count={statusCounts?.declined}
				/>
			</nav>

			{/* Main Content */}
			<main className="flex-1 min-w-0" role="tabpanel" aria-label={`${activeSubTab} content`}>
				<AnimatePresence mode="wait">
					<motion.div
						key={activeSubTab}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.15 }}>
						{activeSubTab === "members" && <MembersList members={members} clubId={clubId} currentUserRole={currentUserRole} onInvite={onInvite} />}
						{activeSubTab === "registrations" && <RegistrationsList clubId={clubId} status={RegistrationStatus.Pending} />}
						{activeSubTab === "waitlist" && <RegistrationsList clubId={clubId} status={RegistrationStatus.Waitlist} />}
						{activeSubTab === "declined" && <RegistrationsList clubId={clubId} status={RegistrationStatus.Declined} />}
					</motion.div>
				</AnimatePresence>
			</main>
		</div>
	);
}

interface TabButtonProps {
	active: boolean;
	onClick: () => void;
	icon: React.ComponentType<{ size?: number; className?: string }>;
	label: string;
	count?: number;
}

function TabButton({ active, onClick, icon: Icon, label, count }: TabButtonProps) {
	return (
		<button
			onClick={onClick}
			role="tab"
			aria-selected={active}
			aria-controls={`${label.toLowerCase()}-panel`}
			className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] ${
				active ? "bg-neutral-700 text-white shadow-md shadow-neutral-800" : "text-muted hover:text-white hover:bg-white/5"
			}`}>
			<Icon size={16} className={active ? "text-white" : "text-muted"} />
			<span>{label}</span>
			{count !== undefined && (
				<span
					className={`min-w-5 h-5 flex items-center justify-center text-xs rounded-full px-1.5 ${
						active ? "bg-white/20 text-white" : "bg-white/10 text-muted"
					}`}>
					{count}
				</span>
			)}
		</button>
	);
}

// --- Members List (Existing Logic) ---

// Sort options for members dropdown
const memberSortOptions = [
	{ value: "joinedAt", label: "Joined Date" },
	{ value: "name", label: "Name" },
	{ value: "role", label: "Role" },
];

const memberDirectionOptions = [
	{ value: SortDirection.Descending, label: "Newest First" },
	{ value: SortDirection.Ascending, label: "Oldest First" },
];

function MembersList({ members, clubId, currentUserRole, onInvite }: MembersTabProps) {
	const [editingMember, setEditingMember] = useState<ClubMember | null>(null);
	const [removingMember, setRemovingMember] = useState<ClubMember | null>(null);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<string>("joinedAt");
	const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.Descending);
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [showFilters, setShowFilters] = useState(false);

	const queryClient = useQueryClient();

	const updateMutation = useMutation({
		mutationFn: (data: UpdateClubMemberRequest) => updateClubMember(clubId, editingMember!.id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-members", clubId] });
			setEditingMember(null);
		},
	});

	const removeMutation = useMutation({
		mutationFn: (userId: string) => leaveClub(clubId, userId),
		onSuccess: () => {
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

	const clearFilters = () => {
		setDateFrom("");
		setDateTo("");
		setSortBy("joinedAt");
		setSortDirection(SortDirection.Descending);
	};

	const hasActiveFilters = dateFrom || dateTo || sortBy !== "joinedAt" || sortDirection !== SortDirection.Descending;

	// Filter and sort members
	const filteredMembers = members
		.filter((member) => {
			// Search filter
			if (search) {
				const searchLower = search.toLowerCase();
				const name = getMemberDisplayName(member).toLowerCase();
				const email = member.userProfile?.email?.toLowerCase() || "";
				if (!name.includes(searchLower) && !email.includes(searchLower)) {
					return false;
				}
			}
			// Date filters
			if (dateFrom && member.joinedAt) {
				if (new Date(member.joinedAt) < new Date(dateFrom)) return false;
			}
			if (dateTo && member.joinedAt) {
				if (new Date(member.joinedAt) > new Date(dateTo)) return false;
			}
			return true;
		})
		.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case "name":
					comparison = getMemberDisplayName(a).localeCompare(getMemberDisplayName(b));
					break;
				case "role":
					comparison = (a.role || "").localeCompare(b.role || "");
					break;
				case "joinedAt":
				default:
					comparison = new Date(a.joinedAt || 0).getTime() - new Date(b.joinedAt || 0).getTime();
					break;
			}
			return sortDirection === SortDirection.Ascending ? comparison : -comparison;
		});

	return (
		<div className="space-y-4">
			{/* Header with search and filters */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h3 className="text-lg font-bold text-white">Club Members</h3>
					<p className="text-sm text-muted mt-0.5">
						{filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
						{filteredMembers.length !== members.length && ` (filtered from ${members.length})`}
					</p>
				</div>
				<div className="flex items-center gap-2 w-full sm:w-auto">
					<div className="flex-1 sm:flex-initial sm:w-64">
						<Input
							placeholder="Search by name or email..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							leftIcon={<Search size={16} />}
							aria-label="Search members"
						/>
					</div>
					<Button
						variant={"ghost"}
						className="relative"
						onClick={() => setShowFilters(!showFilters)}
						leftIcon={<Filter size={16} />}
						aria-expanded={showFilters}
						aria-controls="member-filter-panel">
						{hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-accent absolute -top-0.5 -right-0.5" />}
						Filters
					</Button>
					<Button variant="outline" size={"sm"} onClick={onInvite} leftIcon={<Plus size={16} />}>
						Invite
					</Button>
				</div>
			</div>

			{/* Collapsible Filter Panel */}
			<AnimatePresence>
				{showFilters && (
					<motion.div
						id="member-filter-panel"
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
						className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
						<div className="flex h-7 items-center justify-between">
							<span className="text-sm font-medium text-white">Filter Options</span>
							{hasActiveFilters && (
								<Button
									variant="ghost"
									size="sm"
									onClick={clearFilters}
									leftIcon={<RotateCcw size={14} />}
									className="text-muted hover:text-white">
									Clear All
								</Button>
							)}
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							{/* Date From */}
							<Input
								type="date"
								inlineLabel="From Date"
								value={dateFrom}
								onChange={(e) => setDateFrom(e.target.value)}
								leftIcon={<Calendar size={16} />}
							/>

							{/* Date To */}
							<Input
								type="date"
								inlineLabel="To Date"
								value={dateTo}
								onChange={(e) => setDateTo(e.target.value)}
								leftIcon={<Calendar size={16} />}
							/>

							{/* Sort By */}
							<Select
								inlineLabel="Sort By"
								options={memberSortOptions}
								value={sortBy}
								onChange={(val) => setSortBy(val)}
								leftIcon={<ArrowDownUp size={16} />}
							/>

							{/* Sort Direction */}
							<Select
								inlineLabel="Order"
								options={memberDirectionOptions}
								value={sortDirection}
								onChange={(val) => setSortDirection(val as SortDirection)}
								leftIcon={<Clock size={16} />}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{members.length === 0 ? (
				<EmptyState
					icon={UserPlus}
					title="No members yet"
					description="Invite members to join your club"
					action={{
						label: "Invite Member",
						onClick: onInvite,
						icon: Plus,
					}}
				/>
			) : filteredMembers.length === 0 ? (
				<EmptyState
					icon={Search}
					title="No members found"
					description={search || hasActiveFilters ? "Try adjusting your filters or search terms." : "No members match your criteria."}
					action={
						hasActiveFilters
							? {
									label: "Clear Filters",
									onClick: clearFilters,
									icon: RotateCcw,
							  }
							: undefined
					}
				/>
			) : (
				<div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
					<table className="w-full">
						<thead>
							<tr className="border-b border-white/10">
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Member</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Role</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Skill Level</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Joined</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Status</th>
								<th className="text-right text-xs font-medium text-muted px-4 py-3">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredMembers.map((member) => (
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
			)}

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

// --- Registrations List (New Logic) ---

interface RegistrationsListProps {
	clubId: string;
	status: RegistrationStatus;
}

// Sort options for dropdown
const sortOptions = [
	{ value: RegistrationSortBy.SubmittedAt, label: "Submitted Date" },
	{ value: RegistrationSortBy.UserName, label: "Name" },
];

const directionOptions = [
	{ value: SortDirection.Descending, label: "Newest First" },
	{ value: SortDirection.Ascending, label: "Oldest First" },
];

// Loading skeleton for registration cards
function RegistrationCardSkeleton() {
	return (
		<div className="p-4 rounded-xl bg-white/5 border border-white/10">
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
	const [sortBy, setSortBy] = useState<RegistrationSortBy>(RegistrationSortBy.SubmittedAt);
	const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.Descending);
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [showFilters, setShowFilters] = useState(false);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
		queryKey: ["club-registrations", clubId, status, search, sortBy, sortDirection, dateFrom, dateTo],
		queryFn: ({ pageParam }) =>
			getClubRegistrationsPaged(clubId, {
				status,
				search,
				sortBy,
				sortDirection,
				submittedFrom: dateFrom || undefined,
				submittedTo: dateTo || undefined,
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

	const clearFilters = () => {
		setDateFrom("");
		setDateTo("");
		setSortBy(RegistrationSortBy.SubmittedAt);
		setSortDirection(SortDirection.Descending);
	};

	const hasActiveFilters = dateFrom || dateTo || sortBy !== RegistrationSortBy.SubmittedAt || sortDirection !== SortDirection.Descending;

	const registrations = data?.pages.flatMap((page) => page.items ?? []).filter((item): item is ClubRegistration => item != null) || [];

	const statusLabels: Record<RegistrationStatus, string> = {
		[RegistrationStatus.Pending]: "Pending",
		[RegistrationStatus.Waitlist]: "Waitlisted",
		[RegistrationStatus.Accepted]: "Accepted",
		[RegistrationStatus.Declined]: "Declined",
	};

	return (
		<div className="space-y-4">
			{/* Header with search and filters */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h3 className="text-lg font-bold text-white">{statusLabels[status]} Registrations</h3>
					<p className="text-sm text-muted mt-0.5">
						{isLoading ? "Loading..." : `${registrations.length} registration${registrations.length !== 1 ? "s" : ""}`}
					</p>
				</div>
				<div className="flex items-center gap-2 w-full sm:w-auto">
					<div className="flex-1 sm:flex-initial sm:w-64">
						<Input
							placeholder="Search by name or email..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							leftIcon={<Search size={16} />}
							aria-label="Search registrations"
						/>
					</div>
					<Button
						variant={"ghost"}
						className="relative"
						onClick={() => setShowFilters(!showFilters)}
						leftIcon={<Filter size={16} />}
						aria-expanded={showFilters}
						aria-controls="filter-panel">
						{hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-accent absolute -top-0.5 -right-0.5" />}
						Filters
					</Button>
				</div>
			</div>

			{/* Collapsible Filter Panel */}
			<AnimatePresence>
				{showFilters && (
					<motion.div
						id="filter-panel"
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
						className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
						<div className="flex h-7 items-center justify-between">
							<span className="text-sm font-medium text-white">Filter Options</span>
							{hasActiveFilters && (
								<Button
									variant="ghost"
									size="sm"
									onClick={clearFilters}
									leftIcon={<RotateCcw size={14} />}
									className="text-muted hover:text-white">
									Clear All
								</Button>
							)}
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							{/* Date From */}
							<Input
								type="date"
								inlineLabel="From Date"
								value={dateFrom}
								onChange={(e) => setDateFrom(e.target.value)}
								leftIcon={<Calendar size={16} />}
							/>

							{/* Date To */}
							<Input
								type="date"
								inlineLabel="To Date"
								value={dateTo}
								onChange={(e) => setDateTo(e.target.value)}
								leftIcon={<Calendar size={16} />}
							/>

							{/* Sort By */}
							<Select
								inlineLabel="Sort By"
								options={sortOptions}
								value={sortBy}
								onChange={(val) => setSortBy(val as RegistrationSortBy)}
								leftIcon={<ArrowDownUp size={16} />}
							/>

							{/* Sort Direction */}
							<Select
								inlineLabel="Order"
								options={directionOptions}
								value={sortDirection}
								onChange={(val) => setSortDirection(val as SortDirection)}
								leftIcon={<Clock size={16} />}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Loading State with Skeletons */}
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
						search || hasActiveFilters
							? "Try adjusting your filters or search terms."
							: `No ${statusLabels[status].toLowerCase()} registrations yet.`
					}
					action={
						hasActiveFilters
							? {
									label: "Clear Filters",
									onClick: clearFilters,
									icon: RotateCcw,
							  }
							: undefined
					}
				/>
			) : (
				<div className="space-y-2" role="list" aria-label={`${statusLabels[status]} registrations list`}>
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
		router.push(`/dashboard/clubs/${clubId}/registrations/${registration.id}`);
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
			className={`group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200 cursor-pointer ${
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
						<div className="w-10 h-10 rounded-lg bg-linear-to-br from-accent/30 to-primary/30 flex items-center justify-center text-sm font-bold text-white border border-white/10">
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
