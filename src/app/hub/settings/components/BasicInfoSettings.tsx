"use client";

import BasicInfoStep from "@/components/features/profile/forms/steps/BasicInfoStep";
import { Button } from "@/components/ui";
import { createNotificationSubscription } from "@/lib/api/subscriptions";
import { updateCurrentProfile } from "@/lib/api/user";
import { FullProfileDto } from "@/lib/models/Profile";
import { showSuccessToast } from "@/lib/errors";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BasicInfoSettingsProps {
	user: FullProfileDto;
}

export default function BasicInfoSettings({ user }: BasicInfoSettingsProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [basicInfo, setBasicInfo] = useState({
		name: user.userProfile?.name,
		surname: user.userProfile?.surname,
		imageUrl: user.userProfile?.imageUrl,
	});

	const enableNotifications = () => {
		if ("serviceWorker" in navigator && "PushManager" in window) {
			navigator.serviceWorker
				.register("/scripts/notifications_worker.js")
				.then(function (swReg) {
					swReg.pushManager
						.subscribe({
							userVisibleOnly: true,
							applicationServerKey: "BDoqxWXp2K97_Wuk4s2On7aeqBus_ZvJuGLrOn_moB3LCElqnweRINPhgwL0byp8ktqCSCorTxPJSGpcZR7y02o",
						})
						.then(async function (subscription) {
							await createNotificationSubscription(user?.userProfile?.id!, subscription);
							showSuccessToast("Notifications enabled successfully!");
						});
				})
				.catch(function (error) {
					console.error("Service Worker Error", error);
					setError("Failed to enable notifications.");
				});
		}
	};

	const handleSave = async (data: any) => {
		setIsLoading(true);
		setError(null);

		try {
			setBasicInfo(data);
			await updateCurrentProfile({
				name: data.name,
				surname: data.surname,
				imageUrl: data.imageUrl,
			});
			showSuccessToast("Profile updated successfully!");
			router.refresh();
		} catch (err: any) {
			console.error("Profile update error:", err);
			setError(err.response?.data?.message || "Failed to update profile");
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
					<BasicInfoStep defaultValues={basicInfo} onNext={handleSave} formId="basic-settings-form" />

					<div className="flex flex-col gap-4 pt-6 border-t border-border">
						<h3 className="font-semibold text-foreground">Notifications</h3>
						<div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-border">
							<div className="flex flex-col gap-1">
								<span className="text-sm font-medium text-foreground">Push Notifications</span>
								<span className="text-xs text-muted">Receive updates about upcoming games and events.</span>
							</div>
							<Button variant="outline" size="sm" onClick={enableNotifications}>
								Enable
							</Button>
						</div>
					</div>

					<div className="flex justify-end pt-4 border-t border-border">
						<Button type="submit" form="basic-settings-form" loading={isLoading} className="gap-2" leftIcon={<Save size={20} />}>
							Save Changes
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
