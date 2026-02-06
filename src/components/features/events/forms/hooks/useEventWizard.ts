import { EventType } from "@/lib/models/Event";
import { useEffect, useState } from "react";
import { TOTAL_STEPS } from "../config/stepConfig";
import { STEP_VALIDATION_FIELDS } from "../constants/eventFormOptions";

interface UseEventWizardProps {
	trigger: (fields?: string[]) => Promise<boolean>;
	watch: (field?: string) => any;
}

/**
 * Returns the fields to validate for step 1 based on whether it's a recurring event
 */
function getStep1ValidationFields(isRecurring: boolean): string[] {
	const baseFields = ["name", "type", "isRecurring"];

	if (isRecurring) {
		// Recurring event - validate recurring fields
		return [
			...baseFields,
			"recurrencePattern",
			"firstOccurrenceDate",
			"seriesEndDate",
			"eventStartTime",
			"eventEndTime",
		];
	}
	// Single event - validate single event fields
	return [
		...baseFields,
		"eventDate",
		"eventStartTime",
		"eventEndTime",
	];
}

/**
 * Returns the fields to validate for step 3 (Participants) based on event type
 */
function getParticipantsValidationFields(eventType: EventType): string[] {
	const baseFields = ["eventFormat"];

	// Add casualPlayFormat if event type is CasualPlay
	if (eventType === EventType.CasualPlay) {
		baseFields.push("casualPlayFormat");
	}

	return baseFields;
}

/**
 * Returns the fields to validate for step 4 (Payment) based on payment config
 */
function getPaymentValidationFields(usePaymentConfig: boolean): string[] {
	// Add payment config fields if payment is enabled
	if (usePaymentConfig) {
		return ["paymentConfig.pricingModel", "paymentConfig.cost"];
	}

	return [];
}

export function useEventWizard({ trigger, watch }: UseEventWizardProps) {
	const [currentStep, setCurrentStep] = useState(1);
	const [highestVisitedStep, setHighestVisitedStep] = useState(1);
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
			case 1:
				// Basics - conditional based on isRecurring
				fieldsToValidate = getStep1ValidationFields(values.isRecurring);
				break;
			case 3:
				// Participants - conditional based on event type
				fieldsToValidate = getParticipantsValidationFields(values.type as EventType);
				break;
			case 4:
				// Payment - conditional based on payment config
				fieldsToValidate = getPaymentValidationFields(values.usePaymentConfig);
				break;
			default:
				// Use default fields for other steps (Step 2: Location, Step 5: Review)
				fieldsToValidate = [...STEP_VALIDATION_FIELDS[currentStep as keyof typeof STEP_VALIDATION_FIELDS]];
		}

		const isValid = await trigger(fieldsToValidate);

		if (isValid && currentStep < TOTAL_STEPS) {
			const newStep = currentStep + 1;
			setCurrentStep(newStep);
			setHighestVisitedStep((prev) => Math.max(prev, newStep));
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			const newStep = currentStep - 1;
			setCurrentStep(newStep);
		}
	};

	const goToStep = (step: number) => {
		if (step >= 1 && step <= highestVisitedStep) {
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
		highestVisitedStep,
	};
}
