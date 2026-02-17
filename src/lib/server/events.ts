import { cookies } from "next/headers";
import { EVENTS_API_V1 } from "../constants";
import { Event, EventFilterRequest } from "../models/Event";
import { PaginatedResponse } from "../models/Pagination";
import { getParamsFromObject } from "../utils/request";

/**
 * Server-side function to load events with authentication.
 * Uses Next.js cookies() to get the auth token.
 */
export async function loadEventsByFilterServer(
	filter?: EventFilterRequest
): Promise<Event[]> {
	const cookieStore = cookies();
	const token = (await cookieStore).get("token")?.value;

	if (!token) {
		return [];
	}

	const params = getParamsFromObject(filter as Record<string, unknown> | undefined);
	const queryString = params ? `?${params.toString()}` : "";
	const url = `${EVENTS_API_V1}/events${queryString}`;

	const fetchOptions: RequestInit = {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		cache: "no-store",
	};

	try {
		const response = await fetch(url, fetchOptions);

		if (response.ok) {
			const data: PaginatedResponse<Event> = await response.json();
			return data.items;
		} else if (response.status === 401 || response.status === 403) {
			return [];
		} else {
			console.error("Error fetching events:", response.statusText);
			return [];
		}
	} catch (error) {
		console.error("Error fetching events:", error);
		return [];
	}
}
