"use client";

import { Loader } from "@/components/ui";
import { Event } from "@/lib/models/Event";
import { useClub } from "@/providers";
import React from "react";
import { ContextIndicator } from "./components/ContextIndicator";
import ContextSelector, { ContextSelection } from "./components/ContextSelector";
import { NavigationButtons } from "./components/NavigationButtons";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { StepRenderer } from "./components/StepRenderer";
import { EventFormProvider, useEventFormContext } from "./context/EventFormContext";

type CreateEventFormContentProps = {
	onClearContext?: () => void;
	onChageContext?: () => void;
};

function CreateEventFormContent({ onClearContext, onChageContext }: CreateEventFormContentProps) {
	const { form, context } = useEventFormContext();
	const { isPending, isError } = form;

	return (
		<>
			{isPending && <Loader className="absolute inset-0 bg-overlay rounded-3xl z-50" />}

			<div className="relative z-10 flex-1">
				<StepRenderer />
			</div>
			<ContextIndicator context={context} onChange={onChageContext} onClear={onClearContext} />

			{isError && (
				<div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg mt-4">
					<p className="font-medium">Something went wrong</p>
					<p className="text-sm opacity-80">We&apos;re working on it. Please try again.</p>
				</div>
			)}

			<NavigationButtons />
		</>
	);
}

function CreateEventForm({ event, variant, contextSelection, onSuccess }: CreateEventFormProps) {
	const [selection, setSelection] = React.useState<ContextSelection | undefined>(contextSelection);
	const clubs = useClub().clubs;

	const showContextSelector = selection === undefined && clubs && clubs.length > 0;

	const variants = {
		default: "relative bg-card/50 border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-lg",
		embedded: "bg-transparent border-0 p-0 shadow-none",
	};

	const containerClasses = variants[variant || "default"];

	return (
		<EventFormProvider event={event} contextSelection={selection} onSuccess={onSuccess}>
			<div className="w-full max-w-3xl mx-auto py-4 sm:py-8 px-2 sm:px-4 text-foreground" data-testid="create-event-form">
				{/* Header */}
				{variant !== "embedded" && (
					<div className="mb-6 sm:mb-10 text-center">
						<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">{event ? "Edit Event" : "Create a New Event"}</h1>
						<p className="text-muted text-sm sm:text-lg">Set up your volleyball game, practice, or tournament.</p>
					</div>
				)}

				{/* Stepper */}
				{!showContextSelector && variant != "embedded" && <ProgressIndicator />}

				{/* Form Card */}
				<div className={containerClasses}>
					{/* Decorative Gradient Blob */}
					<div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/15 rounded-full blur-[100px] pointer-events-none" />
					{!showContextSelector ? (
						<CreateEventFormContent onChageContext={() => setSelection(undefined)} onClearContext={() => setSelection(null)} />
					) : (
						<ContextSelector clubs={clubs} onSelect={(sel) => setSelection(sel)} />
					)}
				</div>
			</div>
		</EventFormProvider>
	);
}

type CreateEventFormProps = {
	event?: Event;
	variant?: "default" | "embedded";
	contextSelection?: ContextSelection;
	onSuccess?: () => void;
} & React.PropsWithChildren;

export default CreateEventForm;
