"use client";

import React from "react";
import { Loader } from "@/components/ui";
import { Event, Location } from "@/lib/models/Event";
import { EventFormProvider } from "./context/EventFormContext";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { StepRenderer } from "./components/StepRenderer";
import { NavigationButtons } from "./components/NavigationButtons";
import { useEventFormContext } from "./context/EventFormContext";

function CreateEventFormContent() {
	const { form } = useEventFormContext();
	const { isPending, isError } = form;

	return (
		<>
			{isPending && (
				<Loader className="absolute inset-0 bg-black/60 rounded-3xl z-50" />
			)}

			{isError && (
				<div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg mb-6">
					<p className="font-medium">Something went wrong</p>
					<p className="text-sm opacity-80">
						We&apos;re working on it. Please try again.
					</p>
				</div>
			)}

			<div className="relative z-10 flex-1">
				<StepRenderer />
			</div>

			<NavigationButtons />
		</>
	);
}

function CreateEventForm({ locations, event }: CreateEventFormProps) {
	return (
		<EventFormProvider event={event} locations={locations}>
			<div className="w-full max-w-3xl mx-auto py-8 px-4 text-white">
				{/* Header */}
				<div className="mb-10 text-center">
					<h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
						{event ? "Edit Event" : "Create a New Event"}
					</h1>
					<p className="text-muted text-lg">
						Set up your volleyball game, practice, or tournament.
					</p>
				</div>

				{/* Stepper */}
				<ProgressIndicator />

				{/* Form Card */}
				<div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xs min-h-[500px] flex flex-col relative overflow-hidden">
					{/* Decorative Gradient Blob */}
					<div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/15 rounded-full blur-[100px] pointer-events-none" />

					<CreateEventFormContent />
				</div>
			</div>
		</EventFormProvider>
	);
}

type CreateEventFormProps = {
	locations: Location[];
	event?: Event;
} & React.PropsWithChildren;

export default CreateEventForm;
