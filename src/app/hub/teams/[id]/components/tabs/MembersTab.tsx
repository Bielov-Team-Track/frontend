"use client";

import { Avatar, Button, EmptyState, Modal, UserSelectorModal } from "@/components";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { RoleCheckboxGroup } from "@/components/ui/role-checkbox-group";
import { RoleBadgeList } from "@/components/ui/role-badge";
import { addTeamMember, removeTeamMember, updateTeamMember } from "@/lib/api/clubs";
import { TEAM_ROLE_OPTIONS } from "@/lib/constants/roles";
import { Club, ClubMember, Team, TeamMember, TeamRole, UpdateTeamMemberRequest, VolleyballPosition } from "@/lib/models/Club";
import { UserProfile } from "@/lib/models/User";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDownAZ, Edit, Plus, RotateCcw, Search, UserMinus, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

interface MembersTabProps {
	team: Team;
	teamId: string;
	club?: Club;
	clubMembers?: ClubMember[];
}

// Sort options for members
const MEMBER_SORT_OPTIONS = [
	{ value: "name-asc", label: "Name (A-Z)", icon: <ArrowDownAZ size={14} /> },
	{ value: "name-desc", label: "Name (Z-A)", icon: <ArrowDownAZ size={14} /> },
];

// Role filter options for teams
const ROLE_FILTERS = [
	{ value: "all", label: "All Roles" },
	{ value: "Captain", label: "Captain" },
	{ value: "Coach", label: "Coach" },
	{ value: "AssistantCoach", label: "Asst. Coach" },
	{ value: "Manager", label: "Manager" },
];

// Helper to extract role strings from role objects or strings
function extractRoleStrings(roles: any[] | undefined): string[] {
	if (!roles) return [];
	return roles.map((r) => (typeof r === "string" ? r : r?.role)).filter(Boolean);
}

export default function MembersTab({ team, teamId, club, clubMembers = [] }: MembersTabProps) {
	// Extract user profiles from club members for the user selector
	const clubMemberUsers: UserProfile[] = clubMembers
		.filter((m) => m.userProfile)
		.map((m) => m.userProfile!);

	const [showAddModal, setShowAddModal] = useState(false);
	const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
	const [removingMember, setRemovingMember] = useState<TeamMember | null>(null);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<string>("name-asc");
	const [roleFilter, setRoleFilter] = useState<string>("all");

	const queryClient = useQueryClient();

	const addMemberMutation = useMutation({
		mutationFn: ({ userId, positions }: { userId: string; positions: string[] }) =>
			addTeamMember(teamId, userId, positions),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["team", teamId] });
			setShowAddModal(false);
		},
	});

	const updateMemberMutation = useMutation({
		mutationFn: ({ memberId, data }: { memberId: string; data: UpdateTeamMemberRequest }) =>
			updateTeamMember(teamId, memberId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["team", teamId] });
			setEditingMember(null);
		},
	});

	const removeMemberMutation = useMutation({
		mutationFn: (userId: string) => removeTeamMember(teamId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["team", teamId] });
			setRemovingMember(null);
		},
	});

	const getMemberDisplayName = (member: TeamMember) => {
		if (member.userProfile) {
			return `${member.userProfile?.name} ${member.userProfile?.surname}`;
		}
		return "Unknown Member";
	};

	const clearFilters = () => {
		setRoleFilter("all");
	};

	const activeFilterCount = roleFilter !== "all" ? 1 : 0;

	const members = team.members || [];

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
			// Role filter
			if (roleFilter !== "all" && !extractRoleStrings(member.roles).includes(roleFilter)) {
				return false;
			}
			return true;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "name-desc":
					return getMemberDisplayName(b).localeCompare(getMemberDisplayName(a));
				case "name-asc":
				default:
					return getMemberDisplayName(a).localeCompare(getMemberDisplayName(b));
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
						description="Add members to this team from the club"
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
									<th className="text-left text-xs font-medium text-muted px-4 py-3">Team Roles</th>
									<th className="text-left text-xs font-medium text-muted px-4 py-3">Positions</th>
									<th className="text-left text-xs font-medium text-muted px-4 py-3">Jersey</th>
									<th className="text-left text-xs font-medium text-muted px-4 py-3">Status</th>
									<th className="text-right text-xs font-medium text-muted px-4 py-3">Actions</th>
								</tr>
							</thead>
							<tbody>
								{filteredMembers.map((member) => (
									<TeamMemberRow
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
				onConfirm={(users) => {
					if (users.length > 0) {
						addMemberMutation.mutate({ userId: users[0].id, positions: [] });
					}
				}}
				users={clubMemberUsers}
				excludeUserIds={team.members?.map((m) => m.userId) || []}
				title="Add Team Member"
			/>

			{/* Edit Member Modal */}
			<EditTeamMemberModal
				isOpen={!!editingMember}
				member={editingMember}
				onClose={() => setEditingMember(null)}
				onSubmit={(data) => updateMemberMutation.mutate({ memberId: editingMember!.id, data })}
				isLoading={updateMemberMutation.isPending}
			/>

			{/* Remove Member Confirmation */}
			<DeleteConfirmModal
				isOpen={!!removingMember}
				title="Remove Member"
				itemName={removingMember ? getMemberDisplayName(removingMember) : ""}
				description={
					removingMember
						? `Are you sure you want to remove ${getMemberDisplayName(removingMember)} from this team? They will remain a club member.`
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

// Position badge helper
const getPositionLabel = (position: VolleyballPosition): string => {
	const labels: Record<VolleyballPosition, string> = {
		[VolleyballPosition.Setter]: "Setter",
		[VolleyballPosition.OppositeHitter]: "Opposite",
		[VolleyballPosition.OutsideHitter]: "Outside",
		[VolleyballPosition.MiddleBlocker]: "Middle",
		[VolleyballPosition.Libero]: "Libero",
		[VolleyballPosition.DefensiveSpecialist]: "DS",
	};
	return labels[position] || position;
};

// Team Member Row Component
function TeamMemberRow({ member, onEdit, onRemove }: { member: TeamMember; onEdit: () => void; onRemove: () => void }) {
	const userProfile = member.userProfile;
	const displayName = userProfile ? `${userProfile.name} ${userProfile.surname}` : "Unknown Member";

	return (
		<tr className="border-b border-border hover:bg-muted/10 group">
			<td className="px-4 py-3">
				<div className="flex items-center gap-3">
					{userProfile ? (
						<Avatar name={displayName} src={userProfile.imageUrl} />
					) : (
						<div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-sm font-bold text-muted">?</div>
					)}
					<div>
						<div className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{displayName}</div>
						<div className="text-xs text-muted">{userProfile?.email || "No email"}</div>
					</div>
				</div>
			</td>
			<td className="px-4 py-3">
				<RoleBadgeList roles={extractRoleStrings(member.roles)} />
			</td>
			<td className="px-4 py-3">
				{member.positions && member.positions.length > 0 ? (
					<div className="flex flex-wrap gap-1">
						{member.positions.map((pos) => (
							<span
								key={pos}
								className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
								{getPositionLabel(pos)}
							</span>
						))}
					</div>
				) : (
					<span className="text-xs text-muted">—</span>
				)}
			</td>
			<td className="px-4 py-3">
				{member.jerseyNumber ? (
					<span className="px-2 py-0.5 rounded text-xs font-medium bg-hover text-foreground">
						#{member.jerseyNumber}
					</span>
				) : (
					<span className="text-xs text-muted">—</span>
				)}
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
						className="p-2 rounded-lg hover:bg-hover text-muted hover:text-foreground transition-colors"
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

// Edit Team Member Modal
function EditTeamMemberModal({
	isOpen,
	member,
	onClose,
	onSubmit,
	isLoading,
}: {
	isOpen: boolean;
	member: TeamMember | null;
	onClose: () => void;
	onSubmit: (data: UpdateTeamMemberRequest) => void;
	isLoading: boolean;
}) {
	const [roles, setRoles] = useState<TeamRole[]>([]);

	// Reset roles when member changes
	// Handle both string roles and role assignment objects from backend
	useEffect(() => {
		if (member) {
			setRoles(extractRoleStrings(member.roles) as TeamRole[]);
		}
	}, [member?.id]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({ roles });
	};

	if (!isOpen || !member) return null;

	const displayName = member.userProfile
		? `${member.userProfile.name} ${member.userProfile.surname}`
		: "Unknown Member";

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Edit Team Member">
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Member Info */}
				<div className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border">
					{member.userProfile && <Avatar name={displayName} src={member.userProfile.imageUrl} />}
					<div>
						<div className="font-medium text-foreground">{displayName}</div>
						<div className="text-sm text-muted">{member.userProfile?.email}</div>
					</div>
				</div>

				{/* Role Selection */}
				<div className="space-y-2">
					<label className="text-sm font-medium text-foreground">Team Roles</label>
					<RoleCheckboxGroup
						availableRoles={TEAM_ROLE_OPTIONS}
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
