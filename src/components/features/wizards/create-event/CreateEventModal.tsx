"use client";

import { getUserClubs } from "@/lib/api/clubs";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ContextHeaderInfo, WizardContext } from "../core/types";
import { useWizard } from "../core/useWizard";
import { WizardModal } from "../core/WizardModal";
import { createEventWizardConfig } from "./config";

interface CreateEventModalProps {
	isOpen: boolean;
	onClose: () => void;
	context: WizardContext;
}

export function CreateEventModal({ isOpen, onClose, context }: CreateEventModalProps) {
	const { userProfile } = useAuth();

	// Fetch user's clubs to determine if Step 0 should show
	const { data: clubs = [] } = useQuery({
		queryKey: ["user-clubs", userProfile?.userId],
		queryFn: () => getUserClubs(userProfile!.userId!),
		enabled: !!userProfile?.userId && isOpen,
	});

	const hasClubs = clubs.length > 0;

	// Determine if context header should be editable
	const startedFromContextStep = context.source === "events" && hasClubs;

	const wizard = useWizard({
		config: createEventWizardConfig,
		context,
		hasClubs,
		onClose,
	});

	// Build context header info
	const contextHeaderInfo = useMemo((): ContextHeaderInfo | undefined => {
		const clubId = wizard.form.watch("clubId") || context.clubId;
		const teamId = wizard.form.watch("teamId") || context.teamId;
		const groupId = wizard.form.watch("groupId") || context.groupId;

		if (!clubId) return undefined;

		const club = clubs.find((c) => c.id === clubId);

		return {
			clubName: club?.name,
			teamName: teamId ? "Team" : undefined, // TODO: Resolve actual name
			groupName: groupId ? "Group" : undefined, // TODO: Resolve actual name
			isEditable: startedFromContextStep,
		};
	}, [wizard.form, context, clubs, startedFromContextStep]);

	const handleEditContext = () => {
		if (startedFromContextStep) {
			wizard.goToStep(0);
		}
	};

	const handleClose = () => {
		wizard.reset();
		onClose();
	};

	return (
		<WizardModal
			isOpen={isOpen}
			onClose={handleClose}
			config={createEventWizardConfig}
			form={wizard.form}
			state={wizard.state}
			activeSteps={wizard.activeSteps}
			currentStepConfig={wizard.currentStepConfig}
			currentStepIndex={wizard.currentStepIndex}
			context={context}
			contextHeaderInfo={contextHeaderInfo}
			isFirstStep={wizard.isFirstStep}
			isLastStep={wizard.isLastStep}
			canGoBack={wizard.canGoBack}
			onNext={wizard.nextStep}
			onBack={wizard.prevStep}
			onSubmit={wizard.submit}
			onEditContext={handleEditContext}
		/>
	);
}
