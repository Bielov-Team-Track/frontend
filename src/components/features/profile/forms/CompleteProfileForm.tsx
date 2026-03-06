"use client";

import { useState, useMemo, useEffect } from "react";
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
		name: string;
		surname: string;
		imageUrl?: string;
		imageThumbHash?: string;
	} | null>(null);
	const [playerInfo, setPlayerInfo] = useState<CreateOrUpdatePlayerProfileDto | null>(null);
	const [coachInfo, setCoachInfo] = useState<CreateOrUpdateCoachProfileDto | null>(null);
	const [historyInfo, setHistoryInfo] = useState<{ bio: string } | null>(null);
	// Guardian and children steps will be added in Tasks D3 and D5

	// Keep-mounted step management: steps stay mounted (hidden) to preserve form state
	const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set(["roles"]));
	const [stepResetKeys, setStepResetKeys] = useState<Record<string, number>>({});

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

		// Step 1: Basic Info (mandatory for all - name, surname, profile picture)
		stepList.push({ id: "basic", label: "Basic Info", formId: "basic-info-form" });

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

	// Mark steps as visited when navigated to (for lazy mounting)
	useEffect(() => {
		if (currentStep) {
			setVisitedSteps((prev) => {
				if (prev.has(currentStep.id)) return prev;
				return new Set(prev).add(currentStep.id);
			});
		}
	}, [currentStep]);

	const isStepInList = (id: string) => steps.some((s) => s.id === id);

	const handleRoleSelectionNext = (roles: UserRole[]) => {
		setSelectedRoles(roles);
		setCurrentStepIndex((prev) => prev + 1);
	};

	const submitProfile = async (overrides?: {
		basicInfo?: { name: string; surname: string; imageUrl?: string; imageThumbHash?: string };
		playerInfo?: CreateOrUpdatePlayerProfileDto;
		coachInfo?: CreateOrUpdateCoachProfileDto;
	}) => {
		setIsLoading(true);
		setError(null);

		const effectiveBasicInfo = overrides?.basicInfo ?? basicInfo;
		const effectivePlayerInfo = overrides?.playerInfo ?? playerInfo;
		const effectiveCoachInfo = overrides?.coachInfo ?? coachInfo;

		try {
			// Update basic profile info (name, surname, and optionally image)
			if (effectiveBasicInfo) {
				await updateCurrentProfile({
					name: effectiveBasicInfo.name,
					surname: effectiveBasicInfo.surname,
					...(effectiveBasicInfo.imageUrl ? { imageUrl: effectiveBasicInfo.imageUrl } : {}),
				});
			}

			// Update player profile if provided
			if (effectivePlayerInfo) {
				await createOrUpdatePlayerProfile(effectivePlayerInfo);
			}

			// Update coach profile if provided
			if (effectiveCoachInfo) {
				await createOrUpdateCoachProfile(effectiveCoachInfo);
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

	const handleBasicInfoNext = (data: { name: string; surname: string; imageUrl?: string; imageThumbHash?: string }) => {
		setBasicInfo(data);
		if (isLastStep) {
			submitProfile({ basicInfo: data });
		} else {
			setCurrentStepIndex((prev) => prev + 1);
		}
	};

	const handlePlayerInfoNext = (data: CreateOrUpdatePlayerProfileDto) => {
		setPlayerInfo(data);
		if (isLastStep) {
			submitProfile({ playerInfo: data });
		} else {
			setCurrentStepIndex((prev) => prev + 1);
		}
	};

	const handleCoachInfoNext = (data: CreateOrUpdateCoachProfileDto) => {
		setCoachInfo(data);
		if (isLastStep) {
			submitProfile({ coachInfo: data });
		} else {
			setCurrentStepIndex((prev) => prev + 1);
		}
	};

	const handleHistoryNext = (data: { bio: string }) => {
		setHistoryInfo(data);
		submitProfile();
	};

	const handleBack = () => {
		setCurrentStepIndex((prev) => Math.max(0, prev - 1));
	};

	const handleSkip = () => {
		const stepId = currentStep?.id;
		if (stepId) {
			// Force remount to reset all form + local state
			setStepResetKeys((prev) => ({ ...prev, [stepId]: (prev[stepId] || 0) + 1 }));
			// Clear saved data so skipped steps don't get submitted
			switch (stepId) {
				case "basic":
					setBasicInfo(null);
					break;
				case "player":
					setPlayerInfo(null);
					break;
				case "coach":
					setCoachInfo(null);
					break;
				case "history":
					setHistoryInfo(null);
					break;
			}
		}
		if (isLastStep) {
			submitProfile();
		} else {
			setCurrentStepIndex((prev) => prev + 1);
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

			{/* Role selection: only rendered when active (no form state to preserve) */}
			{currentStep?.id === "roles" && (
				<RoleSelectionStep onComplete={handleRoleSelectionNext} isAdult={isAdult} defaultRoles={selectedRoles} />
			)}

			{/* Steps are kept mounted (hidden) to preserve form + local state across navigation */}
			{visitedSteps.has("basic") && isStepInList("basic") && (
				<div className={currentStep?.id !== "basic" ? "hidden" : undefined}>
					<BasicInfoStep
						key={stepResetKeys["basic"] || 0}
						defaultValues={basicInfo || undefined}
						onNext={handleBasicInfoNext}
						formId="basic-info-form"
					/>
				</div>
			)}

			{visitedSteps.has("player") && isStepInList("player") && (
				<div className={currentStep?.id !== "player" ? "hidden" : undefined}>
					<PlayerInfoStep
						key={stepResetKeys["player"] || 0}
						defaultValues={playerInfo || undefined}
						onNext={handlePlayerInfoNext}
						formId="player-info-form"
					/>
				</div>
			)}

			{visitedSteps.has("coach") && isStepInList("coach") && (
				<div className={currentStep?.id !== "coach" ? "hidden" : undefined}>
					<CoachInfoStep
						key={stepResetKeys["coach"] || 0}
						defaultValues={coachInfo || undefined}
						onNext={handleCoachInfoNext}
						formId="coach-info-form"
					/>
				</div>
			)}

			{visitedSteps.has("history") && isStepInList("history") && (
				<div className={currentStep?.id !== "history" ? "hidden" : undefined}>
					<HistoryStep
						key={stepResetKeys["history"] || 0}
						defaultValues={historyInfo || undefined}
						onNext={handleHistoryNext}
						formId="history-form"
					/>
				</div>
			)}

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
							type="button"
							onClick={() => {
								const form = document.getElementById(currentStep?.formId ?? "") as HTMLFormElement | null;
								form?.requestSubmit();
							}}
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
