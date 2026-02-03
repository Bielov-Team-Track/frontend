"use client";

import { Button } from "@/components";
import TeamCard from "@/components/features/clubs/components/TeamCard";
import TeamFormModal from "@/components/features/clubs/forms/TeamFormModal";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import EmptyState from "@/components/ui/empty-state";
import { ListToolbar, ViewMode } from "@/components/ui/list-toolbar";
import { createTeam, deleteTeam, updateTeam } from "@/lib/api/clubs";
import { ClubMember, CreateTeamRequest, Team, UpdateTeamRequest } from "@/lib/models/Club";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDownAZ, Clock, Plus, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

interface TeamsTabProps {
	teams: Team[];
	clubId: string;
	clubMembers: ClubMember[];
}

type SortOption = "name" | "memberCount" | "createdAt";

const SORT_OPTIONS = [
	{ value: "name", label: "Name (A-Z)", icon: <ArrowDownAZ size={14} /> },
	{ value: "memberCount", label: "Most Members", icon: <Users size={14} /> },
	{ value: "createdAt", label: "Newest First", icon: <Clock size={14} /> },
];

export default function TeamsTab({ teams, clubId, clubMembers }: TeamsTabProps) {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingTeam, setEditingTeam] = useState<Team | null>(null);
	const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<SortOption>("createdAt");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [memberCountFilter, setMemberCountFilter] = useState<string>("all");
	const queryClient = useQueryClient();

	const createMutation = useMutation({
		mutationFn: createTeam,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-teams", clubId] });
			setShowCreateModal(false);
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ teamId, data }: { teamId: string; data: UpdateTeamRequest }) => updateTeam(teamId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-teams", clubId] });
			setEditingTeam(null);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteTeam,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-teams", clubId] });
			setDeletingTeam(null);
		},
	});

	// Filter and sort teams
	const filteredTeams = useMemo(() => {
		let result = [...teams];

		// Search filter
		if (search) {
			const searchLower = search.toLowerCase();
			result = result.filter(
				(team) => team.name.toLowerCase().includes(searchLower) || team.description?.toLowerCase().includes(searchLower)
			);
		}

		// Member count filter
		if (memberCountFilter !== "all") {
			if (memberCountFilter === "0") {
				result = result.filter((team) => (team.members?.length || 0) === 0);
			} else if (memberCountFilter === "1-5") {
				result = result.filter((team) => {
					const count = team.members?.length || 0;
					return count >= 1 && count <= 5;
				});
			} else if (memberCountFilter === "6+") {
				result = result.filter((team) => (team.members?.length || 0) >= 6);
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
	}, [teams, search, sortBy, memberCountFilter]);

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
				<h2 className="text-lg font-semibold text-foreground">Teams</h2>
				<Button variant="outline" leftIcon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
					Create Team
				</Button>
			</div>

			{/* Toolbar with collapsible search/filters */}
			<ListToolbar
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search teams..."
				sortOptions={SORT_OPTIONS}
				sortBy={sortBy}
				onSortChange={(val) => setSortBy(val as SortOption)}
				filterContent={filterContent}
				activeFilterCount={activeFilterCount}
				onClearFilters={clearFilters}
				count={filteredTeams.length}
				itemLabel="team"
				viewMode={viewMode}
				onViewModeChange={setViewMode}
			/>

			{/* Content Area */}
			<div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
				{teams.length === 0 ? (
					<EmptyState
						icon={Users}
						title="No teams yet"
						description="Create your first team to organize players"
						action={{
							label: "Create Team",
							onClick: () => setShowCreateModal(true),
							icon: Plus,
						}}
					/>
				) : filteredTeams.length === 0 ? (
					<EmptyState
						icon={Search}
						title="No teams found"
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
						{filteredTeams.map((team) => (
							<TeamCard key={team.id} team={team} onEdit={() => setEditingTeam(team)} onDelete={() => setDeletingTeam(team)} />
						))}
					</div>
				) : (
					<div className="space-y-2 pb-4">
						{filteredTeams.map((team) => (
							<TeamListItem key={team.id} team={team} onEdit={() => setEditingTeam(team)} onDelete={() => setDeletingTeam(team)} />
						))}
					</div>
				)}
			</div>

			{/* Modals */}
			<TeamFormModal
				isOpen={showCreateModal}
				clubId={clubId}
				onClose={() => setShowCreateModal(false)}
				onSubmit={(data) => createMutation.mutate(data as CreateTeamRequest)}
				isLoading={createMutation.isPending}
			/>

			<TeamFormModal
				isOpen={!!editingTeam}
				team={editingTeam}
				clubId={clubId}
				onClose={() => setEditingTeam(null)}
				onSubmit={(data) =>
					editingTeam &&
					updateMutation.mutate({
						teamId: editingTeam.id,
						data: data as UpdateTeamRequest,
					})
				}
				isLoading={updateMutation.isPending}
			/>

			<DeleteConfirmModal
				isOpen={!!deletingTeam}
				title="Delete Team"
				itemName={deletingTeam?.name || ""}
				onClose={() => setDeletingTeam(null)}
				onConfirm={() => deletingTeam && deleteMutation.mutate(deletingTeam.id)}
				isLoading={deleteMutation.isPending}
			/>
		</div>
	);
}

// List view item for teams
function TeamListItem({ team, onEdit, onDelete }: { team: Team; onEdit: () => void; onDelete: () => void }) {
	return (
		<div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all group">
			<div className="flex items-center gap-3 min-w-0">
				<div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
					<Users size={18} className="text-accent" />
				</div>
				<div className="min-w-0">
					<h4 className="font-medium text-white truncate">{team.name}</h4>
					<p className="text-xs text-muted-foreground">
						{team.members?.length || 0} member{(team.members?.length || 0) !== 1 ? "s" : ""}
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
