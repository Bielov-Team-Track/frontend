import React, { createContext, useContext, ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { Event, Location } from "@/lib/models/Event";
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
  locations: Location[];
}

const EventFormContext = createContext<EventFormContextType | undefined>(undefined);

interface EventFormProviderProps {
  children: ReactNode;
  event?: Event;
  locations: Location[];
}

export function EventFormProvider({ children, event, locations }: EventFormProviderProps) {
  const form = useEventForm(event);
  const wizard = useEventWizard({
    trigger: form.trigger,
    watch: form.watch,
  });

  const value: EventFormContextType = {
    form,
    wizard,
    locations,
  };

  return (
    <EventFormContext.Provider value={value}>
      {children}
    </EventFormContext.Provider>
  );
}

export function useEventFormContext(): EventFormContextType {
  const context = useContext(EventFormContext);
  if (context === undefined) {
    throw new Error("useEventFormContext must be used within an EventFormProvider");
  }
  return context;
}