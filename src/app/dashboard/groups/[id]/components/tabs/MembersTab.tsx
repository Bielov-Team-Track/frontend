"use client";

import { Avatar, Button, EmptyState, Input, Modal, Select, UserSelectorModal } from "@/components";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import { getGroupMembers, removeGroupMember, updateGroupMember, UpdateGroupMemberRequest } from "@/lib/api/clubs";
import { addGroupMembers } from "@/lib/api/clubs/clubs";
import { Group, GroupMember, GroupRole } from "@/lib/models/Club";
import { SortDirection } from "@/lib/models/filteringAndPagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownUp, Calendar, Clock, Edit, Filter, Plus, RotateCcw, Search, UserMinus, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";

interface MembersTabProps {
	group: Group;
	groupId: string;
}

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

export default function MembersTab({ group, groupId }: MembersTabProps) {
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingMember, setEditingMember] = useState<GroupMember | null>(null);
	const [removingMember, setRemovingMember] = useState<GroupMember | null>(null);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<string>("joinedAt");
	const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.Descending);
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [showFilters, setShowFilters] = useState(false);

	const queryClient = useQueryClient();

	const addMemberMutation = useMutation({
		mutationFn: (userIds: string[]) => addGroupMembers(groupId, userIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["group", groupId] });
			queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
			setShowAddModal(false);
		},
	});

	const updateMemberMutation = useMutation({
		mutationFn: (data: UpdateGroupMemberRequest) => updateGroupMember(groupId, editingMember!.id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["group", groupId] });
			queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
			setEditingMember(null);
		},
	});

	const removeMemberMutation = useMutation({
		mutationFn: (userId: string) => removeGroupMember(groupId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["group", groupId] });
			queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
			setRemovingMember(null);
		},
	});

	const { data: groupMembers = [] } = useQuery({
		queryKey: ["group-members", groupId],
		queryFn: () => getGroupMembers(groupId),
		enabled: !!groupId,
	});

	const getMemberDisplayName = (member: GroupMember) => {
		if (member.userProfile) {
			return `${member.userProfile?.name} ${member.userProfile?.surname}`;
		}
		return "Unknown Member";
	};

	const clearFilters = () => {
		setDateFrom("");
		setDateTo("");
		setSortBy("joinedAt");
		setSortDirection(SortDirection.Descending);
	};

	const hasActiveFilters = dateFrom || dateTo || sortBy !== "joinedAt" || sortDirection !== SortDirection.Descending;

	// Use groupMembers from query if available, otherwise fall back to group.members
	const members = groupMembers.length > 0 ? groupMembers : group.members || [];

	// Filter and sort members
	const filteredMembers = members
		.filter((member) => {
			// Search filter
			if (search) {
				const searchLower = search.toLowerCase();
				const name = getMemberDisplayName(member).toLowerCase();
				const email = member.clubMember?.userProfile?.email?.toLowerCase() || "";
				if (!name.includes(searchLower) && !email.includes(searchLower)) {
					return false;
				}
			}
			// Date filters (using clubMember's joinedAt as proxy)
			if (dateFrom && member.clubMember?.createdAt) {
				if (new Date(member.clubMember.createdAt) < new Date(dateFrom)) return false;
			}
			if (dateTo && member.clubMember?.createdAt) {
				if (new Date(member.clubMember.createdAt) > new Date(dateTo)) return false;
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
					comparison = (a.role || "Member").localeCompare(b.role || "Member");
					break;
				case "joinedAt":
				default:
					comparison = new Date(a.clubMember?.createdAt || 0).getTime() - new Date(b.clubMember?.createdAt || 0).getTime();
					break;
			}
			return sortDirection === SortDirection.Ascending ? comparison : -comparison;
		});

	return (
		<div className="flex flex-col gap-4 h-full">
			{/* Header Row: Title + Add Button */}
			<div className="flex items-center justify-between shrink-0">
				<h2 className="text-lg font-semibold text-foreground">Members</h2>
				<Button variant="outline" onClick={() => setShowAddModal(true)} leftIcon={<UserPlus size={16} />}>
					Add Member
				</Button>
			</div>

			{/* Search and Filters Row */}
			<div className="flex items-center gap-2 shrink-0">
				<div className="flex-1 relative">
					<Input
						placeholder="Search by name or email..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						leftIcon={<Search size={16} />}
						aria-label="Search members"
					/>
					{search && (
						<button
							type="button"
							onClick={() => setSearch("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors">
							<X size={14} className="text-muted-foreground" />
						</button>
					)}
				</div>
				<Button
					variant="ghost"
					className="relative"
					onClick={() => setShowFilters(!showFilters)}
					leftIcon={<Filter size={16} />}
					aria-expanded={showFilters}
					aria-controls="member-filter-panel">
					{hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-accent absolute -top-0.5 -right-0.5" />}
					<span className="hidden sm:inline">Filters</span>
				</Button>
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
								<Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={<RotateCcw size={14} />} className="text-muted hover:text-white">
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
							<Input type="date" inlineLabel="To Date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} leftIcon={<Calendar size={16} />} />

							{/* Sort By */}
							<Select
								inlineLabel="Sort By"
								options={memberSortOptions}
								value={sortBy}
								onChange={(val) => setSortBy(val || "createdAt")}
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

			{/* Results Count */}
			<div className="shrink-0">
				<p className="text-sm text-muted-foreground">
					{filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
					{filteredMembers.length !== members.length && ` (filtered from ${members.length})`}
				</p>
			</div>

			{/* Content Area */}
			<div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
			{members.length === 0 ? (
				<EmptyState
					icon={UserPlus}
					title="No members yet"
					description="Add members to this group from the club"
					action={{
						label: "Add Member",
						onClick: () => setShowAddModal(true),
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
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Group Role</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Club Role</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Status</th>
								<th className="text-right text-xs font-medium text-muted px-4 py-3">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredMembers.map((member) => (
								<GroupMemberRow
									key={member.id}
									member={member}
									onEdit={() => setEditingMember(member)}
									onRemove={() => setRemovingMember(member)}
								/>
							))}
						</tbody>
					</table>
				</div>
			)}
			</div>

			{/* Add Member Modal */}
			<UserSelectorModal
				onClose={() => setShowAddModal(false)}
				selectedUsers={[]}
				isOpen={showAddModal}
				onConfirm={(users) => addMemberMutation.mutate(users.map((u) => u.id))}
				restrictToClub={group.club}
				excludeUserIds={group.members?.map((m) => m.userId) || []}
			/>

			{/* Edit Member Modal */}
			<EditGroupMemberModal
				isOpen={!!editingMember}
				member={editingMember}
				onClose={() => setEditingMember(null)}
				onSubmit={(data) => updateMemberMutation.mutate(data)}
				isLoading={updateMemberMutation.isPending}
			/>

			{/* Remove Member Confirmation */}
			<DeleteConfirmModal
				isOpen={!!removingMember}
				title="Remove Member"
				itemName={removingMember ? getMemberDisplayName(removingMember) : ""}
				description={
					removingMember
						? `Are you sure you want to remove ${getMemberDisplayName(removingMember)} from this group? They will remain a club member.`
						: undefined
				}
				onClose={() => setRemovingMember(null)}
				onConfirm={() => removingMember && removeMemberMutation.mutate(removingMember.userId)}
				isLoading={removeMemberMutation.isPending}
				confirmText="Remove"
			/>
		</div>
	);
}

// Helper functions for badge colors
const getGroupRoleBadgeColor = (role?: GroupRole) => {
	switch (role) {
		case GroupRole.Leader:
			return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
		case GroupRole.Captain:
			return "bg-purple-500/20 text-purple-400 border-purple-500/30";
		default:
			return "bg-white/10 text-muted border-white/10";
	}
};

const getClubRoleBadgeColor = (role?: string) => {
	switch (role) {
		case "Owner":
			return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
		case "Admin":
			return "bg-purple-500/20 text-purple-400 border-purple-500/30";
		case "Coach":
			return "bg-blue-500/20 text-blue-400 border-blue-500/30";
		case "Assistant":
			return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
		default:
			return "bg-white/10 text-muted border-white/10";
	}
};

// Group Member Row Component
function GroupMemberRow({ member, onEdit, onRemove }: { member: GroupMember; onEdit: () => void; onRemove: () => void }) {
	const userProfile = member.userProfile;
	const displayName = userProfile ? `${userProfile.name} ${userProfile.surname}` : "Unknown Member";

	return (
		<tr className="border-b border-white/5 hover:bg-white/5 group">
			<td className="px-4 py-3">
				<div className="flex items-center gap-3">
					{userProfile ? (
						<Avatar name={displayName} src={userProfile.imageUrl} />
					) : (
						<div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-sm font-bold text-muted">?</div>
					)}
					<div>
						<div className="text-sm font-medium text-white group-hover:text-accent transition-colors">{displayName}</div>
						<div className="text-xs text-muted">{userProfile?.email || "No email"}</div>
					</div>
				</div>
			</td>
			<td className="px-4 py-3">
				<span className={`px-2 py-1 rounded text-xs font-medium border ${getGroupRoleBadgeColor(member.role)}`}>{member.role || "Member"}</span>
			</td>
			<td className="px-4 py-3">
				<span className={`px-2 py-1 rounded text-xs font-medium border ${getClubRoleBadgeColor(member.clubMember?.role)}`}>
					{member.clubMember?.role || "Member"}
				</span>
			</td>
			<td className="px-4 py-3">
				{member.isActive ? (
					<span className="inline-flex items-center gap-1.5 text-xs text-green-400">
						<span className="w-1.5 h-1.5 rounded-full bg-green-400" />
						Active
					</span>
				) : (
					<span className="inline-flex items-center gap-1.5 text-xs text-muted">
						<span className="w-1.5 h-1.5 rounded-full bg-muted" />
						Inactive
					</span>
				)}
			</td>
			<td className="px-4 py-3 text-right">
				<div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onEdit();
						}}
						className="p-2 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors"
						title="Edit member">
						<Edit size={16} />
					</button>
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onRemove();
						}}
						className="p-2 rounded-lg hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors"
						title="Remove member">
						<UserMinus size={16} />
					</button>
				</div>
			</td>
		</tr>
	);
}

// Edit Group Member Modal
function EditGroupMemberModal({
	isOpen,
	member,
	onClose,
	onSubmit,
	isLoading,
}: {
	isOpen: boolean;
	member: GroupMember | null;
	onClose: () => void;
	onSubmit: (data: UpdateGroupMemberRequest) => void;
	isLoading: boolean;
}) {
	const [role, setRole] = useState<GroupRole>(GroupRole.Member);

	// Reset role when member changes
	useEffect(() => {
		if (member) {
			setRole(member.role || GroupRole.Member);
		}
	}, [member?.id]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({ role });
	};

	if (!isOpen || !member) return null;

	const displayName = member.clubMember?.userProfile
		? `${member.clubMember.userProfile.name} ${member.clubMember.userProfile.surname}`
		: "Unknown Member";

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Edit Group Member">
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Member Info */}
				<div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
					{member.clubMember?.userProfile && <Avatar name={displayName} src={member.clubMember.userProfile.imageUrl} />}
					<div>
						<div className="font-medium text-white">{displayName}</div>
						<div className="text-sm text-muted">{member.clubMember?.userProfile?.email}</div>
					</div>
				</div>

				{/* Role Selection */}
				<Select
					label="Group Role"
					value={role}
					onChange={(val) => setRole(val as GroupRole)}
					options={Object.values(GroupRole).map((r) => ({ value: r, label: r }))}
				/>

				{/* Actions */}
				<div className="flex gap-3 pt-4">
					<Button type="button" variant="ghost" onClick={onClose} className="flex-1">
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading} loading={isLoading} className="flex-1">
						Save Changes
					</Button>
				</div>
			</form>
		</Modal>
	);
}
