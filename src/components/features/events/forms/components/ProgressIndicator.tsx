import { Steps } from "@/components/ui";
import { STEP_CONFIG, getActiveSteps } from "../config/stepConfig";
import { getErrorSteps } from "../constants/eventFormOptions";
import { useEventFormContext } from "../context/EventFormContext";

export function ProgressIndicator() {
	const { wizard, form } = useEventFormContext();
	const { currentStep, goToStep } = wizard;

	const activeSteps = getActiveSteps();
	const errorSteps = getErrorSteps(form.formState.errors as Record<string, unknown>);

	return (
		<div className="max-w-xl m-auto mb-4 sm:mb-8" data-testid="progress-indicator" data-current-step={currentStep}>
			{/* Mobile: smaller size */}
			<div className="sm:hidden">
				<Steps steps={activeSteps.map((s) => STEP_CONFIG[s])} currentStep={currentStep} size="sm" onStepClick={goToStep} errorSteps={errorSteps} />
			</div>
			{/* Desktop: medium size */}
			<div className="hidden sm:block">
				<Steps steps={activeSteps.map((s) => STEP_CONFIG[s])} currentStep={currentStep} size="md" onStepClick={goToStep} errorSteps={errorSteps} />
			</div>
		</div>
	);
}
