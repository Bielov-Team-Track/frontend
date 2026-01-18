"use client";

import { Input } from "@/components/ui/input";
import { WizardStepProps } from "../../core/types";
import { EventFormData } from "../types";

export function TimeAndDateStep({ form }: WizardStepProps<EventFormData>) {
	const {
		register,
		formState: { errors },
		watch,
		setValue,
	} = form;

	// Format dates for datetime-local input
	const formatDateTimeLocal = (date: Date | undefined) => {
		if (!date) return "";
		const d = new Date(date);
		return d.toISOString().slice(0, 16);
	};

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-foreground mb-1">Time & Date</h2>
				<p className="text-muted-foreground text-sm">When will your event take place?</p>
			</div>

			<div className="space-y-4">
				<Input type="datetime-local" label="Start Time" error={errors.startTime?.message} required {...register("startTime")} />

				<Input type="datetime-local" label="End Time" error={errors.endTime?.message} required {...register("endTime")} />
			</div>
		</div>
	);
}
