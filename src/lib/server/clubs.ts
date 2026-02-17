import { cookies } from "next/headers";
import { CLUBS_API_V1 } from "../constants";
import { Club, ClubMember, ClubRole } from "../models/Club";

/**
 * Server-side function to get user's clubs with authentication.
 * Uses Next.js cookies() to get the auth token.
 */
export async function getUserClubsServer(userId: string): Promise<Club[]> {
	const cookieStore = cookies();
	const token = (await cookieStore).get("token")?.value;

	if (!token) {
		return [];
	}

	const url = `${CLUBS_API_V1}/clubs/users/${userId}/clubs?limit=100`;

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
			const result = await response.json();
			return result.items ?? result;
		} else if (response.status === 401 || response.status === 403) {
			return [];
		} else {
			console.error("Error fetching user clubs:", response.statusText);
			return [];
		}
	} catch (error) {
		console.error("Error fetching user clubs:", error);
		return [];
	}
}

/**
 * Server-side function to get club members with authentication.
 */
export async function getClubMembersServer(clubId: string): Promise<ClubMember[]> {
	const cookieStore = cookies();
	const token = (await cookieStore).get("token")?.value;

	if (!token) {
		return [];
	}

	const url = `${CLUBS_API_V1}/clubs/${clubId}/members`;

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
			return await response.json();
		} else {
			return [];
		}
	} catch (error) {
		console.error("Error fetching club members:", error);
		return [];
	}
}

/**
 * Get user's roles in a specific club
 */
export async function getUserRolesInClub(clubId: string, userId: string): Promise<ClubRole[]> {
	const members = await getClubMembersServer(clubId);
	const userMember = members.find((m) => m.userId === userId);
	return userMember?.roles || [];
}
