"use client";

import { Steps } from "@/components/ui";
import { WizardStep } from "./types";

interface WizardStepIndicatorProps {
	steps: WizardStep<any>[];
	currentStep: number;
	className?: string;
}

export function WizardStepIndicator({ steps, currentStep, className }: WizardStepIndicatorProps) {
	return <Steps steps={steps} currentStep={currentStep} className={className} />;
}
