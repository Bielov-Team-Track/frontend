"use client";

import DeleteClubModal from "@/components/features/clubs/settings/DeleteClubModal";
import SettingsSidebar, { SettingsSection } from "@/components/features/clubs/settings/SettingsSidebar";
import TransferOwnershipModal from "@/components/features/clubs/settings/TransferOwnershipModal";
import { Button } from "@/components/ui";
import { Club } from "@/lib/models/Club";
import { archiveClub, deleteClub, exportClubData, transferClubOwnership } from "@/lib/api/clubs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Archive, Download, Trash2, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DangerZoneSectionProps {
	club: Club;
	onTabChange?: (tabId: SettingsSection) => void;
	activeTab?: SettingsSection;
}

interface ActionCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	buttonText: string;
	buttonColor?: "neutral" | "warning" | "error";
	onClick: () => void;
	isLoading?: boolean;
	danger?: boolean;
}

function ActionCard({ icon, title, description, buttonText, buttonColor = "neutral", onClick, isLoading, danger }: ActionCardProps) {
	return (
		<div className={`p-6 rounded-xl border ${danger ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/10"}`}>
			<div className="flex items-start gap-4">
				<div className={`p-3 rounded-xl ${danger ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white"}`}>{icon}</div>
				<div className="flex-1">
					<h3 className={`font-medium mb-1 ${danger ? "text-red-400" : "text-white"}`}>{title}</h3>
					<p className="text-sm text-muted mb-4">{description}</p>
					<Button variant={danger ? "solid" : "outline"} color={buttonColor} size="sm" onClick={onClick} loading={isLoading}>
						{buttonText}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default function DangerZoneSection({ club, onTabChange, activeTab }: DangerZoneSectionProps) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const [transferModalOpen, setTransferModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);

	// Export mutation
	const exportMutation = useMutation({
		mutationFn: () => exportClubData(club.id),
		onSuccess: (blob) => {
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${club.name.replace(/\s+/g, "-").toLowerCase()}-export.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		},
	});

	// Archive mutation
	const archiveMutation = useMutation({
		mutationFn: () => archiveClub(club.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club", club.id] });
			router.push("/dashboard/clubs");
		},
	});

	// Transfer mutation
	const transferMutation = useMutation({
		mutationFn: (newOwnerUserId: string) => transferClubOwnership(club.id, newOwnerUserId, club.name),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club", club.id] });
			setTransferModalOpen(false);
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: () => deleteClub(club.id),
		onSuccess: () => {
			router.push("/dashboard/clubs");
		},
	});

	const handleArchive = () => {
		if (confirm(`Are you sure you want to archive "${club.name}"? All active events will be cancelled.`)) {
			archiveMutation.mutate();
		}
	};

	return (
		<div className="flex gap-2">
			<SettingsSidebar clubId={club.id} onTabChange={onTabChange} activeTab={activeTab} />
			<div className="space-y-6 flex-1">
				<div>
					<h2 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h2>
					<p className="text-sm text-muted">These actions have significant consequences. Please proceed with caution.</p>
				</div>

				<div className="space-y-4">
					<ActionCard
						icon={<Download size={20} />}
						title="Export Club Data"
						description="Download all club data including members, events, forms, and settings as a JSON file."
						buttonText="Export Data"
						onClick={() => exportMutation.mutate()}
						isLoading={exportMutation.isPending}
					/>

					<ActionCard
						icon={<Archive size={20} />}
						title="Archive Club"
						description="Hide this club from all members. Events will be cancelled. You can restore the club later from your archived clubs."
						buttonText="Archive Club"
						buttonColor="warning"
						onClick={handleArchive}
						isLoading={archiveMutation.isPending}
					/>

					<ActionCard
						icon={<UserCog size={20} />}
						title="Transfer Ownership"
						description="Transfer this club to another admin. You will become a regular admin after transfer."
						buttonText="Transfer..."
						buttonColor="warning"
						onClick={() => setTransferModalOpen(true)}
					/>

					<ActionCard
						icon={<Trash2 size={20} />}
						title="Delete Club"
						description="Permanently delete this club and all associated data. This action cannot be undone."
						buttonText="Delete Club"
						buttonColor="error"
						onClick={() => setDeleteModalOpen(true)}
						danger
					/>
				</div>

				<TransferOwnershipModal
					isOpen={transferModalOpen}
					clubId={club.id}
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
		</div>
	);
}
