"use client";

import CoachInfoStep from "@/components/features/profile/forms/steps/CoachInfoStep";
import { Button } from "@/components/ui";
import { CoachProfileDto, CreateOrUpdateCoachProfileDto, FullProfileDto } from "@/lib/models/Profile";
import { createOrUpdateCoachProfile } from "@/lib/api/user";
import { showSuccessToast } from "@/lib/errors";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CoachSettingsProps {
	user: FullProfileDto;
}

export default function CoachSettings({ user }: CoachSettingsProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [coachInfo, setCoachInfo] = useState<CoachProfileDto | null>(user.coachProfile || null);

	const handleSave = async (data: any) => {
		setIsLoading(true);
		setError(null);

		try {
			setCoachInfo(data);
			const coachPayload: CreateOrUpdateCoachProfileDto = {
				yearsOfExperience: data.yearsOfExperience,
				highestLevelCoached: data.highestLevelCoached,
				qualifications: data.qualifications || [],
			};
			await createOrUpdateCoachProfile(coachPayload);
			showSuccessToast("Coach profile updated successfully!");
			router.refresh();
		} catch (err: any) {
			console.error("Profile update error:", err);
			setError(err.response?.data?.message || "Failed to update coach profile");
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
					<CoachInfoStep defaultValues={coachInfo || undefined} onNext={handleSave} formId="coach-settings-form" />

					<div className="flex justify-end pt-4 border-t border-border">
						<Button type="submit" form="coach-settings-form" loading={isLoading} className="gap-2" leftIcon={<Save size={18} />}>
							Save Changes
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
