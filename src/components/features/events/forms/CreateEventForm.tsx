"use client";

import { Loader } from "@/components/ui";
import { Club, Group, Team } from "@/lib/models/Club";
import { Event } from "@/lib/models/Event";
import { useClub } from "@/providers";
import React from "react";
import { ContextIndicator } from "./components/ContextIndicator";
import ContextSelector from "./components/ContextSelector";
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
			{isPending && <Loader className="absolute inset-0 bg-black/60 rounded-3xl z-50" />}

			{isError && (
				<div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg mb-6">
					<p className="font-medium">Something went wrong</p>
					<p className="text-sm opacity-80">We&apos;re working on it. Please try again.</p>
				</div>
			)}

			<div className="relative z-10 flex-1">
				<StepRenderer />
			</div>
			<ContextIndicator context={context} onChange={onChageContext} onClear={onClearContext} />
			<NavigationButtons />
		</>
	);
}

function CreateEventForm({ event, variant, context }: CreateEventFormProps) {
	const [defaultContext, setDefaultContext] = React.useState<Club | Group | Team | null | undefined>(context);
	const clubs = useClub().clubs;

	const showContextSelector = defaultContext === undefined && clubs && clubs.length > 0;

	const variants = {
		default: "relative bg-card/50 border border-white/10 rounded-3xl p-8 shadow-lg",
		embedded: "bg-transparent border-0 p-0 shadow-none",
	};

	const containerClasses = variants[variant || "default"];

	return (
		<EventFormProvider event={event} context={defaultContext}>
			<div className="w-full max-w-3xl mx-auto py-8 px-4 text-white">
				{/* Header */}
				{variant !== "embedded" && (
					<div className="mb-10 text-center">
						<h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">{event ? "Edit Event" : "Create a New Event"}</h1>
						<p className="text-muted text-lg">Set up your volleyball game, practice, or tournament.</p>
					</div>
				)}

				{/* Stepper */}
				{!showContextSelector && variant != "embedded" && <ProgressIndicator />}

				{/* Form Card */}
				<div className={containerClasses}>
					{/* Decorative Gradient Blob */}
					<div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/15 rounded-full blur-[100px] pointer-events-none" />
					{!showContextSelector ? (
						<CreateEventFormContent onChageContext={() => setDefaultContext(undefined)} onClearContext={() => setDefaultContext(null)} />
					) : (
						<ContextSelector clubs={clubs} onSelect={(ctx) => setDefaultContext(ctx)} />
					)}
				</div>
			</div>
		</EventFormProvider>
	);
}

type CreateEventFormProps = {
	event?: Event;
	availalbeClubs?: Club[];
	variant?: "default" | "embedded";
	context?: Club | Group | Team | undefined;
} & React.PropsWithChildren;

export default CreateEventForm;
