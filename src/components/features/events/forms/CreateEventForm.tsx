"use client";

import React from "react";
import { Loader } from "@/components/ui";
import { Event, Location } from "@/lib/models/Event";
import { EventFormProvider } from "./context/EventFormContext";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { StepRenderer } from "./components/StepRenderer";
import { NavigationButtons } from "./components/NavigationButtons";
import { useEventFormContext } from "./context/EventFormContext";

// Internal component that uses the context
function CreateEventFormContent() {
	const { form } = useEventFormContext();
	const { isPending, isError } = form;

	return (
		<form className="relative p-6">
			{isPending && (
				<Loader className="absolute inset-0 bg-black/55 rounded-xl z-50" />
			)}

			{isError && (
				<div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg mb-6">
					<p className="font-medium">Something went wrong</p>
					<p className="text-sm opacity-80">
						We&apos;re working on it. Please try again.
					</p>
				</div>
			)}

			<StepRenderer />
			<NavigationButtons />
		</form>
	);
}

function CreateEventForm({ locations, event }: CreateEventFormProps) {
	return (
		<EventFormProvider event={event} locations={locations}>
			<div className="overflow-hidden">
				<ProgressIndicator />
				<CreateEventFormContent />
			</div>
		</EventFormProvider>
	);
}

type CreateEventFormProps = {
	locations: Location[];
	event?: Event;
} & React.PropsWithChildren;

export default CreateEventForm;
