"use client";

import { Avatar, Button, EmptyState, Modal, UserSelectorModal } from "@/components";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { RoleCheckboxGroup } from "@/components/ui/role-checkbox-group";
import { RoleBadgeList } from "@/components/ui/role-badge";
import { getGroupMembers, removeGroupMember, updateGroupMember, UpdateGroupMemberRequest } from "@/lib/api/clubs";
import { addGroupMembers } from "@/lib/api/clubs/clubs";
import { GROUP_ROLE_OPTIONS } from "@/lib/constants/roles";
import { Club, ClubMember, Group, GroupMember, GroupRole } from "@/lib/models/Club";
import { UserProfile } from "@/lib/models/User";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownAZ, Clock, Edit, Plus, RotateCcw, Search, UserMinus, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

interface MembersTabProps {
	group: Group;
	groupId: string;
	club?: Club;
	clubMembers?: ClubMember[];
}

// Sort options for members (matching club members pattern)
const MEMBER_SORT_OPTIONS = [
	{ value: "joined-desc", label: "Newest First", icon: <Clock size={14} /> },
	{ value: "joined-asc", label: "Oldest First", icon: <Clock size={14} /> },
	{ value: "name-asc", label: "Name (A-Z)", icon: <ArrowDownAZ size={14} /> },
];

// Role filter options for groups
const ROLE_FILTERS = [
	{ value: "all", label: "All Roles" },
	{ value: "Leader", label: "Leader" },
	{ value: "Captain", label: "Captain" },
	{ value: "Coach", label: "Coach" },
];

// Helper to extract role strings from role objects or strings
function extractRoleStrings(roles: any[] | undefined): string[] {
	if (!roles) return [];
	return roles.map((r) => (typeof r === "string" ? r : r?.role)).filter(Boolean);
}

export default function MembersTab({ group, groupId, club, clubMembers = [] }: MembersTabProps) {
	// Extract user profiles from club members for the user selector
	const clubMemberUsers: UserProfile[] = clubMembers
		.filter((m) => m.userProfile)
		.map((m) => m.userProfile!);

	const [showAddModal, setShowAddModal] = useState(false);
	const [editingMember, setEditingMember] = useState<GroupMember | null>(null);
	const [removingMember, setRemovingMember] = useState<GroupMember | null>(null);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<string>("joined-desc");
	const [roleFilter, setRoleFilter] = useState<string>("all");

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
		setRoleFilter("all");
	};

	const activeFilterCount = roleFilter !== "all" ? 1 : 0;

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
			// Role filter
			if (roleFilter !== "all" && !extractRoleStrings(member.roles).includes(roleFilter)) {
				return false;
			}
			return true;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "name-asc":
					return getMemberDisplayName(a).localeCompare(getMemberDisplayName(b));
				case "joined-asc":
					return new Date(a.clubMember?.createdAt || 0).getTime() - new Date(b.clubMember?.createdAt || 0).getTime();
				case "joined-desc":
				default:
					return new Date(b.clubMember?.createdAt || 0).getTime() - new Date(a.clubMember?.createdAt || 0).getTime();
			}
		});

	// Filter content for ListToolbar
	const filterContent = (
		<div className="space-y-2">
			<p className="text-xs font-medium text-muted-foreground">Role</p>
			<div className="flex flex-wrap gap-2">
				{ROLE_FILTERS.map((filter) => (
					<button
						key={filter.value}
						type="button"
						onClick={() => setRoleFilter(filter.value)}
						className={cn(
							"px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
							roleFilter === filter.value
								? "bg-foreground/10 text-foreground border-foreground/30"
								: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground hover:border-foreground/20"
						)}>
						{filter.label}
					</button>
				))}
			</div>
		</div>
	);

	return (
		<div className="flex flex-col gap-4 h-full">
			{/* Header Row: Title + Add Button */}
			<div className="flex items-center justify-between shrink-0">
				<h2 className="text-lg font-semibold text-foreground">Members</h2>
				<Button variant="outline" onClick={() => setShowAddModal(true)} leftIcon={<UserPlus size={16} />}>
					Add Member
				</Button>
			</div>

			{/* Toolbar */}
			<ListToolbar
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search by name or email..."
				sortOptions={MEMBER_SORT_OPTIONS}
				sortBy={sortBy}
				onSortChange={setSortBy}
				filterContent={filterContent}
				activeFilterCount={activeFilterCount}
				onClearFilters={clearFilters}
				count={filteredMembers.length}
				itemLabel="member"
				showViewToggle={false}
			/>

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
					description={search || activeFilterCount > 0 ? "Try adjusting your filters or search terms." : "No members match your criteria."}
					action={
						activeFilterCount > 0
							? {
									label: "Clear Filters",
									onClick: clearFilters,
									icon: RotateCcw,
								}
							: search
								? {
										label: "Clear Search",
										onClick: () => setSearch(""),
										icon: Search,
									}
								: undefined
					}
				/>
			) : (
				<div className="rounded-xl bg-surface border border-border overflow-hidden">
					<table className="w-full">
						<thead>
							<tr className="border-b border-border">
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Member</th>
								<th className="text-left text-xs font-medium text-muted px-4 py-3">Group Roles</th>
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
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				selectedUsers={[]}
				onConfirm={(users) => addMemberMutation.mutate(users.map((u) => u.id))}
				users={clubMemberUsers}
				excludeUserIds={group.members?.map((m) => m.userId) || []}
				title="Add Group Member"
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

// Helper function for badge color (club roles only)
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
			return "bg-hover text-muted border-border";
	}
};

// Group Member Row Component
function GroupMemberRow({ member, onEdit, onRemove }: { member: GroupMember; onEdit: () => void; onRemove: () => void }) {
	const userProfile = member.userProfile;
	const displayName = userProfile ? `${userProfile.name} ${userProfile.surname}` : "Unknown Member";

	return (
		<tr className="border-b border-border hover:bg-hover group">
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
				<RoleBadgeList roles={extractRoleStrings(member.roles)} emptyText="Member" />
			</td>
			<td className="px-4 py-3">
				<span className={`px-2 py-1 rounded text-xs font-medium border ${getClubRoleBadgeColor(member.clubMember?.roles[0])}`}>
					{member.clubMember?.roles[0] || "Member"}
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
						className="p-2 rounded-lg hover:bg-hover text-muted hover:text-white transition-colors"
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
	const [roles, setRoles] = useState<GroupRole[]>([]);

	// Reset roles when member changes
	// Handle both string roles and role assignment objects from backend
	useEffect(() => {
		if (member) {
			setRoles(extractRoleStrings(member.roles) as GroupRole[]);
		}
	}, [member?.id]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({ roles });
	};

	if (!isOpen || !member) return null;

	const displayName = member.clubMember?.userProfile
		? `${member.clubMember.userProfile.name} ${member.clubMember.userProfile.surname}`
		: "Unknown Member";

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Edit Group Member">
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Member Info */}
				<div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border">
					{member.clubMember?.userProfile && <Avatar name={displayName} src={member.clubMember.userProfile.imageUrl} />}
					<div>
						<div className="font-medium text-white">{displayName}</div>
						<div className="text-sm text-muted">{member.clubMember?.userProfile?.email}</div>
					</div>
				</div>

				{/* Role Selection */}
				<div className="space-y-2">
					<label className="text-sm font-medium text-foreground">Group Roles</label>
					<RoleCheckboxGroup
						availableRoles={GROUP_ROLE_OPTIONS}
						selectedRoles={roles}
						onChange={setRoles}
					/>
				</div>

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
