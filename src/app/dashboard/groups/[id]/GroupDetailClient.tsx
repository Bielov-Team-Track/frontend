"use client";

import { Avatar, Button, ColorPicker, DEFAULT_PRESET_COLORS, EmptyState, Input, Modal, Select, TextArea } from "@/components";
import { PostFeed } from "@/components/features/posts";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import { addGroupMember, deleteGroup, getClub, getClubMembers, getGroup, getGroupMembers, removeGroupMember, updateGroup, updateGroupMember, UpdateGroupMemberRequest } from "@/lib/api/clubs";
import { ClubMember, Group, GroupMember, GroupRole, SkillLevel, UpdateGroupRequest } from "@/lib/models/Club";
import { SortDirection } from "@/lib/models/filteringAndPagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownUp, ArrowLeft, Calendar, Clock, Edit, Filter, Layers, MapPin, MessageSquare, Plus, RotateCcw, Save, Search, Settings, UserMinus, UserPlus, Users, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
	groupId: string;
}

type TabType = "events" | "posts" | "members" | "settings";

// Mock Event interface (consistent with ClubDetailClient)
interface GroupEvent {
	id: string;
	name: string;
	description?: string;
	startTime: Date;
	endTime: Date;
	location?: string;
	createdAt: Date;
}

// Mock Post interface
interface GroupPost {
	id: string;
	authorName: string;
	content: string;
	createdAt: Date;
	likes: number;
	comments: number;
}

export default function GroupDetailClient({ groupId }: Props) {
	const [activeTab, setActiveTab] = useState<TabType>("events");

	const { data: group, isLoading: groupLoading } = useQuery({
		queryKey: ["group", groupId],
		queryFn: () => getGroup(groupId),
	});

	const { data: club } = useQuery({
		queryKey: ["club", group?.clubId],
		queryFn: () => getClub(group!.clubId),
		enabled: !!group?.clubId,
	});

	if (groupLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<span className="loading loading-spinner loading-lg text-accent" />
			</div>
		);
	}

	if (!group) {
		return (
			<div className="text-center py-20">
				<Layers className="w-16 h-16 text-muted mx-auto mb-4" />
				<h2 className="text-xl font-bold text-white mb-2">Group not found</h2>
				<Link href="/dashboard/clubs" className="text-accent hover:underline">
					Back to clubs
				</Link>
			</div>
		);
	}

	const tabs = [
		{ id: "events" as const, label: "Events", icon: Calendar },
		{ id: "posts" as const, label: "Posts", icon: MessageSquare },
		{
			id: "members" as const,
			label: "Members",
			icon: Users,
			count: group.members?.length || 0,
		},
		{ id: "settings" as const, label: "Settings", icon: Settings },
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link href={`/dashboard/clubs/${group.clubId}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
					<ArrowLeft size={20} />
				</Link>
				<div className="flex-1">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold text-white">{group.name}</h1>
						{group.skillLevel && <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-muted">{group.skillLevel}</span>}
					</div>
					<div className="flex items-center gap-2 text-sm text-muted">
						<span>Group</span>
						<span>•</span>
						<Link href={`/dashboard/clubs/${group.clubId}`} className="hover:text-accent">
							{club?.name || "Loading club..."}
						</Link>
					</div>
				</div>
			</div>

			{/* Group Banner/Info */}
			<div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
				{/* Banner Area (using color) */}
				<div
					className="h-32 relative"
					style={{
						backgroundColor: group.color || "#6B7280",
						opacity: 0.8,
					}}>
					<div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
				</div>

				{/* Info Row */}
				<div className="p-6 flex items-center gap-6">
					{/* Icon */}
					<Avatar name={group.name} size="lg" color={group.color} variant={"group"} />

					{/* Details */}
					<div className="flex-1 min-w-0">
						<h2 className="text-xl font-bold text-white truncate">{group.name}</h2>
						{group.description && <p className="text-sm text-muted truncate">{group.description}</p>}
					</div>

					{/* Quick Stats */}
					<div className="flex gap-6">
						<div className="text-center">
							<div className="text-2xl font-bold text-white">{group.members?.length || 0}</div>
							<div className="text-xs text-muted">Members</div>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className="border-t border-white/10 px-6">
					<div className="flex gap-1 overflow-x-auto no-scrollbar">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
									activeTab === tab.id ? "text-accent" : "text-muted hover:text-white"
								}`}>
								<tab.icon size={16} />
								{tab.label}
								{tab.count !== undefined && <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-xs">{tab.count}</span>}
								{activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Tab Content */}
			<div className="min-h-100">
				{activeTab === "events" && <EventsTab />}
				{activeTab === "posts" && <PostsTab group={group} />}
				{activeTab === "members" && <MembersTab group={group} groupId={groupId} />}
				{activeTab === "settings" && <SettingsTab group={group} clubId={group.clubId} />}
			</div>
		</div>
	);
}

// Events Tab
function EventsTab() {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [events, setEvents] = useState<GroupEvent[]>([]);

	const handleCreateEvent = (event: Omit<GroupEvent, "id" | "createdAt">) => {
		const newEvent: GroupEvent = {
			...event,
			id: crypto.randomUUID(),
			createdAt: new Date(),
		};
		setEvents([newEvent, ...events]);
		setShowCreateModal(false);
	};

	const formatDateTime = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-bold text-white">Group Events</h3>
				<Button onClick={() => setShowCreateModal(true)} variant={"outline"}>
					<Plus size={16} />
					Create Event
				</Button>
			</div>

			{/* Events List */}
			{events.length === 0 ? (
				<EmptyState
					icon={Calendar}
					title="No events yet"
					description="Create events for your group members"
					action={{ icon: Plus, label: "Create event", onClick: () => setShowCreateModal(true) }}
				/>
			) : (
				<div className="space-y-3">
					{events.map((event) => (
						<div key={event.id} className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-accent/30 transition-colors">
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1 min-w-0">
									<h4 className="font-bold text-white truncate">{event.name}</h4>
									{event.description && <p className="text-sm text-muted line-clamp-2 mt-1">{event.description}</p>}
									<div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted">
										<div className="flex items-center gap-1.5">
											<Clock size={14} />
											<span>{formatDateTime(event.startTime)}</span>
										</div>
										{event.location && (
											<div className="flex items-center gap-1.5">
												<MapPin size={14} />
												<span>{event.location}</span>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Create Event Modal */}
			{showCreateModal && <CreateGroupEventModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateEvent} />}
		</div>
	);
}

// Posts Tab
function PostsTab({ group }: { group: Group }) {
	return <PostFeed contextType="group" contextId={group.id} contextName={group.name} />;
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

// Members Tab
function MembersTab({ group, groupId }: { group: Group; groupId: string }) {
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
		mutationFn: (userId: string) => addGroupMember(groupId, userId),
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

	const { data: clubMembers = [] } = useQuery({
		queryKey: ["club-members", group?.clubId],
		queryFn: () => getClubMembers(group!.clubId),
		enabled: !!group?.clubId,
	});

	const getMemberDisplayName = (member: GroupMember) => {
		if (member.clubMember?.userProfile) {
			return `${member.clubMember.userProfile.name} ${member.clubMember.userProfile.surname}`;
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
	const members = groupMembers.length > 0 ? groupMembers : (group.members || []);

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
			if (dateFrom && member.clubMember?.joinedAt) {
				if (new Date(member.clubMember.joinedAt) < new Date(dateFrom)) return false;
			}
			if (dateTo && member.clubMember?.joinedAt) {
				if (new Date(member.clubMember.joinedAt) > new Date(dateTo)) return false;
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
					comparison = new Date(a.clubMember?.joinedAt || 0).getTime() - new Date(b.clubMember?.joinedAt || 0).getTime();
					break;
			}
			return sortDirection === SortDirection.Ascending ? comparison : -comparison;
		});

	return (
		<div className="space-y-4">
			{/* Header with search and filters */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h3 className="text-lg font-bold text-white">Group Members</h3>
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
					<Button variant="outline" size={"sm"} onClick={() => setShowAddModal(true)} leftIcon={<UserPlus size={16} />}>
						Add
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
									groupId={groupId}
									onEdit={() => setEditingMember(member)}
									onRemove={() => setRemovingMember(member)}
								/>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Add Member Modal */}
			<Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Group Member">
				<AddGroupMemberModal
					clubMembers={clubMembers}
					currentMemberIds={members.map((m) => m.clubMemberId)}
					onClose={() => setShowAddModal(false)}
					onAdd={(userId) => addMemberMutation.mutate(userId)}
					isLoading={addMemberMutation.isPending}
				/>
			</Modal>

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
				onConfirm={() => removingMember && removeMemberMutation.mutate(removingMember.clubMember!.userId)}
				isLoading={removeMemberMutation.isPending}
				confirmText="Remove"
			/>
		</div>
	);
}

// Group Member Row Component
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

function GroupMemberRow({
	member,
	groupId,
	onEdit,
	onRemove,
}: {
	member: GroupMember;
	groupId: string;
	onEdit: () => void;
	onRemove: () => void;
}) {
	const userProfile = member.clubMember?.userProfile;
	const displayName = userProfile ? `${userProfile.name} ${userProfile.surname}` : "Unknown Member";

	return (
		<tr className="border-b border-white/5 hover:bg-white/5 group">
			<td className="px-4 py-3">
				<div className="flex items-center gap-3">
					{userProfile ? (
						<Avatar name={displayName} src={userProfile.imageUrl} />
					) : (
						<div className="w-10 h-10 rounded-full bg-background-light flex items-center justify-center text-sm font-bold text-muted">?</div>
					)}
					<div>
						<div className="text-sm font-medium text-white group-hover:text-accent transition-colors">{displayName}</div>
						<div className="text-xs text-muted">{userProfile?.email || "No email"}</div>
					</div>
				</div>
			</td>
			<td className="px-4 py-3">
				<span className={`px-2 py-1 rounded text-xs font-medium border ${getGroupRoleBadgeColor(member.role)}`}>
					{member.role || "Member"}
				</span>
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
					{member.clubMember?.userProfile && (
						<Avatar name={displayName} src={member.clubMember.userProfile.imageUrl} />
					)}
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

// Settings Tab
function SettingsTab({ group, clubId }: { group: Group; clubId: string }) {
	const queryClient = useQueryClient();
	const router = useRouter();

	const updateMutation = useMutation({
		mutationFn: (data: UpdateGroupRequest) => updateGroup(group.id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["group", group.id] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteGroup(group.id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["club-groups", clubId],
			});
			router.push(`/dashboard/clubs/${clubId}`);
		},
	});

	return (
		<div className="space-y-8">
			{/* General Settings */}
			<div className="space-y-6">
				<h3 className="text-lg font-bold text-white">Group Settings</h3>
				<GroupSettingsForm group={group} onSubmit={(data) => updateMutation.mutate(data)} isLoading={updateMutation.isPending} />
			</div>

			{/* Danger Zone */}
			<div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6">
				<h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
				<p className="text-muted text-sm mb-4">Once you delete a group, there is no going back. Please be certain.</p>
				<Button
					variant="destructive"
					onClick={() => {
						if (confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
							deleteMutation.mutate();
						}
					}}
					disabled={deleteMutation.isPending}>
					{deleteMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : "Delete Group"}
				</Button>
			</div>
		</div>
	);
}

function CreateGroupEventModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: Omit<GroupEvent, "id" | "createdAt">) => void }) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [location, setLocation] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !startTime || !endTime) return;

		onSubmit({
			name: name.trim(),
			description: description.trim(),
			startTime: new Date(startTime),
			endTime: new Date(endTime),
			location: location.trim(),
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
			<div className="relative w-full max-w-md rounded-2xl bg-background-light border border-white/10 shadow-2xl">
				<div className="flex items-center justify-between p-6 border-b border-white/10">
					<h3 className="text-lg font-bold text-white">Create Event</h3>
					<button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
						<X size={18} className="text-muted" />
					</button>
				</div>
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-medium text-muted mb-2">Event Name *</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-muted mb-2">Description</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={2}
							className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent resize-none"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-muted mb-2">Start Time *</label>
							<input
								type="datetime-local"
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
								required
								className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-muted mb-2">End Time *</label>
							<input
								type="datetime-local"
								value={endTime}
								onChange={(e) => setEndTime(e.target.value)}
								required
								className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-muted mb-2">Location</label>
						<input
							type="text"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent"
						/>
					</div>
					<div className="flex gap-3 pt-4">
						<button type="button" onClick={onClose} className="flex-1 btn bg-white/5 hover:bg-white/10 border-white/10 text-white">
							Cancel
						</button>
						<button type="submit" className="flex-1 btn bg-accent hover:bg-accent/90 text-white border-none">
							Create Event
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

function AddGroupMemberModal({
	clubMembers,
	currentMemberIds,
	onClose,
	onAdd,
	isLoading,
}: {
	clubMembers: ClubMember[];
	currentMemberIds: string[];
	onClose: () => void;
	onAdd: (userId: string) => void;
	isLoading: boolean;
}) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredMembers = clubMembers
		.filter((member) => !currentMemberIds.includes(member.id))
		.filter((member) => {
			const name = `${member.userProfile?.name || ""} ${member.userProfile?.surname || ""}`.toLowerCase();
			return name.includes(searchQuery.toLowerCase());
		});

	return (
		<div className="flex flex-col gap-4">
			<div>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search club members..."
						className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-hidden focus:border-accent"
					/>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto space-y-2">
				{filteredMembers.length === 0 ? (
					<div className="text-center py-8 text-muted">
						<p>No available members found</p>
					</div>
				) : (
					filteredMembers.map((member) => (
						<div
							key={member.id}
							className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-sm font-bold text-muted">
									{member.userProfile?.name?.[0] || "?"}
								</div>
								<div>
									<div className="text-sm font-medium text-white">
										{member.userProfile?.name} {member.userProfile?.surname}
									</div>
									<div className="text-xs text-muted">{member.role}</div>
								</div>
							</div>
							<button
								onClick={() => onAdd(member.userId)}
								disabled={isLoading}
								className="p-2 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent transition-colors">
								<Plus size={18} />
							</button>
						</div>
					))
				)}
			</div>
		</div>
	);
}

function GroupSettingsForm({ group, onSubmit, isLoading }: { group: Group; onSubmit: (data: UpdateGroupRequest) => void; isLoading: boolean }) {
	const [name, setName] = useState(group.name);
	const [description, setDescription] = useState(group.description || "");
	const [color, setColor] = useState(group.color);
	const [skillLevel, setSkillLevel] = useState<string>(group.skillLevel || "");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		onSubmit({
			name: name.trim(),
			description: description.trim() || undefined,
			color,
			skillLevel: skillLevel || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-4">
					<Input type="text" value={name} label="Group Name" onChange={(e) => setName(e.target.value)} />
					<TextArea
						label="Description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={3}
						className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-hidden focus:border-accent resize-none"
					/>
				</div>
				<div className="space-y-4">
					<Select
						label="Skill Level"
						value={skillLevel}
						options={Object.values(SkillLevel).map((level) => ({ label: level, value: level }))}
						onChange={(value) => setSkillLevel(value!)}></Select>

					<ColorPicker label="Color Theme" value={color} onChange={setColor} presetColors={DEFAULT_PRESET_COLORS} />
				</div>
			</div>
			<div className="flex justify-end pt-4 border-t border-white/10">
				<Button type="submit" disabled={isLoading} leftIcon={<Save size={16} />}>
					Save changes
				</Button>
			</div>
		</form>
	);
}
