import { Club, Group, Team } from "@/lib/models/Club";
import { Event } from "@/lib/models/Event";
import React, { createContext, ReactNode, useContext } from "react";
import { UseFormReturn } from "react-hook-form";
import { ContextSelection } from "../components/ContextSelector";
import { useEventForm } from "../hooks/useEventForm";
import { useEventWizard } from "../hooks/useEventWizard";
import { EventFormData } from "../validation/eventValidationSchema";
import { useFormPersistence } from "../hooks/useFormPersistence";

type EventFormReturnType = ReturnType<typeof useEventForm>;

interface EventFormContextType {
	form: EventFormReturnType;
	wizard: {
		currentStep: number;
		nextStep: (e?: React.MouseEvent) => Promise<void>;
		prevStep: () => void;
		goToStep: (step: number) => void;
		isFirstStep: boolean;
		isLastStep: boolean;
		totalSteps: number;
	};
	context?: Club | Group | Team | null;
	contextSelection?: ContextSelection;
}

const EventFormContext = createContext<EventFormContextType | undefined>(undefined);

interface EventFormProviderProps {
	children: ReactNode;
	event?: Event;
	contextSelection?: ContextSelection;
	onSuccess?: () => void;
}

export function EventFormProvider({ children, event, contextSelection, onSuccess }: EventFormProviderProps) {
	const form = useEventForm(event, contextSelection, onSuccess);
	const wizard = useEventWizard({
		trigger: form.trigger as any,
		watch: form.watch,
	});

	useFormPersistence(form, wizard.currentStep);

	const value: EventFormContextType = {
		form,
		wizard,
		context: contextSelection?.context,
		contextSelection,
	};

	return <EventFormContext.Provider value={value}>{children}</EventFormContext.Provider>;
}

export function useEventFormContext(): EventFormContextType {
	const context = useContext(EventFormContext);
	if (context === undefined) {
		throw new Error("useEventFormContext must be used within an EventFormProvider");
	}
	return context;
}
