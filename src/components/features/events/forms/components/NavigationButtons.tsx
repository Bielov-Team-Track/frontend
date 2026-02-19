import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { FieldErrors } from "react-hook-form";
import { STEP_CONFIG } from "../config/stepConfig";
import { getErrorSteps, getFirstErrorStep } from "../constants/eventFormOptions";
import { useEventFormContext } from "../context/EventFormContext";

export function NavigationButtons() {
	const { wizard, form } = useEventFormContext();
	const { nextStep, prevStep, goToStep, isFirstStep, isLastStep } = wizard;
	const { isPending, handleSubmit, saveEvent, formState } = form;

	const errors = formState.errors;
	const hasErrors = Object.keys(errors).length > 0;
	const errorSteps = hasErrors ? getErrorSteps(errors as Record<string, unknown>) : [];

	const onInvalid = (fieldErrors: FieldErrors) => {
		console.warn("[EventForm] Submission validation failed:", fieldErrors);
		const firstStep = getFirstErrorStep(fieldErrors as Record<string, unknown>);
		if (firstStep && firstStep !== wizard.currentStep) {
			goToStep(firstStep);
		}
	};

	return (
		<div className="relative z-10 mt-6 sm:mt-10 pt-4 sm:pt-6 border-t border-border">
			{hasErrors && (
				<div className="bg-error/10 border border-error/20 text-error p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 mt-2 sm:mt-4">
					<div className="flex items-start gap-2">
						<AlertCircle size={16} className="shrink-0 mt-0.5" />
						<div className="space-y-1">
							<p className="text-xs sm:text-sm font-medium">Please fix the following errors:</p>
							<div className="flex flex-wrap gap-1.5">
								{errorSteps.map((step) => (
									<button
										key={step}
										type="button"
										onClick={() => goToStep(step)}
										className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-error/15 hover:bg-error/25 text-xs sm:text-sm font-medium transition-colors">
										{STEP_CONFIG[step]?.label || `Step ${step}`}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
			<div className={cn("flex flex-col-reverse sm:flex-row gap-3 sm:gap-0 sm:items-center", isFirstStep ? "sm:justify-end" : "sm:justify-between")}>
				{!isFirstStep && (
					<Button
						type="button"
						variant="ghost"
						onClick={prevStep}
						color={"neutral"}
						disabled={isFirstStep || isPending}
						leftIcon={<ArrowLeft size={16} />}
						className="w-full sm:w-auto"
						data-testid="back-button">
						Back
					</Button>
				)}

				{!isLastStep ? (
					<Button type="button" variant={"outline"} onClick={nextStep} rightIcon={<ArrowRight size={16} />} className="w-full sm:w-auto" data-testid="next-step-button">
						Next Step
					</Button>
				) : (
					<Button
						type="submit"
						disabled={isPending}
						loading={isPending}
						onClick={handleSubmit(saveEvent as any, onInvalid)}
						rightIcon={!isPending ? <Check size={16} /> : undefined}
						className="w-full sm:w-auto"
						data-testid="create-event-button">
						{isPending ? "Creating..." : "Create Event"}
					</Button>
				)}
			</div>
		</div>
	);
}
