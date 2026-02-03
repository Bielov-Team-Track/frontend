"use client";

import {
	EventSettingsForm,
	RegistrationSection,
} from "@/components/features/events/settings";
import { useEventContext } from "../../layout";

export default function EventRegistrationSettingsPage() {
	const { event } = useEventContext();

	if (!event) return null;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-xl font-bold text-white">Registration</h2>
				<p className="text-sm text-muted">Configure how participants can join</p>
			</div>

			<EventSettingsForm event={event}>
				<RegistrationSection />
			</EventSettingsForm>
		</div>
	);
}
