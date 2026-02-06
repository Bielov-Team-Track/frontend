import client from "./client";
import {
	Tournament,
	TournamentMatch,
	TournamentSlot,
	TournamentStage,
	GroupStanding,
	MatchScore,
	CreateTournamentRequest,
	UpdateTournamentRequest,
	AssignTeamToSlotRequest,
	RecordMatchScoreRequest,
	AddStageRequest,
	AssignTeamsToGroupRequest,
} from "../models/Tournament";

const PREFIX = "/events";

// =============================================================================
// TOURNAMENT CRUD
// =============================================================================

export async function createTournament(req: CreateTournamentRequest): Promise<Tournament> {
	const endpoint = "/v1/tournaments";
	return (await client.post<Tournament>(PREFIX + endpoint, req)).data;
}

export async function loadTournaments(): Promise<Tournament[]> {
	const endpoint = "/v1/tournaments";
	return (await client.get<Tournament[]>(PREFIX + endpoint)).data;
}

export async function loadTournament(id: string): Promise<Tournament> {
	const endpoint = `/v1/tournaments/${id}`;
	return (await client.get<Tournament>(PREFIX + endpoint)).data;
}

export async function updateTournament(id: string, req: UpdateTournamentRequest): Promise<Tournament> {
	const endpoint = `/v1/tournaments/${id}`;
	return (await client.put<Tournament>(PREFIX + endpoint, req)).data;
}

export async function deleteTournament(id: string): Promise<void> {
	const endpoint = `/v1/tournaments/${id}`;
	await client.delete(PREFIX + endpoint);
}

export async function loadMyTournaments(): Promise<Tournament[]> {
	const endpoint = "/v1/me/tournaments";
	return (await client.get<Tournament[]>(PREFIX + endpoint)).data;
}

// =============================================================================
// STATUS TRANSITIONS
// =============================================================================

export async function openRegistration(id: string): Promise<Tournament> {
	const endpoint = `/v1/tournaments/${id}/open-registration`;
	return (await client.post<Tournament>(PREFIX + endpoint)).data;
}

export async function closeRegistration(id: string): Promise<Tournament> {
	const endpoint = `/v1/tournaments/${id}/close-registration`;
	return (await client.post<Tournament>(PREFIX + endpoint)).data;
}

export async function startTournament(id: string): Promise<Tournament> {
	const endpoint = `/v1/tournaments/${id}/start`;
	return (await client.post<Tournament>(PREFIX + endpoint)).data;
}

export async function completeTournament(id: string): Promise<Tournament> {
	const endpoint = `/v1/tournaments/${id}/complete`;
	return (await client.post<Tournament>(PREFIX + endpoint)).data;
}

export async function cancelTournament(id: string): Promise<Tournament> {
	const endpoint = `/v1/tournaments/${id}/cancel`;
	return (await client.post<Tournament>(PREFIX + endpoint)).data;
}

// =============================================================================
// SLOTS
// =============================================================================

export async function loadSlots(tournamentId: string): Promise<TournamentSlot[]> {
	const endpoint = `/v1/tournaments/${tournamentId}/slots`;
	return (await client.get<TournamentSlot[]>(PREFIX + endpoint)).data;
}

export async function assignTeamToSlot(
	tournamentId: string,
	slotNumber: number,
	req: AssignTeamToSlotRequest,
): Promise<TournamentSlot> {
	const endpoint = `/v1/tournaments/${tournamentId}/slots/${slotNumber}/assign`;
	return (await client.post<TournamentSlot>(PREFIX + endpoint, req)).data;
}

export async function clearSlot(tournamentId: string, slotNumber: number): Promise<void> {
	const endpoint = `/v1/tournaments/${tournamentId}/slots/${slotNumber}`;
	await client.delete(PREFIX + endpoint);
}

// =============================================================================
// STAGES
// =============================================================================

export async function addStage(tournamentId: string, req: AddStageRequest): Promise<TournamentStage> {
	const endpoint = `/v1/tournaments/${tournamentId}/stages`;
	return (await client.post<TournamentStage>(PREFIX + endpoint, req)).data;
}

export async function deleteStage(tournamentId: string, stageId: string): Promise<void> {
	const endpoint = `/v1/tournaments/${tournamentId}/stages/${stageId}`;
	await client.delete(PREFIX + endpoint);
}

export async function generateStageMatches(tournamentId: string, stageId: string): Promise<void> {
	const endpoint = `/v1/tournaments/${tournamentId}/stages/${stageId}/generate-matches`;
	await client.post(PREFIX + endpoint);
}

// =============================================================================
// GROUPS & STANDINGS
// =============================================================================

export async function assignTeamsToGroup(
	tournamentId: string,
	stageId: string,
	req: AssignTeamsToGroupRequest,
): Promise<void> {
	const endpoint = `/v1/tournaments/${tournamentId}/stages/${stageId}/groups/assign`;
	await client.post(PREFIX + endpoint, req);
}

export async function loadStandings(tournamentId: string, stageId: string): Promise<GroupStanding[]> {
	const endpoint = `/v1/tournaments/${tournamentId}/stages/${stageId}/standings`;
	return (await client.get<GroupStanding[]>(PREFIX + endpoint)).data;
}

// =============================================================================
// MATCHES & SCORING
// =============================================================================

export async function loadTournamentMatches(tournamentId: string): Promise<TournamentMatch[]> {
	const endpoint = `/v1/tournaments/${tournamentId}/matches`;
	return (await client.get<TournamentMatch[]>(PREFIX + endpoint)).data;
}

export async function loadMatchScore(matchId: string): Promise<MatchScore> {
	const endpoint = `/v1/matches/${matchId}/score`;
	return (await client.get<MatchScore>(PREFIX + endpoint)).data;
}

export async function startMatch(matchId: string): Promise<MatchScore> {
	const endpoint = `/v1/matches/${matchId}/score/start`;
	return (await client.post<MatchScore>(PREFIX + endpoint)).data;
}

export async function recordMatchScore(matchId: string, req: RecordMatchScoreRequest): Promise<MatchScore> {
	const endpoint = `/v1/matches/${matchId}/score`;
	return (await client.post<MatchScore>(PREFIX + endpoint, req)).data;
}

export async function completeMatch(matchId: string): Promise<MatchScore> {
	const endpoint = `/v1/matches/${matchId}/score/complete`;
	return (await client.post<MatchScore>(PREFIX + endpoint)).data;
}
