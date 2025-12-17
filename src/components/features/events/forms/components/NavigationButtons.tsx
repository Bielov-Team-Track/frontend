import { Button } from "@/components/ui";
import { FaArrowLeft, FaArrowRight, FaCheck } from "react-icons/fa";
import { useEventFormContext } from "../context/EventFormContext";

export function NavigationButtons() {
	const { wizard, form } = useEventFormContext();
	const { nextStep, prevStep, isFirstStep, isLastStep } = wizard;
	const { isPending, handleSubmit, saveEvent } = form;

	return (
		<div className="relative z-10 mt-10 flex items-center justify-between pt-6 border-t border-white/10">
			<Button
				type="button"
				variant="link"
				onClick={prevStep}
				color={"neutral"}
				disabled={isFirstStep || isPending}
				leftIcon={<FaArrowLeft />}
				className="text-muted hover:text-white">
				Back
			</Button>

			{!isLastStep ? (
				<Button
					type="button"
					variant="solid"
					color="primary"
					onClick={nextStep}
					rightIcon={<FaArrowRight />}
					className="px-8 shadow-lg shadow-primary/20">
					Next Step
				</Button>
			) : (
				<Button
					type="submit"
					variant="solid"
					color="primary"
					disabled={isPending}
					loading={isPending}
					onClick={handleSubmit(saveEvent)}
					className="px-8 bg-green-600 hover:bg-green-700 text-white border-none shadow-lg shadow-green-600/20"
					rightIcon={!isPending ? <FaCheck /> : undefined}>
					{isPending ? "Creating..." : "Create Event"}
				</Button>
			)}
		</div>
	);
}
