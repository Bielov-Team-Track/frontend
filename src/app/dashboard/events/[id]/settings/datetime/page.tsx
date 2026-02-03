"use client";

import {
	DateTimeSection,
	EventSettingsForm,
} from "@/components/features/events/settings";
import { useEventContext } from "../../layout";

export default function EventDateTimeSettingsPage() {
	const { event } = useEventContext();

	if (!event) return null;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-xl font-bold text-white">Date & Time</h2>
				<p className="text-sm text-muted">When will your event take place?</p>
			</div>

			<EventSettingsForm event={event}>
				<DateTimeSection event={event} />
			</EventSettingsForm>
		</div>
	);
}
