import { useEventFormContext } from "../context/EventFormContext";
import { STEP_CONFIG, getActiveSteps } from "../config/stepConfig";

export function ProgressIndicator() {
  const { wizard } = useEventFormContext();
  const { currentStep, totalSteps } = wizard;

  const activeSteps = getActiveSteps();

  return (
    <div className="p-12">
      <div className="flex justify-between text-xs text-base-content/60 mb-2">
        {activeSteps.map((stepNumber) => {
          const stepConfig = STEP_CONFIG[stepNumber];
          const isCurrentStep = stepNumber === currentStep;

          return (
            <span
              key={stepConfig.key}
              className={`flex-1 text-center ${
                isCurrentStep ? "font-semibold" : ""
              }`}
            >
              {stepConfig.label}
            </span>
          );
        })}
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-accent h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}