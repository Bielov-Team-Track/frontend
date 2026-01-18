"use client";

import { Input, Select, TextArea } from "@/components/ui";
import { SelectOption } from "@/components/ui/select/index";
import { EventType, PlayingSurface } from "@/lib/models/Event";
import { Controller } from "react-hook-form";
import { WizardStepProps } from "../../core/types";
import { EventFormData } from "../types";

const eventTypeOptions: SelectOption[] = [
	{ value: EventType.CasualPlay, label: "Casual Play" },
	{ value: EventType.TrainingSession, label: "Training Session" },
	{ value: EventType.Tournament, label: "Tournament" },
	{ value: EventType.Match, label: "Match" },
];

const surfaceOptions: SelectOption[] = [
	{ value: PlayingSurface.Indoor, label: "Indoor" },
	{ value: PlayingSurface.Beach, label: "Beach" },
	{ value: PlayingSurface.Grass, label: "Grass" },
];

export function EventDetailsStep({ form }: WizardStepProps<EventFormData>) {
	const {
		register,
		control,
		formState: { errors },
	} = form;

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-foreground mb-1">Event Details</h2>
				<p className="text-muted-foreground text-sm">Tell us about your event.</p>
			</div>

			<div className="space-y-4">
				<Input label="Event Name" placeholder="e.g., Saturday Beach Volleyball" error={errors.name?.message} required {...register("name")} />

				<Controller
					name="type"
					control={control}
					render={({ field }) => (
						<Select
							label="Event Type"
							options={eventTypeOptions}
							value={field.value}
							onChange={field.onChange}
							error={errors.type?.message}
							required
						/>
					)}
				/>

				<Controller
					name="surface"
					control={control}
					render={({ field }) => (
						<Select
							label="Playing Surface"
							options={surfaceOptions}
							value={field.value}
							onChange={field.onChange}
							error={errors.surface?.message}
							required
						/>
					)}
				/>

				<TextArea label="Description" placeholder="Describe your event..." rows={3} optional {...register("description")} />
			</div>
		</div>
	);
}
