import { Location } from "@/lib/models/Event";

export function parseAddressComponents(
	place: google.maps.places.PlaceResult,
): Partial<Location> {
	const components = place.address_components || [];
	const locationData: Partial<Location> = {
		name: place.name || "",
	};

	components.forEach((component) => {
		const types = component.types;
		const longName = component.long_name;

		if (types.includes("street_number")) {
			locationData.address =
				longName + (locationData.address ? " " + locationData.address : "");
		} else if (types.includes("route")) {
			locationData.address =
				(locationData.address ? locationData.address + " " : "") + longName;
		} else if (types.includes("locality")) {
			locationData.city = longName;
		} else if (types.includes("country")) {
			locationData.country = longName;
		} else if (types.includes("postal_code")) {
			locationData.postalCode = longName;
		}
	});

	// Set coordinates if available
	if (place.geometry?.location) {
		locationData.latitude = place.geometry.location.lat();
		locationData.longitude = place.geometry.location.lng();
	}

	return locationData;
}
