/**
 * Shared address parsing utilities for Google Maps/Places API
 */

export interface ParsedAddress {
	formattedAddress: string;
	streetNumber?: string;
	route?: string;
	addressName?: string;
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	state?: string;
	county?: string;
	country?: string;
	countryCode?: string;
	postalCode?: string;
	latitude?: number;
	longitude?: number;
}

function getAddressComponent(
	components: google.maps.GeocoderAddressComponent[] | undefined,
	type: string
): string | undefined {
	if (!components) return undefined;
	const component = components.find((c) => c.types.includes(type));
	return component?.long_name;
}

function getAddressComponentShort(
	components: google.maps.GeocoderAddressComponent[] | undefined,
	type: string
): string | undefined {
	if (!components) return undefined;
	const component = components.find((c) => c.types.includes(type));
	return component?.short_name;
}

/**
 * Parse address components from Google Maps Geocoder result
 */
export function parseGeocoderResult(result: google.maps.GeocoderResult): ParsedAddress {
	const components = result.address_components;

	const streetNumber = getAddressComponent(components, "street_number");
	const route = getAddressComponent(components, "route");
	const subpremise = getAddressComponent(components, "subpremise");
	const premise = getAddressComponent(components, "premise");

	// Build address line 1: street number + route
	const addressLine1 = [streetNumber, route].filter(Boolean).join(" ") || undefined;

	// Address line 2: subpremise or premise (apartment, suite, floor, etc.)
	const addressLine2 = subpremise || premise || undefined;

	// City: try locality first, then postal_town (UK), then sublocality
	const city =
		getAddressComponent(components, "locality") ||
		getAddressComponent(components, "postal_town") ||
		getAddressComponent(components, "sublocality_level_1");

	// State/Region
	const state = getAddressComponent(components, "administrative_area_level_1");

	// County
	const county = getAddressComponent(components, "administrative_area_level_2");

	// Country
	const country = getAddressComponent(components, "country");
	const countryCode = getAddressComponentShort(components, "country");

	// Postal code
	const postalCode = getAddressComponent(components, "postal_code");

	// Coordinates
	const latitude = result.geometry?.location?.lat();
	const longitude = result.geometry?.location?.lng();

	// Try to get a meaningful name (point of interest, establishment, etc.)
	const addressName =
		getAddressComponent(components, "point_of_interest") ||
		getAddressComponent(components, "establishment") ||
		getAddressComponent(components, "premise") ||
		addressLine1;

	return {
		formattedAddress: result.formatted_address || "",
		addressName,
		streetNumber,
		route,
		addressLine1,
		addressLine2,
		city,
		state,
		county,
		country,
		countryCode,
		postalCode,
		latitude,
		longitude,
	};
}

/**
 * Parse address components from Google Places API result
 */
export function parsePlacesResult(place: google.maps.places.PlaceResult): ParsedAddress {
	const components = place.address_components;

	const addressName = place.name;
	const streetNumber = getAddressComponent(components, "street_number");
	const route = getAddressComponent(components, "route");
	const subpremise = getAddressComponent(components, "subpremise");
	const premise = getAddressComponent(components, "premise");

	// Build address line 1: street number + route
	const addressLine1 = [streetNumber, route].filter(Boolean).join(" ") || undefined;

	// Address line 2: subpremise or premise (apartment, suite, floor, etc.)
	const addressLine2 = subpremise || premise || undefined;

	// City: try locality first, then postal_town (UK), then sublocality
	const city =
		getAddressComponent(components, "locality") ||
		getAddressComponent(components, "postal_town") ||
		getAddressComponent(components, "sublocality_level_1");

	// State/Region
	const state = getAddressComponent(components, "administrative_area_level_1");

	// County
	const county = getAddressComponent(components, "administrative_area_level_2");

	// Country
	const country = getAddressComponent(components, "country");
	const countryCode = getAddressComponentShort(components, "country");

	// Postal code
	const postalCode = getAddressComponent(components, "postal_code");

	// Coordinates
	const latitude = place.geometry?.location?.lat();
	const longitude = place.geometry?.location?.lng();

	return {
		formattedAddress: place.formatted_address || "",
		addressName,
		streetNumber,
		route,
		addressLine1,
		addressLine2,
		city,
		state,
		county,
		country,
		countryCode,
		postalCode,
		latitude,
		longitude,
	};
}
