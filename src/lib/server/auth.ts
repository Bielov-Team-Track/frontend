import { cookies } from "next/headers";
import { PROFILES_API_V1 } from "../constants";

export const getUserProfile = async () => {
	const cookieStore = cookies();
	const token = (await cookieStore).get("token")?.value;

	// If no token, return null to indicate unauthenticated
	if (!token) {
		return null;
	}

	const backendUrl = `${PROFILES_API_V1}/profiles/me`;

	const fetchOptions: RequestInit = {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		cache: "no-store", // Ensure we always get fresh data
	};

	try {
		const response = await fetch(backendUrl, fetchOptions);

		if (response.ok) {
			const userData = await response.json();
			return userData;
		} else if (response.status === 401 || response.status === 403) {
			// Token is invalid, return null to indicate unauthenticated
			return null;
		} else {
			console.error("Error fetching user profile:", response.statusText);
			return null;
		}
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return null;
	}
};

// Fetch full profile with player, coach, and history data
export const getFullUserProfile = async () => {
	const cookieStore = cookies();
	const token = (await cookieStore).get("token")?.value;

	if (!token) {
		return null;
	}

	const fetchOptions: RequestInit = {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		cache: "no-store",
	};

	try {
		// Fetch all profile data in parallel
		const [profileRes, playerRes, coachRes, historyRes] = await Promise.all([
			fetch(`${PROFILES_API_V1}/profiles/me`, fetchOptions),
			fetch(`${PROFILES_API_V1}/profiles/me/player`, fetchOptions).catch(() => null),
			fetch(`${PROFILES_API_V1}/profiles/me/coach`, fetchOptions).catch(() => null),
			fetch(`${PROFILES_API_V1}/profiles/me/history`, fetchOptions).catch(() => null),
		]);

		if (!profileRes.ok) {
			if (profileRes.status === 401 || profileRes.status === 403) {
				return null;
			}
			console.error("Error fetching user profile:", profileRes.statusText);
			return null;
		}

		const profile = await profileRes.json();
		const playerProfile = playerRes?.ok ? await playerRes.json() : undefined;
		const coachProfile = coachRes?.ok ? await coachRes.json() : undefined;
		const historyEntries = historyRes?.ok ? await historyRes.json() : [];

		return {
			...profile,
			playerProfile,
			coachProfile,
			historyEntries,
		};
	} catch (error) {
		console.error("Error fetching full user profile:", error);
		return null;
	}
};

export const requireAuth = async () => {
	const user = await getUserProfile();

	// if (!user) {
	//   redirect("/login");
	// }

	return user;
};
