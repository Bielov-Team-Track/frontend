"use client";

import { Input } from "@/components/ui";
import { Event } from "@/lib/models/Event";
import { getDuration } from "@/lib/utils/date";
import { Calendar, Clock, Info } from "lucide-react";
import { useEventSettingsContext } from "../EventSettingsContext";
import { SettingsSection } from "./SettingsSection";

interface DateTimeSectionProps {
	event: Event;
}

export function DateTimeSection({ event }: DateTimeSectionProps) {
	const { formData, updateField } = useEventSettingsContext();

	const isSeriesEvent = !!event.seriesId;

	// Format date for datetime-local input
	const formatForInput = (date: Date) => {
		const d = new Date(date);
		return d.toISOString().slice(0, 16);
	};

	// Calculate duration
	const duration =
		formData.startTime && formData.endTime
			? getDuration(new Date(formData.startTime), new Date(formData.endTime))
			: null;

	return (
		<SettingsSection title="Date & Time" description="When will your event take place?">
			{isSeriesEvent && (
				<div className="flex items-start gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
					<Info size={18} className="text-accent mt-0.5 shrink-0" />
					<div>
						<p className="text-sm font-medium text-white">
							Part of recurring series (Occurrence #{event.seriesOccurrenceNumber})
						</p>
						<p className="text-xs text-muted mt-1">
							Changes to date/time can affect other events in this series. You&apos;ll be
							asked how to apply changes when you save.
						</p>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Input
					type="datetime-local"
					label="Start Date & Time"
					leftIcon={<Calendar size={16} />}
					value={formatForInput(formData.startTime)}
					onChange={(e) => updateField("startTime", new Date(e.target.value))}
					required
				/>

				<Input
					type="datetime-local"
					label="End Date & Time"
					leftIcon={<Calendar size={16} />}
					value={formatForInput(formData.endTime)}
					onChange={(e) => updateField("endTime", new Date(e.target.value))}
					required
				/>
			</div>

			{duration && (
				<div className="p-4 rounded-xl bg-white/5 border border-white/10">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
							<Clock size={16} className="text-accent" />
						</div>
						<div>
							<span className="text-xs text-muted uppercase tracking-wider block">
								Duration
							</span>
							<span className="text-white font-medium">{duration}</span>
						</div>
					</div>
				</div>
			)}
		</SettingsSection>
	);
}
