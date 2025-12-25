"use client";

import { Button } from "@/components";
import ManageMembersModal from "@/components/features/clubs/components/ManageMembersModal";
import TeamCard from "@/components/features/clubs/components/TeamCard";
import TeamFormModal from "@/components/features/clubs/forms/TeamFormModal";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import EmptyState from "@/components/ui/empty-state";
import { addTeamMember, createTeam, deleteTeam, removeTeamMember, updateTeam } from "@/lib/api/clubs";
import { ClubMember, CreateTeamRequest, Team, UpdateTeamRequest } from "@/lib/models/Club";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { useState } from "react";

interface TeamsTabProps {
	teams: Team[];
	clubId: string;
	clubMembers: ClubMember[];
}

export default function TeamsTab({ teams, clubId, clubMembers }: TeamsTabProps) {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingTeam, setEditingTeam] = useState<Team | null>(null);
	const [managingTeam, setManagingTeam] = useState<Team | null>(null);
	const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
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

	const addMemberMutation = useMutation({
		mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) => addTeamMember(teamId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-teams", clubId] });
		},
	});

	const removeMemberMutation = useMutation({
		mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) => removeTeamMember(teamId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-teams", clubId] });
		},
	});

	const teamMemberUserIds = managingTeam ? new Set(managingTeam.members?.map((m) => m.userId) || []) : new Set<string>();

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-bold text-white">Teams ({teams.length})</h3>
				<Button variant="default" color="accent" onClick={() => setShowCreateModal(true)} leftIcon={<Plus size={16} />}>
					Create Team
				</Button>
			</div>

			{/* Teams Grid */}
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
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{teams.map((team) => (
						<TeamCard
							key={team.id}
							team={team}
							onManage={() => setManagingTeam(team)}
							onEdit={() => setEditingTeam(team)}
							onDelete={() => setDeletingTeam(team)}
						/>
					))}
				</div>
			)}

			{/* Create Team Modal */}
			<TeamFormModal
				isOpen={showCreateModal}
				clubId={clubId}
				onClose={() => setShowCreateModal(false)}
				onSubmit={(data) => createMutation.mutate(data as CreateTeamRequest)}
				isLoading={createMutation.isPending}
			/>

			{/* Edit Team Modal */}
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

			{/* Delete Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={!!deletingTeam}
				title="Delete Team"
				itemName={deletingTeam?.name || ""}
				onClose={() => setDeletingTeam(null)}
				onConfirm={() => deletingTeam && deleteMutation.mutate(deletingTeam.id)}
				isLoading={deleteMutation.isPending}
			/>

			{/* Manage Members Modal */}
			{managingTeam && (
				<ManageMembersModal
					isOpen={!!managingTeam}
					title="Manage Team Members"
					subtitle={managingTeam.name}
					members={clubMembers}
					currentMemberIds={teamMemberUserIds}
					getMemberId={(member) => member.userId}
					onClose={() => setManagingTeam(null)}
					onAddMember={(userId) => addMemberMutation.mutate({ teamId: managingTeam.id, userId })}
					onRemoveMember={(userId) => removeMemberMutation.mutate({ teamId: managingTeam.id, userId })}
					isLoading={addMemberMutation.isPending || removeMemberMutation.isPending}
					memberCount={managingTeam.members?.length || 0}
				/>
			)}
		</div>
	);
}
