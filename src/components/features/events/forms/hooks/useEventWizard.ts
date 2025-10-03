import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EventFormat } from "@/lib/models/Event";
import { STEP_VALIDATION_FIELDS } from "../constants/eventFormOptions";
import { TOTAL_STEPS } from "../config/stepConfig";

interface UseEventWizardProps {
  trigger: (fields?: string[]) => Promise<boolean>;
  watch: (field?: string) => any;
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

    let fieldsToValidate =
      STEP_VALIDATION_FIELDS[
        currentStep as keyof typeof STEP_VALIDATION_FIELDS
      ];

    // Add dynamic validation for step 4
    if (currentStep === 4 && values.eventFormat !== EventFormat.Open) {
      fieldsToValidate = [...fieldsToValidate, "teamsNumber"] as any;
    }

    // Add dynamic validation for step 5 (budget)
    if (currentStep === 5) {
      if (values.useBudget) {
        // If budget is enabled, validate budget fields
        fieldsToValidate = [...fieldsToValidate, "budget.pricingModel", "budget.cost"] as any;
      }
    }

    const isValid = await trigger(fieldsToValidate as any);

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
