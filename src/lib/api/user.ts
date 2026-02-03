import { CursorRequest, QueryRequest, SortRequest } from "@/lib/models/filteringAndPagination";
import { AxiosError } from "axios";
import { AuthData } from "../models/Auth";
import { CursorPagedResult } from "../models/Pagination";
import { PositionPayment } from "../models/Position";
import {
	CoachProfileDto,
	CreateHistoryDto,
	CreateOrUpdateCoachProfileDto,
	CreateOrUpdatePlayerProfileDto,
	CreateOrUpdateUserProfileDto,
	FullProfileDto,
	HistoryDto,
	PlayerProfileDto,
	UpdateHistoryDto,
	UpdateProfileDto,
} from "../models/Profile";
import { BaseUser, GoogleUserCreate, Suspension, UserProfile } from "../models/User";
import { AuthResponse } from "./auth";
import client from "./client";

const PREFIX = "/profiles/v1";

// ==================== Basic Profile ====================

export async function getUserProfile(userId: string): Promise<UserProfile | undefined> {
	const endpoint = `/profiles/${userId}`;

	try {
		return (await client.get<UserProfile>(PREFIX + endpoint)).data;
	} catch (error) {
		if (error instanceof AxiosError && error.response?.status === 404) {
			return undefined;
		}
		throw error;
	}
}

export async function getFullUserProfile(userId: string): Promise<FullProfileDto | undefined> {
	try {
		// Fetch all profile data in parallel
		const [userProfile, playerProfile, coachProfile, history] = await Promise.all([
			getUserProfile(userId),
			getPlayerProfile(userId).catch(() => undefined),
			getCoachProfile(userId).catch(() => undefined),
			getUserHistory(userId).catch(() => []),
		]);

		if (!userProfile) return undefined;

		return {
			userProfile,
			playerProfile,
			coachProfile,
			historyEntries: history,
		};
	} catch (error) {
		if (error instanceof AxiosError && error.response?.status === 404) {
			return undefined;
		}
		throw error;
	}
}

export async function getCurrentUserProfile(): Promise<UserProfile> {
	const endpoint = `/profiles/me`;
	return (await client.get<UserProfile>(PREFIX + endpoint)).data;
}

export async function updateCurrentProfile(data: UpdateProfileDto): Promise<UserProfile> {
	const endpoint = `/profiles/me`;
	return (await client.put<UserProfile>(PREFIX + endpoint, data)).data;
}

// ==================== Player Profile ====================

export async function getCurrentPlayerProfile(): Promise<PlayerProfileDto | undefined> {
	const endpoint = `/profiles/me/player`;
	try {
		return (await client.get<PlayerProfileDto>(PREFIX + endpoint)).data;
	} catch (error) {
		if (error instanceof AxiosError && error.response?.status === 404) {
			return undefined;
		}
		throw error;
	}
}

export async function getPlayerProfile(userId: string): Promise<PlayerProfileDto | undefined> {
	const endpoint = `/profiles/${userId}/player`;
	try {
		return (await client.get<PlayerProfileDto>(PREFIX + endpoint)).data;
	} catch (error) {
		if (error instanceof AxiosError && error.response?.status === 404) {
			return undefined;
		}
		throw error;
	}
}

export async function createOrUpdatePlayerProfile(data: CreateOrUpdatePlayerProfileDto): Promise<PlayerProfileDto> {
	const endpoint = `/profiles/me/player`;
	return (await client.put<PlayerProfileDto>(PREFIX + endpoint, data)).data;
}

export async function deletePlayerProfile(): Promise<void> {
	const endpoint = `/profiles/me/player`;
	await client.delete(PREFIX + endpoint);
}

// ==================== Coach Profile ====================

export async function getCurrentCoachProfile(): Promise<CoachProfileDto | undefined> {
	const endpoint = `/profiles/me/coach`;
	try {
		return (await client.get<CoachProfileDto>(PREFIX + endpoint)).data;
	} catch (error) {
		if (error instanceof AxiosError && error.response?.status === 404) {
			return undefined;
		}
		throw error;
	}
}

export async function getCoachProfile(userId: string): Promise<CoachProfileDto | undefined> {
	const endpoint = `/profiles/${userId}/coach`;
	try {
		return (await client.get<CoachProfileDto>(PREFIX + endpoint)).data;
	} catch (error) {
		if (error instanceof AxiosError && error.response?.status === 404) {
			return undefined;
		}
		throw error;
	}
}

export async function createOrUpdateCoachProfile(data: CreateOrUpdateCoachProfileDto): Promise<CoachProfileDto> {
	const endpoint = `/profiles/me/coach`;
	return (await client.put<CoachProfileDto>(PREFIX + endpoint, data)).data;
}

export async function deleteCoachProfile(): Promise<void> {
	const endpoint = `/profiles/me/coach`;
	await client.delete(PREFIX + endpoint);
}

// ==================== History ====================

export async function getCurrentUserHistory(): Promise<HistoryDto[]> {
	const endpoint = `/profiles/me/history`;
	return (await client.get<HistoryDto[]>(PREFIX + endpoint)).data;
}

export async function getUserHistory(userId: string): Promise<HistoryDto[]> {
	const endpoint = `/profiles/${userId}/history`;
	return (await client.get<HistoryDto[]>(PREFIX + endpoint)).data;
}

export async function createHistory(data: CreateHistoryDto): Promise<HistoryDto> {
	const endpoint = `/profiles/me/history`;
	return (await client.post<HistoryDto>(PREFIX + endpoint, data)).data;
}

export async function updateHistory(id: string, data: UpdateHistoryDto): Promise<HistoryDto> {
	const endpoint = `/profiles/me/history/${id}`;
	return (await client.put<HistoryDto>(PREFIX + endpoint, data)).data;
}

export async function deleteHistory(id: string): Promise<void> {
	const endpoint = `/profiles/me/history/${id}`;
	await client.delete(PREFIX + endpoint);
}
export async function getUserPositionPayments(userId: string) {
	const endpoint = `/users/${userId}/positionPayments`;

	return (await client.get<PositionPayment[]>(PREFIX + endpoint)).data;
}

export async function getSuspension(eventId: string, userId: string): Promise<Suspension> {
	const endpoint = `/users/${userId}/events/${eventId}/suspension`;

	return (await client.get<Suspension>(PREFIX + endpoint)).data;
}

export async function updateUserProfile(user: UserProfile) {
	const endpoint = `/users/`;

	return (await client.put<UserProfile>(PREFIX + endpoint, user)).data;
}

export async function updateCompleteProfile(data: CreateOrUpdateUserProfileDto) {
	// Controller route is v1/profiles, so combined with PREFIX /profiles/v1 it might be tricky.
	// If PREFIX is /profiles/v1, and controller is at /profiles (via nginx) -> /v1/profiles/me
	// Nginx: /profiles/ -> profiles-service.
	// Service: v1/profiles/me
	// So Client: /profiles/v1/profiles/me

	const endpoint = `/profiles/me`;
	return (await client.put<UserProfile>(PREFIX + endpoint, data)).data;
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
	const getUploadUrlEndpoint = `/profiles/me/profile-image-upload-url?fileType=${encodeURIComponent(fileType)}`;

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
export interface UserSearchRequest extends SortRequest, CursorRequest, QueryRequest {
	teamId?: string;
	groupId?: string;
	excludeCurrentUser?: boolean;
}

export async function searchUsers(request: UserSearchRequest): Promise<CursorPagedResult<UserProfile>> {
	const params = new URLSearchParams();
	if (request.query) params.append("Query", encodeURIComponent(request.query.trim()));
	if (request.teamId) params.append("TeamId", request.teamId);
	if (request.groupId) params.append("GroupId", request.groupId);
	if (request.sortBy) params.append("SortBy", request.sortBy);
	if (request.sortDirection) params.append("SortDirection", request.sortDirection);
	if (request.cursor) params.append("Cursor", request.cursor);
	if (request.limit) params.append("Limit", request.limit.toString());
	if (request.excludeCurrentUser) params.append("ExcludeCurrentUser", "true");

	const endpoint = `/profiles/search?` + params.toString();

	return (await client.get<CursorPagedResult<UserProfile>>(PREFIX + endpoint)).data;
}
