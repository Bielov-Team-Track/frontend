"use client";

import DeleteClubModal from "@/components/features/clubs/settings/DeleteClubModal";
import TransferOwnershipModal from "@/components/features/clubs/settings/TransferOwnershipModal";
import { SettingsCard, SettingsHeader } from "@/components/layout/settings-layout";
import { Button } from "@/components/ui";
import { archiveClub, deleteClub, exportClubData, getClub, transferClubOwnership } from "@/lib/api/clubs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Download, Trash2, UserCog } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

interface ActionCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	buttonText: string;
	onClick: () => void;
	isLoading?: boolean;
	danger?: boolean;
}

function ActionCard({ icon, title, description, buttonText, onClick, isLoading, danger }: ActionCardProps) {
	return (
		<div className="flex items-start gap-4">
			<div className={`p-3 rounded-xl ${danger ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white"}`}>{icon}</div>
			<div className="flex-1">
				<h3 className={`font-medium mb-1 ${danger ? "text-red-400" : "text-white"}`}>{title}</h3>
				<p className="text-sm text-muted mb-4">{description}</p>
				<Button variant={danger ? "destructive" : "default"} size="sm" onClick={onClick} loading={isLoading}>
					{buttonText}
				</Button>
			</div>
		</div>
	);
}

export default function ClubDangerZonePage() {
	const params = useParams();
	const router = useRouter();
	const clubId = params.id as string;
	const queryClient = useQueryClient();

	const [transferModalOpen, setTransferModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);

	const { data: club } = useQuery({
		queryKey: ["club", clubId],
		queryFn: () => getClub(clubId),
	});

	// Export mutation
	const exportMutation = useMutation({
		mutationFn: () => exportClubData(clubId),
		onSuccess: (blob) => {
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${club?.name.replace(/\s+/g, "-").toLowerCase()}-export.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		},
	});

	// Archive mutation
	const archiveMutation = useMutation({
		mutationFn: () => archiveClub(clubId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club", clubId] });
			router.push("/dashboard/clubs");
		},
	});

	// Transfer mutation
	const transferMutation = useMutation({
		mutationFn: (newOwnerUserId: string) => transferClubOwnership(clubId, newOwnerUserId, club?.name || ""),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club", clubId] });
			setTransferModalOpen(false);
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: () => deleteClub(clubId),
		onSuccess: () => {
			router.push("/dashboard/clubs");
		},
	});

	const handleArchive = () => {
		if (confirm(`Are you sure you want to archive "${club?.name}"? All active events will be cancelled.`)) {
			archiveMutation.mutate();
		}
	};

	if (!club) return null;

	return (
		<div className="space-y-6">
			<SettingsHeader title="Danger Zone" description="These actions have significant consequences. Please proceed with caution." />

			{/* Safe Actions */}
			<SettingsCard>
				<ActionCard
					icon={<Download size={20} />}
					title="Export Club Data"
					description="Download all club data including members, events, forms, and settings as a JSON file."
					buttonText="Export Data"
					onClick={() => exportMutation.mutate()}
					isLoading={exportMutation.isPending}
				/>
			</SettingsCard>

			<SettingsCard>
				<ActionCard
					icon={<Archive size={20} />}
					title="Archive Club"
					description="Hide this club from all members. Events will be cancelled. You can restore the club later from your archived clubs."
					buttonText="Archive Club"
					onClick={handleArchive}
					isLoading={archiveMutation.isPending}
				/>
			</SettingsCard>

			<SettingsCard>
				<ActionCard
					icon={<UserCog size={20} />}
					title="Transfer Ownership"
					description="Transfer this club to another admin. You will become a regular admin after transfer."
					buttonText="Transfer..."
					onClick={() => setTransferModalOpen(true)}
				/>
			</SettingsCard>

			{/* Destructive Action */}
			<SettingsCard danger>
				<ActionCard
					icon={<Trash2 size={20} />}
					title="Delete Club"
					description="Permanently delete this club and all associated data. This action cannot be undone."
					buttonText="Delete Club"
					onClick={() => setDeleteModalOpen(true)}
					danger
				/>
			</SettingsCard>

			<TransferOwnershipModal
				isOpen={transferModalOpen}
				clubId={clubId}
				clubName={club.name}
				onClose={() => setTransferModalOpen(false)}
				onConfirm={(userId) => transferMutation.mutate(userId)}
				isLoading={transferMutation.isPending}
			/>

			<DeleteClubModal
				isOpen={deleteModalOpen}
				clubName={club.name}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={() => deleteMutation.mutate()}
				isLoading={deleteMutation.isPending}
			/>
		</div>
	);
}
