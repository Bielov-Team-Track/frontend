import { Button } from "@/components/ui";
import { FaChevronLeft, FaVolleyballBall } from "react-icons/fa";
import { useEventFormContext } from "../context/EventFormContext";

export function NavigationButtons() {
  const { wizard, form } = useEventFormContext();
  const { currentStep, nextStep, prevStep, isFirstStep, isLastStep } = wizard;
  const { isPending, handleSubmit, saveEvent } = form;

  return (
    <div className="flex justify-between pt-6">
      {!isFirstStep && (
        <Button
          type="button"
          variant="ghost"
          color="neutral"
          size="md"
          onClick={prevStep}
          leftIcon={<FaChevronLeft className="w-4 h-4" />}
        >
          Previous
        </Button>
      )}

      <div className="ml-auto">
        {!isLastStep ? (
          <Button
            type="button"
            variant="solid"
            color="primary"
            onClick={nextStep}
            rightIcon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            }
          >
            Next Step
          </Button>
        ) : (
          <Button
            type="submit"
            variant="solid"
            color="secondary"
            disabled={isPending}
            loading={isPending}
            onClick={handleSubmit(saveEvent)}
            rightIcon={<FaVolleyballBall className="w-4 h-4" />}
          >
            {isPending ? "Creating..." : "Create Event"}
          </Button>
        )}
      </div>
    </div>
  );
}