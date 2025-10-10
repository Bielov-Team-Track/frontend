import { cookies } from "next/headers";
import { EVENTS_API_V1 } from "../constants";

export const getUserProfile = async () => {
	const cookieStore = cookies();
	console.log("cookieStore:", cookieStore);
	const token = (await cookieStore).get("token")?.value;

	// If no token, return null to indicate unauthenticated
	if (!token) {
		console.log("getUserProfile - no token found");
		return null;
	}

	const backendUrl = `${EVENTS_API_V1}/profiles/me`;

	const fetchOptions: RequestInit = {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		cache: "no-store", // Ensure we always get fresh data
	};

	try {
		console.log("getUserProfile - making request to:", backendUrl);
		const response = await fetch(backendUrl, fetchOptions);
		console.log("getUserProfile - response status:", response.status);

		if (response.ok) {
			const userData = await response.json();
			console.log("getUserProfile - success:", userData);
			return userData;
		} else if (response.status === 401 || response.status === 403) {
			// Token is invalid, return null to indicate unauthenticated
			console.log("getUserProfile - unauthorized");
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

export const requireAuth = async () => {
	const user = await getUserProfile();

	// if (!user) {
	//   redirect("/login");
	// }

	return user;
};
