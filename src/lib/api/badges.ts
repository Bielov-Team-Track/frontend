import client from "./client";
import { PaginatedResponse } from "../models/Pagination";
import {
	PlayerBadgeDto,
	PlayerBadge,
	BadgeStatsDto,
	BadgeStats,
	transformPlayerBadgeDto,
	transformBadgeStatsDto,
} from "../models/Evaluation";

const PREFIX = "/coaching";

/**
 * Get current user's badges with pagination
 */
export async function getMyBadges(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<PlayerBadge>> {
	const endpoint = "/v1/me/badges";
	const params = { page, pageSize };
	const response = await client.get<PaginatedResponse<PlayerBadgeDto>>(PREFIX + endpoint, { params });
	return {
		...response.data,
		items: response.data.items.map(transformPlayerBadgeDto),
	};
}

/**
 * Get current user's badge statistics
 */
export async function getMyBadgeStats(): Promise<BadgeStats> {
	const endpoint = "/v1/me/badges/stats";
	const response = await client.get<BadgeStatsDto>(PREFIX + endpoint);
	return transformBadgeStatsDto(response.data);
}

/**
 * Get recent badges awarded for current user
 */
export async function getRecentBadges(eventId?: string, limit: number = 10): Promise<PlayerBadge[]> {
	const endpoint = "/v1/me/badges/recent";
	const params: { limit: number } = { limit };
	const response = await client.get<PlayerBadgeDto[]>(PREFIX + endpoint, { params });
	return response.data.map(transformPlayerBadgeDto);
}

/**
 * Get badges for a specific user
 */
export async function getUserBadges(userId: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<PlayerBadge>> {
	const endpoint = `/v1/users/${userId}/badges`;
	const params = { page, pageSize };
	const response = await client.get<PaginatedResponse<PlayerBadgeDto>>(PREFIX + endpoint, { params });
	return {
		...response.data,
		items: response.data.items.map(transformPlayerBadgeDto),
	};
}
