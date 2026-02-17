"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createOrUpdateCoachProfile, createOrUpdatePlayerProfile, updateCurrentProfile } from "@/lib/api/user";
import { CreateOrUpdateCoachProfileDto, CreateOrUpdatePlayerProfileDto } from "@/lib/models/Profile";
import { RoleSelectionStep, UserRole } from "./steps/RoleSelectionStep";
import BasicInfoStep from "./steps/BasicInfoStep";
import PlayerInfoStep from "./steps/PlayerInfoStep";
import CoachInfoStep from "./steps/CoachInfoStep";
import HistoryStep from "./steps/HistoryStep";
import { Button } from "@/components/ui";
import Steps from "@/components/ui/steps";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

type CompleteProfileFormProps = {
	onProfileComplete?: () => void | Promise<void>;
	isAdult?: boolean; // Determines if Parent/Guardian role is available
	ageTier?: string; // For guardian step logic (Teen13ToConsent, TeenConsentTo17, Adult)
};

const CompleteProfileForm = ({ onProfileComplete, isAdult = true, ageTier = "Adult" }: CompleteProfileFormProps) => {
	const router = useRouter();
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Form Data State
	const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
	const [basicInfo, setBasicInfo] = useState<{
		imageUrl?: string;
		imageThumbHash?: string;
	} | null>(null);
	const [playerInfo, setPlayerInfo] = useState<CreateOrUpdatePlayerProfileDto | null>(null);
	const [coachInfo, setCoachInfo] = useState<CreateOrUpdateCoachProfileDto | null>(null);
	const [historyInfo, setHistoryInfo] = useState<{ bio: string } | null>(null);
	// Guardian and children steps will be added in Tasks D3 and D5

	// Dynamic step calculation based on selected roles and age tier
	const steps = useMemo(() => {
		const stepList: Array<{
			id: string;
			label: string;
			formId?: string;
			optional?: boolean;
		}> = [];

		// Step 0: Role Selection (mandatory for all)
		stepList.push({ id: "roles", label: "Your Role" });

		// Step 1: Basic Info (mandatory for all - profile picture only)
		stepList.push({ id: "basic", label: "Profile Picture", formId: "basic-info-form", optional: true });

		// Step 2: Guardian Step (will be added in Task D3)
		// Mandatory for Teen13ToConsent, optional for TeenConsentTo17, hidden for Adult
		// if (ageTier === "Teen13ToConsent") {
		//   stepList.push({ id: "guardian", label: "Guardian", formId: "guardian-form" });
		// } else if (ageTier === "TeenConsentTo17") {
		//   stepList.push({ id: "guardian", label: "Guardian", formId: "guardian-form", optional: true });
		// }

		// Step 3: Player Profile (if Player selected)
		if (selectedRoles.includes("player")) {
			stepList.push({ id: "player", label: "Player Profile", formId: "player-info-form", optional: true });
		}

		// Step 4: Coach Profile (if Coach selected)
		if (selectedRoles.includes("coach")) {
			stepList.push({ id: "coach", label: "Coach Profile", formId: "coach-info-form", optional: true });
		}

		// Step 5: Add Children (if Parent/Guardian selected, 18+ only - will be added in Task D5)
		// if (selectedRoles.includes("parent") && isAdult) {
		//   stepList.push({ id: "children", label: "Add Children", formId: "children-form", optional: true });
		// }

		// Step 6: History (if Player or Coach selected)
		if (selectedRoles.includes("player") || selectedRoles.includes("coach")) {
			stepList.push({ id: "history", label: "History", formId: "history-form", optional: true });
		}

		return stepList;
	}, [selectedRoles, ageTier, isAdult]);

	const currentStep = steps[currentStepIndex];
	const isFirstStep = currentStepIndex === 0;
	const isLastStep = currentStepIndex === steps.length - 1;

	const handleRoleSelectionNext = (roles: UserRole[]) => {
		setSelectedRoles(roles);
		setCurrentStepIndex((prev) => prev + 1);
	};

	const handleBasicInfoNext = (data: { imageUrl?: string; imageThumbHash?: string }) => {
		setBasicInfo(data);
		setCurrentStepIndex((prev) => prev + 1);
	};

	const handlePlayerInfoNext = (data: CreateOrUpdatePlayerProfileDto) => {
		setPlayerInfo(data);
		setCurrentStepIndex((prev) => prev + 1);
	};

	const handleCoachInfoNext = (data: CreateOrUpdateCoachProfileDto) => {
		setCoachInfo(data);
		setCurrentStepIndex((prev) => prev + 1);
	};

	const handleHistoryNext = (data: { bio: string }) => {
		setHistoryInfo(data);
		submitProfile();
	};

	const submitProfile = async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Update basic profile info
			if (basicInfo?.imageUrl) {
				await updateCurrentProfile({
					imageUrl: basicInfo.imageUrl,
				});
			}

			// Update player profile if provided
			if (playerInfo) {
				await createOrUpdatePlayerProfile(playerInfo);
			}

			// Update coach profile if provided
			if (coachInfo) {
				await createOrUpdateCoachProfile(coachInfo);
			}

			if (onProfileComplete) {
				await onProfileComplete();
			} else {
				router.push("/hub");
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
		setCurrentStepIndex((prev) => Math.max(0, prev - 1));
	};

	const handleSkip = () => {
		if (isLastStep) {
			submitProfile();
		} else {
			setCurrentStepIndex((prev) => prev + 1);
		}
	};

	// Render current step
	const renderStep = () => {
		const stepId = currentStep?.id;

		switch (stepId) {
			case "roles":
				return <RoleSelectionStep onComplete={handleRoleSelectionNext} isAdult={isAdult} defaultRoles={selectedRoles} />;

			case "basic":
				return <BasicInfoStep defaultValues={basicInfo || undefined} onNext={handleBasicInfoNext} formId={currentStep.formId!} />;

			case "player":
				return <PlayerInfoStep defaultValues={playerInfo || undefined} onNext={handlePlayerInfoNext} formId={currentStep.formId!} />;

			case "coach":
				return <CoachInfoStep defaultValues={coachInfo || undefined} onNext={handleCoachInfoNext} formId={currentStep.formId!} />;

			case "history":
				return <HistoryStep defaultValues={historyInfo || undefined} onNext={handleHistoryNext} formId={currentStep.formId!} />;

			// Guardian and children steps will be added here in Tasks D3 and D5

			default:
				return <div>Unknown step</div>;
		}
	};

	return (
		<div className="flex flex-col gap-6 w-full">
			<Steps
				steps={steps.map((s, i) => ({ id: i + 1, label: s.label, formId: s.formId }))}
				currentStep={currentStepIndex + 1}
				className="max-w-96 m-auto"
			/>

			{error && (
				<div className="text-error bg-error/10 p-3 rounded-lg border border-error/20 text-center">
					<span className="text-sm font-medium">{error}</span>
				</div>
			)}

			{renderStep()}

			{/* Navigation Buttons - Skip for role selection step */}
			{currentStep?.id !== "roles" && (
				<div className="flex justify-between pt-4 items-center mt-2 border-t border-border">
					<div>
						{!isFirstStep && (
							<Button variant="ghost" onClick={handleBack} type="button" className="gap-2" disabled={isLoading} leftIcon={<ArrowLeft size={20} />}>
								Back
							</Button>
						)}
					</div>

					<div className="flex gap-2">
						{currentStep?.optional && (
							<Button variant="ghost" onClick={handleSkip} type="button" color={"neutral"} className="hover:text-white" disabled={isLoading}>
								Skip
							</Button>
						)}

						<Button
							type="submit"
							form={currentStep?.formId}
							disabled={isLoading}
							loading={isLoading}
							className="gap-2"
							variant={isLastStep ? "default" : "outline"}
							rightIcon={isLastStep ? <Check size={20} /> : <ArrowRight size={20} />}>
							{isLastStep ? <>Finish Setup</> : <>Next Step</>}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default CompleteProfileForm;
