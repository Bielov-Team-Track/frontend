import { Steps } from "@/components/ui";
import { STEP_CONFIG, getActiveSteps } from "../config/stepConfig";
import { useEventFormContext } from "../context/EventFormContext";

export function ProgressIndicator() {
	const { wizard } = useEventFormContext();
	const { currentStep } = wizard;

	const activeSteps = getActiveSteps();

	return (
		<div className="max-w-xl m-auto mb-8" data-testid="progress-indicator" data-current-step={currentStep}>
			<Steps steps={activeSteps.map((s) => STEP_CONFIG[s])} currentStep={currentStep}></Steps>
		</div>
	);
}
