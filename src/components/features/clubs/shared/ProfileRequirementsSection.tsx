"use client";

import { Button } from "@/components";
import CoachInfoStep from "@/components/features/profile/forms/steps/CoachInfoStep";
import PlayerInfoStep from "@/components/features/profile/forms/steps/PlayerInfoStep";
import { Modal } from "@/components/ui";
import { CreateOrUpdateCoachProfileDto, CreateOrUpdatePlayerProfileDto } from "@/lib/models/Profile";
import { AlertCircle, Award, CheckCircle, User } from "lucide-react";
import { useState } from "react";

interface ProfileRequirementsSectionProps {
	requirePlayerProfile: boolean;
	requireCoachProfile: boolean;
	hasPlayerProfile: boolean;
	hasCoachProfile: boolean;
	playerProfileData?: CreateOrUpdatePlayerProfileDto;
	coachProfileData?: CreateOrUpdateCoachProfileDto;
	onPlayerProfileSave: (data: CreateOrUpdatePlayerProfileDto) => void;
	onCoachProfileSave: (data: CreateOrUpdateCoachProfileDto) => void;
}

const ProfileRequirementsSection = ({
	requirePlayerProfile,
	requireCoachProfile,
	hasPlayerProfile,
	hasCoachProfile,
	playerProfileData,
	coachProfileData,
	onPlayerProfileSave,
	onCoachProfileSave,
}: ProfileRequirementsSectionProps) => {
	const [showPlayerModal, setShowPlayerModal] = useState(false);
	const [showCoachModal, setShowCoachModal] = useState(false);
	const [localPlayerData, setLocalPlayerData] = useState<CreateOrUpdatePlayerProfileDto | undefined>(playerProfileData);
	const [localCoachData, setLocalCoachData] = useState<CreateOrUpdateCoachProfileDto | undefined>(coachProfileData);

	const playerComplete = hasPlayerProfile || !!localPlayerData;
	const coachComplete = hasCoachProfile || !!localCoachData;

	const handlePlayerSave = (data: CreateOrUpdatePlayerProfileDto) => {
		setLocalPlayerData(data);
		onPlayerProfileSave(data);
		setShowPlayerModal(false);
	};

	const handleCoachSave = (data: CreateOrUpdateCoachProfileDto) => {
		setLocalCoachData(data);
		onCoachProfileSave(data);
		setShowCoachModal(false);
	};

	if (!requirePlayerProfile && !requireCoachProfile) {
		return null;
	}

	return (
		<div className="flex flex-col gap-4">
			{requirePlayerProfile && (
				<div className={`p-4 rounded-xl border ${playerComplete ? "bg-green-500/10 border-green-500/30" : "bg-amber-500/10 border-amber-500/30"}`}>
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-start gap-3">
							{playerComplete ? (
								<CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
							) : (
								<AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
							)}
							<div>
								<h4 className="font-medium text-white">{playerComplete ? "Player profile complete" : "Player profile required"}</h4>
								<p className="text-sm text-muted mt-1">
									{playerComplete
										? "Your player information has been filled out."
										: "This club requires you to fill your player information."}
								</p>
							</div>
						</div>
						<Button variant={playerComplete ? "ghost" : "outline"} size="sm" onClick={() => setShowPlayerModal(true)} leftIcon={<User size={14} />}>
							{playerComplete ? "Edit" : "Complete"}
						</Button>
					</div>
				</div>
			)}

			{requireCoachProfile && (
				<div className={`p-4 rounded-xl border ${coachComplete ? "bg-green-500/10 border-green-500/30" : "bg-amber-500/10 border-amber-500/30"}`}>
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-start gap-3">
							{coachComplete ? (
								<CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
							) : (
								<AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
							)}
							<div>
								<h4 className="font-medium text-white">{coachComplete ? "Coach profile complete" : "Coach profile required"}</h4>
								<p className="text-sm text-muted mt-1">
									{coachComplete ? "Your coach information has been filled out." : "This club requires you to fill your coach information."}
								</p>
							</div>
						</div>
						<Button variant={coachComplete ? "ghost" : "outline"} size="sm" onClick={() => setShowCoachModal(true)} leftIcon={<Award size={14} />}>
							{coachComplete ? "Edit" : "Complete"}
						</Button>
					</div>
				</div>
			)}

			{/* Player Profile Modal */}
			<Modal isOpen={showPlayerModal} onClose={() => setShowPlayerModal(false)} title="Player Profile" size="lg">
				<PlayerInfoStep defaultValues={localPlayerData} onNext={handlePlayerSave} formId="player-profile-form" />
				<div className="flex justify-end gap-3 mt-6">
					<Button variant="ghost" onClick={() => setShowPlayerModal(false)}>
						Cancel
					</Button>
					<Button type="submit" form="player-profile-form" variant="solid" color="primary">
						Save
					</Button>
				</div>
			</Modal>

			{/* Coach Profile Modal */}
			<Modal isOpen={showCoachModal} onClose={() => setShowCoachModal(false)} title="Coach Profile" size="lg">
				<CoachInfoStep defaultValues={localCoachData} onNext={handleCoachSave} formId="coach-profile-form" />
				<div className="flex justify-end gap-3 mt-6">
					<Button variant="ghost" onClick={() => setShowCoachModal(false)}>
						Cancel
					</Button>
					<Button type="submit" form="coach-profile-form" variant="solid" color="primary">
						Save
					</Button>
				</div>
			</Modal>
		</div>
	);
};

export default ProfileRequirementsSection;
