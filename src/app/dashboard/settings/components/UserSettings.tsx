"use client";

import BasicInfoStep from "@/components/features/profile/forms/steps/BasicInfoStep";
import CoachInfoStep from "@/components/features/profile/forms/steps/CoachInfoStep";
import HistoryStep from "@/components/features/profile/forms/steps/HistoryStep";
import PlayerInfoStep from "@/components/features/profile/forms/steps/PlayerInfoStep";
import { Button } from "@/components/ui";
import { createNotificationSubscription } from "@/lib/api/subscriptions";
import { createOrUpdateCoachProfile, createOrUpdatePlayerProfile, updateCurrentProfile } from "@/lib/api/user";
import { CoachProfileDto, CreateOrUpdateCoachProfileDto, CreateOrUpdatePlayerProfileDto, FullProfileDto, PlayerProfileDto } from "@/lib/models/Profile";
import { Activity, ClipboardList, History, Save, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Extended profile type for settings
interface ExtendedUser extends FullProfileDto {}

function UserSettings({ user }: { user: ExtendedUser }) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("basic");
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Initialize state from user prop
	const [basicInfo, setBasicInfo] = useState({
		name: user.userProfile?.name,
		surname: user.userProfile?.surname,
		imageUrl: user.userProfile?.imageUrl,
	});

	// Ensure we have objects even if they are null in user prop
	const [playerInfo, setPlayerInfo] = useState<PlayerProfileDto | null>(user.playerProfile || null);
	const [coachInfo, setCoachInfo] = useState<CoachProfileDto | null>(user.coachProfile || null);

	const tabs = [
		{ id: "basic", label: "Basic Info", icon: <User size={18} /> },
		{ id: "player", label: "Player Profile", icon: <Activity size={18} /> },
		{
			id: "coach",
			label: "Coach Profile",
			icon: <ClipboardList size={18} />,
		},
		{ id: "history", label: "History", icon: <History size={18} /> },
	];

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
							showSuccess("Notifications enabled successfully!");
						});
				})
				.catch(function (error) {
					console.error("Service Worker Error", error);
					setError("Failed to enable notifications.");
				});
		}
	};

	const showSuccess = (msg: string) => {
		setSuccessMessage(msg);
		setTimeout(() => setSuccessMessage(null), 3000);
	};

	const handleSave = async (section: "basic" | "player" | "coach" | "history", data: any) => {
		setIsLoading(true);
		setError(null);
		setSuccessMessage(null);

		try {
			if (section === "basic") {
				setBasicInfo(data);
				await updateCurrentProfile({
					name: data.name,
					surname: data.surname,
					imageUrl: data.imageUrl,
				});
			} else if (section === "player") {
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
			} else if (section === "coach") {
				setCoachInfo(data);
				const coachPayload: CreateOrUpdateCoachProfileDto = {
					yearsOfExperience: data.yearsOfExperience,
					highestLevelCoached: data.highestLevelCoached,
					qualifications: data.qualifications || [],
				};
				await createOrUpdateCoachProfile(coachPayload);
			}

			showSuccess("Profile updated successfully!");
			router.refresh(); // Refresh server components to reflect changes
		} catch (err: any) {
			console.error("Profile update error:", err);
			setError(err.response?.data?.message || "Failed to update profile");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-6 w-full max-w-4xl mx-auto mt-6">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold text-white">Profile Settings</h1>
					<p className="text-muted text-sm">Manage your public profile and preferences.</p>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex overflow-x-auto border-b border-white/10 no-scrollbar gap-2">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`
                            flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap
                            ${activeTab === tab.id ? "border-accent text-accent" : "border-transparent text-muted hover:text-white hover:border-white/20"}
                        `}>
						{tab.icon}
						{tab.label}
					</button>
				))}
			</div>

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
				{activeTab === "basic" && (
					<div className="flex flex-col gap-8">
						<BasicInfoStep defaultValues={basicInfo} onNext={(data) => handleSave("basic", data)} formId="basic-settings-form" />
						<div className="flex flex-col gap-4 pt-6 border-t border-white/5">
							<h3 className="font-semibold text-white">Notifications</h3>
							<div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
								<div className="flex flex-col gap-1">
									<span className="text-sm font-medium text-white">Push Notifications</span>
									<span className="text-xs text-muted">Receive updates about upcoming games and events.</span>
								</div>
								<Button variant="outline" size="sm" onClick={enableNotifications}>
									Enable
								</Button>
							</div>
						</div>
						<div className="flex justify-end pt-4 border-t border-white/5">
							<Button type="submit" form="basic-settings-form" loading={isLoading} className="gap-2" leftIcon={<Save size={20} />}>
								Save Changes
							</Button>
						</div>
					</div>
				)}

				{activeTab === "player" && (
					<div className="flex flex-col gap-8">
						<PlayerInfoStep defaultValues={playerInfo || undefined} onNext={(data) => handleSave("player", data)} formId="player-settings-form" />
						<div className="flex justify-end pt-4 border-t border-white/5">
							<Button type="submit" form="player-settings-form" loading={isLoading} className="gap-2">
								<Save size={18} />
								Save Changes
							</Button>
						</div>
					</div>
				)}

				{activeTab === "coach" && (
					<div className="flex flex-col gap-8">
						<CoachInfoStep defaultValues={coachInfo || undefined} onNext={(data) => handleSave("coach", data)} formId="coach-settings-form" />
						<div className="flex justify-end pt-4 border-t border-white/5">
							<Button type="submit" form="coach-settings-form" loading={isLoading} className="gap-2">
								<Save size={18} />
								Save Changes
							</Button>
						</div>
					</div>
				)}

				{activeTab === "history" && (
					<div className="flex flex-col gap-8">
						<div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-lg text-sm">
							<span className="font-bold">Note:</span> The history section currently allows adding new entries to your bio. Existing entries might
							not be editable here if they were added as plain text previously.
						</div>
						<HistoryStep onNext={(data) => handleSave("history", data)} formId="history-settings-form" />
						<div className="flex justify-end pt-4 border-t border-white/5">
							<Button type="submit" form="history-settings-form" loading={isLoading} className="gap-2" leftIcon={<Save size={20} />}>
								Save Changes
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default UserSettings;
