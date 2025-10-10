import { cookies } from "next/headers";
import { Event, EventFilterRequest } from "../models/Event";
import { EVENTS_API_V1 } from "../constants";
import { BalanceAmount } from "../models/Payment";

export const getEventsByFilter = async (
	filter?: EventFilterRequest,
): Promise<Event[] | null> => {
	const cookieStore = cookies();
	const token = (await cookieStore).get("token")?.value;

	if (!token) {
		console.log("getEventsByFilter - no token found");
		return null;
	}

	// Build query parameters
	const params = new URLSearchParams();
	if (filter?.status) params.append("status", filter.status);
	if (filter?.page) params.append("page", filter.page.toString());
	if (filter?.limit) params.append("limit", filter.limit.toString());
	if (filter?.sortBy) params.append("sortBy", filter.sortBy);
	if (filter?.sortOrder) params.append("sortOrder", filter.sortOrder);
	if (filter?.type !== undefined) params.append("type", filter.type.toString());
	if (filter?.surface !== undefined)
		params.append("surface", filter.surface.toString());
	if (filter?.from) params.append("from", filter.from.toISOString());
	if (filter?.to) params.append("to", filter.to.toISOString());
	if (filter?.organizerId) params.append("organizerId", filter.organizerId);
	if (filter?.participantId)
		params.append("participantId", filter.participantId);

	const queryString = params.toString();
	const backendUrl = `${EVENTS_API_V1}/events${queryString ? `?${queryString}` : ""}`;

	const fetchOptions: RequestInit = {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		cache: "no-store",
	};

	try {
		const response = await fetch(backendUrl, fetchOptions);

		if (response.ok) {
			const data = await response.json();
			return data;
		} else if (response.status === 401 || response.status === 403) {
			console.log("getEventsByAdmin - unauthorized");
			return null;
		} else {
			console.error("Error fetching events:", response.statusText);
			return null;
		}
	} catch (error) {
		console.error("Error fetching events:", error);
		return null;
	}
};

export const getOutstandingBalance =
	async (): Promise<BalanceAmount | null> => {
		const cookieStore = cookies();
		const token = (await cookieStore).get("token")?.value;
		console.log("Fetching outstanding balance...");
		if (!token) {
			console.log("getOutstandingBalance - no token found");
			return null;
		}

		// Build query parameters

		const backendUrl = `${EVENTS_API_V1}/audit/balance/outstanding`;

		const fetchOptions: RequestInit = {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			cache: "no-store",
		};

		try {
			console.log("Making request to:", backendUrl);
			const response = await fetch(backendUrl, fetchOptions);
			console.log("Response status:", response.status);
			if (response.ok) {
				const data = await response.json();
				console.log("Outstanding balance data:", data);
				return data;
			} else if (response.status === 401 || response.status === 403) {
				console.log("getOutstandingBalance - unauthorized");
				return null;
			} else {
				console.error(
					"Error fetching Outstanding Balance:",
					response.statusText,
				);
				return null;
			}
		} catch (error) {
			console.error("Error fetching Outstanding Balance:", error);
			return null;
		}
	};
