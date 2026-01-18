import { EventType } from "@/lib/models/Event";
import { useEffect, useState } from "react";
import { TOTAL_STEPS } from "../config/stepConfig";
import { STEP_VALIDATION_FIELDS } from "../constants/eventFormOptions";

interface UseEventWizardProps {
	trigger: (fields?: string[]) => Promise<boolean>;
	watch: (field?: string) => any;
}

/**
 * Returns the fields to validate for step 2 based on whether it's a recurring event
 */
function getStep2ValidationFields(isRecurring: boolean): string[] {
	if (isRecurring) {
		// Recurring event - validate recurring fields only
		return [
			"isRecurring",
			"recurrencePattern",
			"firstOccurrenceDate",
			"seriesEndDate",
			"eventStartTime",
			"eventEndTime",
		];
	}
	// Single event - validate single event fields only
	return ["isRecurring", "startTime", "endTime"];
}

/**
 * Returns the fields to validate for step 4 based on event type
 */
function getStep4ValidationFields(eventType: EventType): string[] {
	const baseFields = ["registrationType"];

	switch (eventType) {
		case EventType.CasualPlay:
			// CasualPlay requires casualPlayFormat selection
			return [...baseFields, "casualPlayFormat"];
		case EventType.Match:
			// Match events may need team-related validation in the future
			return baseFields;
		case EventType.Social:
		case EventType.TrainingSession:
		default:
			// Social and Training use list format, only need registrationType
			return baseFields;
	}
}

/**
 * Returns the fields to validate for step 5 based on whether budget is enabled
 */
function getStep5ValidationFields(useBudget: boolean): string[] {
	if (!useBudget) {
		// Budget disabled - no validation needed
		return [];
	}
	// Budget enabled - validate required budget fields
	return ["budget.pricingModel", "budget.cost"];
}

export function useEventWizard({ trigger, watch }: UseEventWizardProps) {
	const [currentStep, setCurrentStep] = useState(1);
	const values = watch();

	useEffect(() => {
		if (typeof window !== "undefined") {
			const handlePopState = () => {
				setCurrentStep((prevStep) => Math.max(1, prevStep - 1));
			};

			window.addEventListener("popstate", handlePopState);
			return () => {
				window.removeEventListener("popstate", handlePopState);
			};
		}
	}, []);

	const nextStep = async (e?: React.MouseEvent) => {
		e?.preventDefault();

		let fieldsToValidate: string[];

		switch (currentStep) {
			case 2:
				// Time & Date - conditional based on isRecurring
				fieldsToValidate = getStep2ValidationFields(values.isRecurring);
				break;
			case 4:
				// Registration - conditional based on event type
				fieldsToValidate = getStep4ValidationFields(values.type as EventType);
				break;
			case 5:
				// Budget - conditional based on useBudget
				fieldsToValidate = getStep5ValidationFields(values.useBudget);
				break;
			default:
				// Use default fields for other steps
				fieldsToValidate = [...STEP_VALIDATION_FIELDS[currentStep as keyof typeof STEP_VALIDATION_FIELDS]];
		}

		const isValid = await trigger(fieldsToValidate);

		if (isValid && currentStep < TOTAL_STEPS) {
			const newStep = currentStep + 1;
			setCurrentStep(newStep);
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			const newStep = currentStep - 1;
			setCurrentStep(newStep);
		}
	};

	const goToStep = (step: number) => {
		if (step >= 1 && step <= TOTAL_STEPS) {
			setCurrentStep(step);
		}
	};

	return {
		currentStep,
		nextStep,
		prevStep,
		goToStep,
		isFirstStep: currentStep === 1,
		isLastStep: currentStep === TOTAL_STEPS,
		totalSteps: TOTAL_STEPS,
	};
}
