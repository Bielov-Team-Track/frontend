import client from "./client";
import {
	ClubThresholdDto,
	CreateClubThresholdRequest,
	UpdateClubThresholdRequest,
	ThresholdCheckResultDto,
	ClubThreshold,
	ThresholdCheckResult,
	transformClubThresholdDto,
	transformThresholdCheckResultDto,
} from "../models/Evaluation";

const PREFIX = "/events";

/**
 * Get all thresholds for a club
 */
export async function getClubThresholds(clubId: string): Promise<ClubThreshold[]> {
	const endpoint = `/v1/thresholds/club/${clubId}`;
	const response = await client.get<ClubThresholdDto[]>(PREFIX + endpoint);
	return response.data.map(transformClubThresholdDto);
}

/**
 * Create a new threshold for a club
 */
export async function createClubThreshold(request: CreateClubThresholdRequest): Promise<ClubThreshold> {
	const endpoint = "/v1/thresholds";
	const response = await client.post<ClubThresholdDto>(PREFIX + endpoint, request);
	return transformClubThresholdDto(response.data);
}

/**
 * Update an existing threshold
 */
export async function updateClubThreshold(thresholdId: string, request: UpdateClubThresholdRequest): Promise<ClubThreshold> {
	const endpoint = `/v1/thresholds/${thresholdId}`;
	const response = await client.put<ClubThresholdDto>(PREFIX + endpoint, request);
	return transformClubThresholdDto(response.data);
}

/**
 * Delete a threshold
 */
export async function deleteClubThreshold(thresholdId: string): Promise<void> {
	const endpoint = `/v1/thresholds/${thresholdId}`;
	await client.delete(PREFIX + endpoint);
}

/**
 * Check if a player meets the threshold requirements for an event
 */
export async function checkPlayerThreshold(eventId: string, playerId: string): Promise<ThresholdCheckResult[]> {
	const endpoint = `/v1/thresholds/check/${eventId}/${playerId}`;
	const response = await client.get<ThresholdCheckResultDto[]>(PREFIX + endpoint);
	return response.data.map(transformThresholdCheckResultDto);
}
