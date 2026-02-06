import client from "./client";
import {
	PlayerDashboardDto,
	CoachDashboardDto,
	SkillProgressDto,
	PlayerDashboard,
	CoachDashboard,
	SkillProgress,
	transformPlayerDashboardDto,
	transformCoachDashboardDto,
	transformSkillProgressDto,
} from "../models/Dashboard";

const PREFIX = "/events";

/**
 * Get player dashboard data
 */
export async function getPlayerDashboard(): Promise<PlayerDashboard> {
	const endpoint = "/v1/me/dashboard/player";
	const response = await client.get<PlayerDashboardDto>(PREFIX + endpoint);
	return transformPlayerDashboardDto(response.data);
}

/**
 * Get coach dashboard data
 */
export async function getCoachDashboard(): Promise<CoachDashboard> {
	const endpoint = "/v1/me/dashboard/coach";
	const response = await client.get<CoachDashboardDto>(PREFIX + endpoint);
	return transformCoachDashboardDto(response.data);
}

/**
 * Get skill progress over time
 * @param months Number of months to retrieve (optional)
 */
export async function getSkillProgress(months?: number): Promise<SkillProgress | null> {
	const endpoint = "/v1/me/skill-progress";
	const params = months ? { months } : undefined;
	const response = await client.get<SkillProgressDto>(PREFIX + endpoint, { params });
	return response.data ? transformSkillProgressDto(response.data) : null;
}
