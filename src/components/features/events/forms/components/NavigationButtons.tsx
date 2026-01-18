import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEventFormContext } from "../context/EventFormContext";

export function NavigationButtons() {
	const { wizard, form } = useEventFormContext();
	const { nextStep, prevStep, isFirstStep, isLastStep } = wizard;
	const { isPending, handleSubmit, saveEvent, formState } = form;
	console.log("formState.errors", formState.errors);
	return (
		<div className="relative z-10 mt-10 pt-6 border-t border-white/10">
			{Object.keys(formState.errors).length > 0 && (
				<div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg mb-6 mt-4">
					<p className="text-sm opacity-80">Please check your inputs and try again.</p>
				</div>
			)}
			<div className={cn("flex items-center", isFirstStep ? "justify-end" : "justify-between")}>
				{!isFirstStep && (
					<Button
						type="button"
						variant="ghost"
						onClick={prevStep}
						color={"neutral"}
						disabled={isFirstStep || isPending}
						leftIcon={<ArrowLeft size={16} />}>
						Back
					</Button>
				)}

				{!isLastStep ? (
					<Button type="button" variant={"outline"} onClick={nextStep} rightIcon={<ArrowRight size={16} />}>
						Next Step
					</Button>
				) : (
					<Button
						type="submit"
						disabled={isPending}
						loading={isPending}
						onClick={handleSubmit(saveEvent)}
						rightIcon={!isPending ? <Check size={16} /> : undefined}>
						{isPending ? "Creating..." : "Create Event"}
					</Button>
				)}
			</div>
		</div>
	);
}
