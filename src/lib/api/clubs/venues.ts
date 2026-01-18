import client from "@/lib/api/client";
import { CLUBS_API_V1 } from "@/lib/constants";
import { CreateVenueRequest, UpdateVenueRequest, Venue } from "@/lib/models/Club";

export async function getVenues(clubId: string): Promise<Venue[]> {
	const endpoint = "/clubs/" + clubId + "/venues";
	return (await client.get<Venue[]>(CLUBS_API_V1 + endpoint)).data;
}

export async function createVenue(data: CreateVenueRequest): Promise<Venue> {
	const endpoint = "/venues";
	return (await client.post<Venue>(CLUBS_API_V1 + endpoint, data)).data;
}

export async function updateVenue(id: string, data: Partial<UpdateVenueRequest>): Promise<Venue> {
	const endpoint = `/venues/${id}`;
	return (await client.put<Venue>(CLUBS_API_V1 + endpoint, data)).data;
}

export async function deleteVenue(id: string): Promise<void> {
	const endpoint = `/venues/${id}`;

	await client.delete(CLUBS_API_V1 + endpoint);
}
