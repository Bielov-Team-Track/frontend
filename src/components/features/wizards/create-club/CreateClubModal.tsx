"use client";

import { WizardContext } from "../core/types";
import { useWizard } from "../core/useWizard";
import { WizardModal } from "../core/WizardModal";
import { createClubWizardConfig } from "./config";

interface CreateClubModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function CreateClubModal({ isOpen, onClose }: CreateClubModalProps) {
	const context: WizardContext = { source: "dashboard" };

	const wizard = useWizard({
		config: createClubWizardConfig,
		context,
		hasClubs: false, // Not relevant for club creation
		onClose,
	});

	const handleClose = () => {
		wizard.reset();
		onClose();
	};

	return (
		<WizardModal
			isOpen={isOpen}
			onClose={handleClose}
			config={createClubWizardConfig}
			form={wizard.form}
			state={wizard.state}
			activeSteps={wizard.activeSteps}
			currentStepConfig={wizard.currentStepConfig}
			currentStepIndex={wizard.currentStepIndex}
			context={context}
			isFirstStep={wizard.isFirstStep}
			isLastStep={wizard.isLastStep}
			canGoBack={wizard.canGoBack}
			onNext={wizard.nextStep}
			onBack={wizard.prevStep}
			onSubmit={wizard.submit}
		/>
	);
}
