"use client";

import PlayerInfoStep from "@/components/features/profile/forms/steps/PlayerInfoStep";
import { Button } from "@/components/ui";
import { CreateOrUpdatePlayerProfileDto, FullProfileDto, PlayerProfileDto } from "@/lib/models/Profile";
import { createOrUpdatePlayerProfile } from "@/lib/api/user";
import { showSuccessToast } from "@/lib/errors";
import { Save } from "lucide-react";
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

					<div className="flex justify-end pt-4 border-t border-border">
						<Button type="submit" form="player-settings-form" loading={isLoading} className="gap-2" leftIcon={<Save size={18} />}>
							Save Changes
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
