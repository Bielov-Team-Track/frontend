"use client";

import {
	EventSettingsForm,
	GeneralSection,
} from "@/components/features/events/settings";
import { useEventContext } from "../../layout";

export default function EventGeneralSettingsPage() {
	const { event } = useEventContext();

	if (!event) return null;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-xl font-bold text-white">General Settings</h2>
				<p className="text-sm text-muted">Basic event information</p>
			</div>

			<EventSettingsForm event={event}>
				<GeneralSection />
			</EventSettingsForm>
		</div>
	);
}
