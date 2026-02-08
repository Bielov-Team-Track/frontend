"use client";

import { SettingsCard, SettingsHeader } from "@/components/layout/settings-layout";
import { Button } from "@/components/ui";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import { deleteTeam } from "@/lib/api/clubs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTeamContext } from "../../layout";

export default function TeamDangerZonePage() {
	const { team, club } = useTeamContext();
	const router = useRouter();
	const queryClient = useQueryClient();
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);

	const deleteMutation = useMutation({
		mutationFn: () => deleteTeam(team!.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-teams", team!.clubId] });
			router.push(`/hub/clubs/${team!.clubId}`);
		},
	});

	if (!team) return null;

	return (
		<div className="space-y-6">
			<SettingsHeader
				title="Danger Zone"
				description="These actions have significant consequences. Please proceed with caution."
			/>

			<SettingsCard danger>
				<div className="flex items-start gap-4">
					<div className="p-3 rounded-xl bg-red-500/20 text-red-400">
						<Trash2 size={20} />
					</div>
					<div className="flex-1">
						<h3 className="font-medium mb-1 text-red-400">Delete Team</h3>
						<p className="text-sm text-muted mb-4">
							Permanently delete this team and all associated data. This action cannot be undone.
						</p>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setDeleteModalOpen(true)}
						>
							Delete Team
						</Button>
					</div>
				</div>
			</SettingsCard>

			<DeleteConfirmModal
				isOpen={deleteModalOpen}
				title="Delete Team"
				itemName={team.name}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={() => deleteMutation.mutate()}
				isLoading={deleteMutation.isPending}
			/>
		</div>
	);
}
