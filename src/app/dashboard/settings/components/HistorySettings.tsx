"use client";

import HistoryStep, { HistoryEntry } from "@/components/features/profile/forms/steps/HistoryStep";
import { Button } from "@/components/ui";
import { createHistory, deleteHistory, updateHistory } from "@/lib/api/user";
import {
	ClubRole,
	CreateHistoryDto,
	FullProfileDto,
	getClubRoleLabel,
	getVolleyballPositionLabel,
	UpdateHistoryDto,
	VolleyballPosition,
} from "@/lib/models/Profile";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// Helper to convert role label back to enum value
const getRoleFromLabel = (label: string): ClubRole => {
	const mapping: Record<string, ClubRole> = {
		Player: ClubRole.Player,
		"Head Coach": ClubRole.HeadCoach,
		Coach: ClubRole.Coach,
		"Assistant Coach": ClubRole.AssistantCoach,
		"Team Manager": ClubRole.TeamManager,
		Member: ClubRole.Member,
		Admin: ClubRole.Admin,
	};
	return mapping[label] ?? ClubRole.Player;
};

// Helper to convert position label back to enum value
const getPositionFromLabel = (label: string): VolleyballPosition | undefined => {
	const mapping: Record<string, VolleyballPosition> = {
		Setter: VolleyballPosition.Setter,
		"Outside Hitter": VolleyballPosition.OutsideHitter,
		"Opposite Hitter": VolleyballPosition.OppositeHitter,
		"Middle Blocker": VolleyballPosition.MiddleBlocker,
		Libero: VolleyballPosition.Libero,
	};
	return mapping[label];
};

interface HistorySettingsProps {
	user: FullProfileDto;
}

export default function HistorySettings({ user }: HistorySettingsProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Convert backend HistoryDto to frontend HistoryEntry format
	const initialEntries: HistoryEntry[] = useMemo(() => {
		if (!user.historyEntries) return [];
		return user.historyEntries.map((entry) => ({
			id: entry.id,
			year: entry.year.toString(),
			clubName: entry.clubName,
			clubLogoUrl: entry.clubLogoUrl,
			teamName: entry.teamName,
			teamLogoUrl: entry.teamLogoUrl,
			role: getClubRoleLabel(entry.role),
			positions: entry.positions?.map((p) => getVolleyballPositionLabel(p)) || [],
		}));
	}, [user.historyEntries]);

	// Track initial entry IDs for comparison
	const initialEntryIds = useMemo(() => new Set(initialEntries.map((e) => e.id)), [initialEntries]);

	const showSuccess = (msg: string) => {
		setSuccessMessage(msg);
		setTimeout(() => setSuccessMessage(null), 3000);
	};

	// Convert frontend HistoryEntry to backend CreateHistoryDto
	const toCreateDto = (entry: HistoryEntry): CreateHistoryDto => ({
		year: parseInt(entry.year),
		clubName: entry.clubName,
		clubLogoUrl: entry.clubLogoUrl || null,
		teamName: entry.teamName || null,
		teamLogoUrl: entry.teamLogoUrl || null,
		role: getRoleFromLabel(entry.role),
		positions: entry.positions.map((p) => getPositionFromLabel(p)).filter((p): p is VolleyballPosition => p !== undefined),
	});

	// Convert frontend HistoryEntry to backend UpdateHistoryDto
	const toUpdateDto = (entry: HistoryEntry): UpdateHistoryDto => ({
		year: parseInt(entry.year),
		clubName: entry.clubName,
		clubLogoUrl: entry.clubLogoUrl || null,
		teamName: entry.teamName || null,
		teamLogoUrl: entry.teamLogoUrl || null,
		role: getRoleFromLabel(entry.role),
		positions: entry.positions.map((p) => getPositionFromLabel(p)).filter((p): p is VolleyballPosition => p !== undefined),
	});

	const handleSave = async (data: { bio: string; entries: HistoryEntry[] }) => {
		setIsLoading(true);
		setError(null);
		setSuccessMessage(null);

		try {
			const currentEntries = data.entries;
			const currentEntryIds = new Set(currentEntries.map((e) => e.id));

			// Determine what changed
			const toCreate = currentEntries.filter((e) => !initialEntryIds.has(e.id));
			const toUpdate = currentEntries.filter((e) => initialEntryIds.has(e.id));
			const toDelete = initialEntries.filter((e) => !currentEntryIds.has(e.id));

			// Execute all operations
			const operations: Promise<unknown>[] = [];

			// Create new entries
			for (const entry of toCreate) {
				operations.push(createHistory(toCreateDto(entry)));
			}

			// Update existing entries
			for (const entry of toUpdate) {
				operations.push(updateHistory(entry.id, toUpdateDto(entry)));
			}

			// Delete removed entries
			for (const entry of toDelete) {
				operations.push(deleteHistory(entry.id));
			}

			await Promise.all(operations);

			showSuccess("History updated successfully!");
			router.refresh();
		} catch (err: any) {
			console.error("History update error:", err);
			setError(err.response?.data?.message || "Failed to update history");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Messages */}
			{successMessage && (
				<div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
					{successMessage}
				</div>
			)}
			{error && (
				<div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
					{error}
				</div>
			)}

			{/* Content */}
			<div className="bg-[#141414] border border-white/5 rounded-2xl p-6 md:p-8">
				<div className="flex flex-col gap-8">
					<HistoryStep
						onNext={handleSave}
						formId="history-settings-form"
						initialEntries={initialEntries}
					/>

					<div className="flex justify-end pt-4 border-t border-white/5">
						<Button type="submit" form="history-settings-form" loading={isLoading} className="gap-2" leftIcon={<Save size={20} />}>
							Save Changes
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
