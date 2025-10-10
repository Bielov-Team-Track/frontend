import React from "react";
import CreateEventForm from "@/components/features/events/forms/CreateEventForm";

function AdminCreateEventPage() {
	return (
		<div className="max-w-3xl mx-auto p-4">
			<CreateEventForm locations={[]} />
		</div>
	);
}

export default AdminCreateEventPage;
