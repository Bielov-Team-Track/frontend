"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { createOrUpdateCoachProfile, createOrUpdatePlayerProfile, updateCurrentProfile } from "@/lib/api/user";

import { CreateOrUpdateCoachProfileDto, CreateOrUpdatePlayerProfileDto } from "@/lib/models/Profile";

import BasicInfoStep from "./steps/BasicInfoStep";

import PlayerInfoStep from "./steps/PlayerInfoStep";

import CoachInfoStep from "./steps/CoachInfoStep";

import HistoryStep from "./steps/HistoryStep";

import { Button } from "@/components/ui";

import Steps from "@/components/ui/steps";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

type CompleteProfileFormProps = {
	onProfileComplete?: () => void;
};

const STEPS = [
	{ id: 1, label: "Basic Info", formId: "basic-info-form" },

	{ id: 2, label: "Player", formId: "player-info-form" },

	{ id: 3, label: "Coach", formId: "coach-info-form" },

	{ id: 4, label: "History", formId: "history-form" },
];

const CompleteProfileForm = ({ onProfileComplete }: CompleteProfileFormProps) => {
	const router = useRouter();

	const [currentStep, setCurrentStep] = useState(1);

	const [isLoading, setIsLoading] = useState(false);

	const [error, setError] = useState<string | null>(null);

	// Form Data State

	const [basicInfo, setBasicInfo] = useState<{
		name: string;
		surname: string;
		imageUrl?: string;
	} | null>(null);

	const [playerInfo, setPlayerInfo] = useState<CreateOrUpdatePlayerProfileDto | null>(null);

	const [coachInfo, setCoachInfo] = useState<CreateOrUpdateCoachProfileDto | null>(null);

	const [historyInfo, setHistoryInfo] = useState<{ bio: string } | null>(null);

	const handleBasicInfoNext = (data: { name: string; surname: string; imageUrl?: string }) => {
		setBasicInfo(data);

		setCurrentStep(2);
	};

	const handlePlayerInfoNext = (data: CreateOrUpdatePlayerProfileDto) => {
		setPlayerInfo(data);

		setCurrentStep(3);
	};

	const handleCoachInfoNext = (data: CreateOrUpdateCoachProfileDto) => {
		setCoachInfo(data);

		setCurrentStep(4);
	};

	const handleHistoryNext = (data: { bio: string }) => {
		setHistoryInfo(data);

		submitProfile();
	};

	const submitProfile = async () => {
		if (!basicInfo) return;

		setIsLoading(true);

		setError(null);

		try {
			// Update basic profile info
			await updateCurrentProfile({
				name: basicInfo.name,
				surname: basicInfo.surname,
				imageUrl: basicInfo.imageUrl,
			});

			// Update player profile if provided
			if (playerInfo) {
				await createOrUpdatePlayerProfile(playerInfo);
			}

			// Update coach profile if provided
			if (coachInfo) {
				await createOrUpdateCoachProfile(coachInfo);
			}

			if (onProfileComplete) {
				onProfileComplete();
			} else {
				router.push("/dashboard");
			}
		} catch (error: any) {
			console.error("Profile update error:", error);

			const message = error.response?.data?.message || "Failed to update profile";

			setError(message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleBack = () => {
		setCurrentStep((prev) => Math.max(1, prev - 1));
	};

	const handleSkip = () => {
		if (currentStep === 2) {
			setPlayerInfo(null);

			setCurrentStep(3);
		} else if (currentStep === 3) {
			setCoachInfo(null);

			setCurrentStep(4);
		} else if (currentStep === 4) {
			setHistoryInfo(null);

			submitProfile();
		}
	};

	const currentStepConfig = STEPS[currentStep - 1];

	const isFirstStep = currentStep === 1;

	const isLastStep = currentStep === STEPS.length;

	// Step 1 is mandatory (Basic Info), others are optional

	const isOptionalStep = currentStep > 1;

	return (
		<div className="flex flex-col gap-6 w-full">
			<Steps steps={STEPS} currentStep={currentStep} className="max-w-96 m-auto" />

			{error && (
				<div className="text-error bg-error/10 p-3 rounded-lg border border-error/20 text-center">
					<span className="text-sm font-medium">{error}</span>
				</div>
			)}

			{currentStep === 1 && <BasicInfoStep defaultValues={basicInfo || undefined} onNext={handleBasicInfoNext} formId={STEPS[0].formId} />}

			{currentStep === 2 && <PlayerInfoStep defaultValues={playerInfo || undefined} onNext={handlePlayerInfoNext} formId={STEPS[1].formId} />}

			{currentStep === 3 && <CoachInfoStep defaultValues={coachInfo || undefined} onNext={handleCoachInfoNext} formId={STEPS[2].formId} />}

			{currentStep === 4 && <HistoryStep defaultValues={historyInfo || undefined} onNext={handleHistoryNext} formId={STEPS[3].formId} />}

			{/* Navigation Buttons */}

			<div className="flex justify-between pt-4 items-center mt-2 border-t border-border">
				<div>
					{!isFirstStep && (
						<Button variant="ghost" onClick={handleBack} type="button" className="gap-2" disabled={isLoading} leftIcon={<ArrowLeft size={20} />}>
							Back
						</Button>
					)}
				</div>

				<div className="flex gap-2">
					{isOptionalStep && (
						<Button variant="ghost" onClick={handleSkip} type="button" color={"neutral"} className="hover:text-white" disabled={isLoading}>
							Skip
						</Button>
					)}

					<Button
						type="submit"
						form={currentStepConfig.formId}
						disabled={isLoading}
						loading={isLoading}
						className="gap-2"
						variant={isLastStep ? "default" : "outline"}
						rightIcon={isLastStep ? <Check size={20} /> : <ArrowRight size={20} />}>
						{isLastStep ? <>Finish Setup</> : <>Next Step</>}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CompleteProfileForm;
