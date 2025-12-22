"use client";

import HistoryStep, { HistoryEntry } from "@/components/features/profile/forms/steps/HistoryStep";
import { Button } from "@/components/ui";
import { FullProfileDto, getClubRoleLabel, getVolleyballPositionLabel } from "@/lib/models/Profile";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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

	const showSuccess = (msg: string) => {
		setSuccessMessage(msg);
		setTimeout(() => setSuccessMessage(null), 3000);
	};

	const handleSave = async (data: any) => {
		setIsLoading(true);
		setError(null);
		setSuccessMessage(null);

		try {
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
