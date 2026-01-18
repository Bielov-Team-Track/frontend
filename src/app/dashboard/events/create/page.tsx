"use client";

import CreateEventForm from "@/components/features/events/forms/CreateEventForm";
import { useClub } from "@/providers";

function AdminCreateEventPage() {
	const clubs = useClub().clubs; // Placeholder for clubs data
	console.log("Available clubs for event creation:", clubs);
	return (
		<div className="max-w-3xl mx-auto p-4">
			<CreateEventForm availalbeClubs={clubs} />
		</div>
	);
}

export default AdminCreateEventPage;
