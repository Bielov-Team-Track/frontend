"use client";

import { redirect, useParams } from "next/navigation";

export default function EventSettingsPage() {
	const params = useParams();
	const eventId = params.id as string;

	// Redirect to general settings
	redirect(`/dashboard/events/${eventId}/prototype/settings/general`);
}
