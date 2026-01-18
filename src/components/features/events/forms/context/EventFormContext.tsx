import { Club, Group, Team } from "@/lib/models/Club";
import { Event } from "@/lib/models/Event";
import React, { createContext, ReactNode, useContext } from "react";
import { UseFormReturn } from "react-hook-form";
import { useEventForm } from "../hooks/useEventForm";
import { useEventWizard } from "../hooks/useEventWizard";
import { EventFormData } from "../validation/eventValidationSchema";

interface EventFormContextType {
	form: UseFormReturn<EventFormData> & {
		saveEvent: (data: EventFormData) => void;
		isPending: boolean;
		isError: boolean;
		error: any;
	};
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
}

const EventFormContext = createContext<EventFormContextType | undefined>(undefined);

interface EventFormProviderProps {
	children: ReactNode;
	event?: Event;
	context?: Club | Group | Team | null;
}

export function EventFormProvider({ children, event, context }: EventFormProviderProps) {
	const form = useEventForm(event);
	const wizard = useEventWizard({
		trigger: form.trigger as any,
		watch: form.watch,
	});

	const value: EventFormContextType = {
		form,
		wizard,
		context,
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
