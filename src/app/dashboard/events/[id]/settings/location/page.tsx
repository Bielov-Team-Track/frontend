"use client";

import {
	EventSettingsForm,
	LocationSection,
} from "@/components/features/events/settings";
import { useEventContext } from "../../layout";

export default function EventLocationSettingsPage() {
	const { event } = useEventContext();

	if (!event) return null;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-xl font-bold text-white">Location</h2>
				<p className="text-sm text-muted">Where will your event take place?</p>
			</div>

			<EventSettingsForm event={event}>
				<LocationSection />
			</EventSettingsForm>
		</div>
	);
}
