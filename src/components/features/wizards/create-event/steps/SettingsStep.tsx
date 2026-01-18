"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EventFormat } from "@/lib/models/Event";
import { Unit } from "@/lib/models/EventBudget";
import { Controller } from "react-hook-form";
import { WizardStepProps } from "../../core/types";
import { EventFormData } from "../types";

const formatOptions = [
	{ value: EventFormat.Open, label: "Open (no teams)" },
	{ value: EventFormat.TeamsWithPositions, label: "Teams with Positions" },
	{ value: EventFormat.TeamsWithoutPositions, label: "Teams without Positions" },
];

const unitOptions = [
	{ value: Unit.Individual, label: "Individual" },
	{ value: Unit.Team, label: "Team" },
];

export function SettingsStep({ form }: WizardStepProps<EventFormData>) {
	const {
		register,
		control,
		watch,
		formState: { errors },
	} = form;
	const eventFormat = watch("eventFormat");

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-foreground mb-1">Event Settings</h2>
				<p className="text-muted-foreground text-sm">Configure how your event works.</p>
			</div>

			<div className="space-y-4">
				<Controller
					name="eventFormat"
					control={control}
					render={({ field }) => <Select label="Event Format" options={formatOptions} value={field.value} onChange={field.onChange} required />}
				/>

				{eventFormat !== EventFormat.Open && (
					<Input
						type="number"
						label="Number of Teams"
						min={1}
						error={errors.teamsNumber?.message}
						{...register("teamsNumber", { valueAsNumber: true })}
					/>
				)}

				<Input
					type="number"
					label="Number of Courts"
					min={1}
					error={errors.courtsNumber?.message}
					required
					{...register("courtsNumber", { valueAsNumber: true })}
				/>

				<Input
					type="number"
					label="Max Capacity"
					placeholder="Leave empty for unlimited"
					min={1}
					optional
					{...register("capacity", { valueAsNumber: true })}
				/>

				<div className="space-y-3 pt-2">
					<Controller
						name="isPrivate"
						control={control}
						render={({ field }) => (
							<Checkbox
								checked={field.value}
								onChange={field.onChange}
								label="Public Event"
								helperText="Non-members can see this event and search for it."
							/>
						)}
					/>
				</div>
			</div>
		</div>
	);
}
