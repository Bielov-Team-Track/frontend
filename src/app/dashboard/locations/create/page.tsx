import React, { useState } from "react";
import LocationForm from "@/components/features/locations/forms/LocationForm";
import BackButton from "@/components/ui/back-button";

function AdminLocationsCreatePage() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex">
				<BackButton />
				<h2 className="text-center w-full">Create Location</h2>
			</div>
			<LocationForm />
		</div>
	);
}

export default AdminLocationsCreatePage;
