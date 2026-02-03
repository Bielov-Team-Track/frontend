"use client";

import { Button } from "@/components";
import GroupCard from "@/components/features/clubs/components/GroupCard";
import GroupFormModal from "@/components/features/clubs/forms/GroupFormModal";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import EmptyState from "@/components/ui/empty-state";
import { ListToolbar, ViewMode } from "@/components/ui/list-toolbar";
import { createGroup, deleteGroup, updateGroup } from "@/lib/api/clubs";
import { ClubMember, CreateGroupRequest, Group, UpdateGroupRequest } from "@/lib/models/Club";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDownAZ, Clock, Layers, Plus, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

interface GroupsTabProps {
	groups: Group[];
	clubId: string;
	clubMembers: ClubMember[];
}

type SortOption = "name" | "memberCount" | "createdAt";

const SORT_OPTIONS = [
	{ value: "name", label: "Name (A-Z)", icon: <ArrowDownAZ size={14} /> },
	{ value: "memberCount", label: "Most Members", icon: <Users size={14} /> },
	{ value: "createdAt", label: "Newest First", icon: <Clock size={14} /> },
];

export default function GroupsTab({ groups, clubId, clubMembers }: GroupsTabProps) {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingGroup, setEditingGroup] = useState<Group | null>(null);
	const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<SortOption>("createdAt");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [memberCountFilter, setMemberCountFilter] = useState<string>("all");
	const queryClient = useQueryClient();

	const createMutation = useMutation({
		mutationFn: createGroup,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-groups", clubId] });
			setShowCreateModal(false);
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ groupId, data }: { groupId: string; data: UpdateGroupRequest }) => updateGroup(groupId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-groups", clubId] });
			setEditingGroup(null);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteGroup,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-groups", clubId] });
			setDeletingGroup(null);
		},
	});

	// Filter and sort groups
	const filteredGroups = useMemo(() => {
		let result = [...groups];

		// Search filter
		if (search) {
			const searchLower = search.toLowerCase();
			result = result.filter(
				(group) => group.name.toLowerCase().includes(searchLower) || group.description?.toLowerCase().includes(searchLower)
			);
		}

		// Member count filter
		if (memberCountFilter !== "all") {
			const memberCount = parseInt(memberCountFilter);
			if (memberCountFilter === "0") {
				result = result.filter((group) => (group.members?.length || 0) === 0);
			} else if (memberCountFilter === "1-5") {
				result = result.filter((group) => {
					const count = group.members?.length || 0;
					return count >= 1 && count <= 5;
				});
			} else if (memberCountFilter === "6+") {
				result = result.filter((group) => (group.members?.length || 0) >= 6);
			}
		}

		// Sort
		result.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case "name":
					comparison = a.name.localeCompare(b.name);
					break;
				case "memberCount":
					comparison = (b.members?.length || 0) - (a.members?.length || 0);
					break;
				case "createdAt":
					comparison = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
					break;
			}
			return comparison;
		});

		return result;
	}, [groups, search, sortBy, memberCountFilter]);

	const activeFilterCount = (memberCountFilter !== "all" ? 1 : 0);

	const clearFilters = () => {
		setMemberCountFilter("all");
	};

	// Filter content for the ListToolbar - compact chip style
	const MEMBER_FILTERS = [
		{ value: "all", label: "All sizes" },
		{ value: "0", label: "Empty" },
		{ value: "1-5", label: "1-5 members" },
		{ value: "6+", label: "6+ members" },
	];

	const filterContent = (
		<div className="space-y-3">
			<p className="text-xs font-medium text-muted-foreground">Members</p>
			<div className="flex flex-wrap gap-2">
				{MEMBER_FILTERS.map((filter) => (
					<button
						key={filter.value}
						type="button"
						onClick={() => setMemberCountFilter(filter.value)}
						className={cn(
							"px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
							memberCountFilter === filter.value
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
			{/* Header Row: Title + Create Button */}
			<div className="flex items-center justify-between shrink-0">
				<h2 className="text-lg font-semibold text-foreground">Groups</h2>
				<Button variant="outline" leftIcon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
					Create Group
				</Button>
			</div>

			{/* Toolbar with collapsible search/filters */}
			<ListToolbar
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search groups..."
				sortOptions={SORT_OPTIONS}
				sortBy={sortBy}
				onSortChange={(val) => setSortBy(val as SortOption)}
				filterContent={filterContent}
				activeFilterCount={activeFilterCount}
				onClearFilters={clearFilters}
				count={filteredGroups.length}
				itemLabel="group"
				viewMode={viewMode}
				onViewModeChange={setViewMode}
			/>

			{/* Content Area */}
			<div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
				{groups.length === 0 ? (
					<EmptyState
						icon={Layers}
						title="No groups yet"
						description="Create groups to organize members for events and activities"
						action={{
							label: "Create Group",
							onClick: () => setShowCreateModal(true),
							icon: Plus,
						}}
					/>
				) : filteredGroups.length === 0 ? (
					<EmptyState
						icon={Search}
						title="No groups found"
						description="Try adjusting your search or filters"
						action={{
							label: "Clear Filters",
							onClick: () => {
								setSearch("");
								clearFilters();
							},
						}}
					/>
				) : viewMode === "grid" ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
						{filteredGroups.map((group) => (
							<GroupCard key={group.id} group={group} onEdit={() => setEditingGroup(group)} onDelete={() => setDeletingGroup(group)} />
						))}
					</div>
				) : (
					<div className="space-y-2 pb-4">
						{filteredGroups.map((group) => (
							<GroupListItem key={group.id} group={group} onEdit={() => setEditingGroup(group)} onDelete={() => setDeletingGroup(group)} />
						))}
					</div>
				)}
			</div>

			{/* Modals */}
			<GroupFormModal
				isOpen={showCreateModal}
				clubId={clubId}
				onClose={() => setShowCreateModal(false)}
				onSubmit={(data) => createMutation.mutate(data as CreateGroupRequest)}
				isLoading={createMutation.isPending}
			/>

			<GroupFormModal
				isOpen={!!editingGroup}
				group={editingGroup}
				clubId={clubId}
				onClose={() => setEditingGroup(null)}
				onSubmit={(data) =>
					editingGroup &&
					updateMutation.mutate({
						groupId: editingGroup.id,
						data: data as UpdateGroupRequest,
					})
				}
				isLoading={updateMutation.isPending}
			/>

			<DeleteConfirmModal
				isOpen={!!deletingGroup}
				title="Delete Group"
				itemName={deletingGroup?.name || ""}
				onClose={() => setDeletingGroup(null)}
				onConfirm={() => deletingGroup && deleteMutation.mutate(deletingGroup.id)}
				isLoading={deleteMutation.isPending}
			/>
		</div>
	);
}

// List view item for groups
function GroupListItem({ group, onEdit, onDelete }: { group: Group; onEdit: () => void; onDelete: () => void }) {
	return (
		<div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all group">
			<div className="flex items-center gap-3 min-w-0">
				<div
					className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
					style={{ backgroundColor: group.color || "#3b82f6" }}>
					<Layers size={18} className="text-white" />
				</div>
				<div className="min-w-0">
					<h4 className="font-medium text-white truncate">{group.name}</h4>
					<p className="text-xs text-muted-foreground">
						{group.members?.length || 0} member{(group.members?.length || 0) !== 1 ? "s" : ""}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<Button variant="ghost" size="sm" onClick={onEdit}>
					Edit
				</Button>
				<Button variant="ghost" size="sm" color="error" onClick={onDelete}>
					Delete
				</Button>
			</div>
		</div>
	);
}
