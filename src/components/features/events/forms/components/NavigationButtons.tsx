import { Button } from "@/components/ui";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEventFormContext } from "../context/EventFormContext";

export function NavigationButtons() {
	const { wizard, form } = useEventFormContext();
	const { nextStep, prevStep, isFirstStep, isLastStep } = wizard;
	const { isPending, handleSubmit, saveEvent } = form;

	return (
		<div className="relative z-10 mt-10 flex items-center justify-between pt-6 border-t border-white/10">
			<Button type="button" variant="ghost" onClick={prevStep} color={"neutral"} disabled={isFirstStep || isPending} leftIcon={<ArrowLeft size={16} />}>
				Back
			</Button>

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
	);
}
