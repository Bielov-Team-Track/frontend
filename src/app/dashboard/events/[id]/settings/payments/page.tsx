"use client";

import {
	EventSettingsForm,
	PaymentsSection,
} from "@/components/features/events/settings";
import { useEventContext } from "../../layout";

export default function EventPaymentsSettingsPage() {
	const { event } = useEventContext();

	if (!event) return null;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-xl font-bold text-white">Payments</h2>
				<p className="text-sm text-muted">Configure event pricing and budget</p>
			</div>

			<EventSettingsForm event={event}>
				<PaymentsSection />
			</EventSettingsForm>
		</div>
	);
}
