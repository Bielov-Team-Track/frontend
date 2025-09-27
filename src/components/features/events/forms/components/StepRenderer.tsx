import { useEventFormContext } from "../context/EventFormContext";
import { STEP_CONFIG } from "../config/stepConfig";

export function StepRenderer() {
  const { wizard } = useEventFormContext();
  const { currentStep } = wizard;

  const stepConfig = STEP_CONFIG[currentStep];

  if (!stepConfig) {
    return <div>Invalid step</div>;
  }

  const CurrentStepComponent = stepConfig.component;

  if (!CurrentStepComponent) {
    return <div>Invalid step</div>;
  }

  return <CurrentStepComponent />;
}