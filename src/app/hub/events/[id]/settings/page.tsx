"use client";

import { redirect, useParams } from "next/navigation";

export default function EventSettingsPage() {
	const params = useParams();
	const eventId = params.id as string;

	// Redirect to general settings
	redirect(`/hub/events/${eventId}/settings/general`);
}
