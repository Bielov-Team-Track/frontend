"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/button";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import { TeamSettingsForm } from "@/components/features/teams";
import { Team, UpdateTeamRequest } from "@/lib/models/Club";
import { updateTeam, deleteTeam } from "@/lib/requests/clubs";
import { useState } from "react";

interface SettingsTabProps {
	team: Team;
	clubId: string;
}

export default function SettingsTab({ team, clubId }: SettingsTabProps) {
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const queryClient = useQueryClient();
	const router = useRouter();

	const updateMutation = useMutation({
		mutationFn: (data: UpdateTeamRequest) => updateTeam(team.id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["team", team.id] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteTeam(team.id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["club-teams", clubId],
			});
			router.push(`/dashboard/clubs/${clubId}`);
		},
	});

	return (
		<div className="space-y-8">
			{/* General Settings */}
			<div className="space-y-6">
				<h3 className="text-lg font-bold text-white">Team Settings</h3>
				<TeamSettingsForm
					team={team}
					onSubmit={(data) => updateMutation.mutate(data)}
					isLoading={updateMutation.isPending}
				/>
			</div>

			{/* Danger Zone */}
			<div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6">
				<h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
				<p className="text-muted text-sm mb-4">
					Once you delete a team, there is no going back. Please be certain.
				</p>
				<Button
					variant="solid"
					color="error"
					onClick={() => setShowDeleteModal(true)}>
					Delete Team
				</Button>
			</div>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={showDeleteModal}
				title="Delete Team"
				itemName={team.name}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={() => deleteMutation.mutate()}
				isLoading={deleteMutation.isPending}
			/>
		</div>
	);
}
