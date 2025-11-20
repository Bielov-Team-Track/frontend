import client from "../client";
import { AuthData } from "../models/Auth";
import { PositionPayment } from "../models/Position";
import {
	BaseUser,
	GoogleUserCreate,
	Suspension,
	UserProfile,
} from "../models/User";
import { AuthResponse } from "./auth";

const PREFIX = "/profiles/v1";

export async function getUserProfile(userId: string) {
	const endpoint = `/users/${userId}`;

	try {
		return (await client.get<UserProfile>(PREFIX + endpoint)).data;
	} catch (error: any) {
		if (error.response.status == 404) {
			return undefined;
		}

		throw error;
	}
}
export async function getUserPositionPayments(userId: string) {
	const endpoint = `/users/${userId}/positionPayments`;

	return (await client.get<PositionPayment[]>(PREFIX + endpoint)).data;
}

export async function getSuspension(
	eventId: string,
	userId: string
): Promise<Suspension> {
	const endpoint = `/users/${userId}/events/${eventId}/suspension`;

	return (await client.get<Suspension>(PREFIX + endpoint)).data;
}

export async function updateUserProfile(user: UserProfile) {
	const endpoint = `/users/`;

	return (await client.put<UserProfile>(PREFIX + endpoint, user)).data;
}

export async function createUser(user: BaseUser) {
	const endpoint = "/auth/register";

	return (await client.post<AuthData>(PREFIX + endpoint, user)).data;
}

export async function createGoogleUser(user: GoogleUserCreate) {
	const endpoint = "/auth/register/google";

	return (await client.post<AuthResponse>(PREFIX + endpoint, user)).data;
}

export async function saveGoogleUser(user: GoogleUserCreate) {
	const endpoint = "/users/google";

	return (await client.put<AuthResponse>(PREFIX + endpoint, user)).data;
}

export async function updateProfileImage(image: Blob): Promise<string> {
	// Step 1: Get presigned URL from backend
	const fileType = image.type; // e.g., "image/jpeg", "image/png"
	const getUploadUrlEndpoint = `/v1/profiles/me/profile-image-upload-url?fileType=${encodeURIComponent(
		fileType
	)}`;

	const response = await client.get(PREFIX + getUploadUrlEndpoint);
	const presignedUrl = response.data;

	// Step 2: Upload directly to S3 using presigned URL
	const uploadResponse = await fetch(presignedUrl, {
		method: "PUT",
		body: image,
		headers: {
			"Content-Type": fileType,
		},
	});

	if (!uploadResponse.ok) {
		throw new Error("Failed to upload image");
	}

	// Step 3: Extract the public URL (remove query parameters from presigned URL)
	const imageUrl = presignedUrl.split("?")[0];
	return imageUrl;
}

export async function followUser(userId: string) {
	const endpoint = `/users/${userId}/follow`;

	return await client.post(PREFIX + endpoint);
}

export async function unfollowUser(userId: string) {
	const endpoint = `/users/${userId}/unfollow`;

	return await client.post(PREFIX + endpoint);
}

export async function searchUsers(query: string): Promise<UserProfile[]> {
	const processedQuery = encodeURIComponent(query.trim());

	const endpoint = `/profiles?query=${processedQuery}`;

	return (await client.get<UserProfile[]>(PREFIX + endpoint)).data;
}
