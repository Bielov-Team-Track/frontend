"use client";

import PlayerInfoStep from "@/components/features/profile/forms/steps/PlayerInfoStep";
import { Button } from "@/components/ui";
import { CreateOrUpdatePlayerProfileDto, FullProfileDto, PlayerProfileDto } from "@/lib/models/Profile";
import { createOrUpdatePlayerProfile, deletePlayerProfile } from "@/lib/api/user";
import { showErrorToast, showSuccessToast } from "@/lib/errors";
import { Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PlayerSettingsProps {
	user: FullProfileDto;
}

export default function PlayerSettings({ user }: PlayerSettingsProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [playerInfo, setPlayerInfo] = useState<PlayerProfileDto | null>(user.playerProfile || null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deletePlayerProfile();
			showSuccessToast("Player profile deleted successfully");
			router.refresh();
		} catch (err) {
			showErrorToast(err, { fallback: "Failed to delete player profile" });
		} finally {
			setIsDeleting(false);
			setShowDeleteConfirm(false);
		}
	};

	const handleSave = async (data: any) => {
		setIsLoading(true);
		setError(null);

		try {
			setPlayerInfo(data);
			const playerPayload: CreateOrUpdatePlayerProfileDto = {
				heightCm: data.heightCm,
				verticalJumpCm: data.verticalJumpCm,
				dominantHand: data.dominantHand,
				preferredPosition: data.preferredPosition,
				secondaryPositions: data.secondaryPositions || [],
				highestLevelPlayed: data.highestLevelPlayed,
			};
			await createOrUpdatePlayerProfile(playerPayload);
			showSuccessToast("Player profile updated successfully!");
			router.refresh();
		} catch (err: any) {
			console.error("Profile update error:", err);
			setError(err.response?.data?.message || "Failed to update player profile");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{error && (
				<div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
					{error}
				</div>
			)}

			{/* Content */}
			<div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
				<div className="flex flex-col gap-8">
					<PlayerInfoStep defaultValues={playerInfo || undefined} onNext={handleSave} formId="player-settings-form" />

					<div className="flex justify-between pt-4 border-t border-border">
						<div>
							{!showDeleteConfirm ? (
								<Button
									type="button"
									variant="ghost"
									onClick={() => setShowDeleteConfirm(true)}
									className="text-muted-foreground hover:text-destructive"
									leftIcon={<Trash2 size={16} />}>
									Delete Profile
								</Button>
							) : (
								<div className="flex items-center gap-2">
									<span className="text-sm text-destructive">Are you sure?</span>
									<Button type="button" variant="destructive" size="sm" onClick={handleDelete} loading={isDeleting}>
										Confirm Delete
									</Button>
									<Button type="button" variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
										Cancel
									</Button>
								</div>
							)}
						</div>
						<Button type="submit" form="player-settings-form" loading={isLoading} className="gap-2" leftIcon={<Save size={18} />}>
							Save Changes
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
