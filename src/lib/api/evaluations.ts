import client from "./client";
import { PaginatedResponse } from "../models/Pagination";
import {
	EvaluationExerciseDto,
	CreateEvaluationExerciseRequest,
	UpdateEvaluationExerciseRequest,
	AddMetricRequest,
	UpdateEvaluationMetricRequest,
	EvaluationPlanDto,
	CreateEvaluationPlanRequest,
	UpdateEvaluationPlanRequest,
	AddPlanItemRequest,
	ReorderPlanItemsRequest,
	PlayerEvaluationDto,
	CreatePlayerEvaluationRequest,
	EvaluationExercise,
	EvaluationPlan,
	EvaluationMetric,
	PlayerEvaluation,
	transformEvaluationExerciseDto,
	transformEvaluationPlanDto,
	transformPlayerEvaluationDto,
	EvaluationSessionDto,
	EvaluationSession,
	EvaluationGroupDto,
	PlayerExerciseScoreDto,
	SessionProgressDto,
	CreateEvaluationSessionRequest,
	UpdateEvaluationSessionRequest,
	UpdateSharingRequest,
	UpdatePlayerSharingRequest,
	CreateGroupRequest,
	UpdateGroupRequest,
	AutoSplitGroupsRequest,
	AssignPlayerToGroupRequest,
	MovePlayerRequest,
	AddParticipantsRequest,
	SubmitExerciseScoresRequest,
	transformEvaluationSessionDto,
} from "../models/Evaluation";

// Type aliases for backward compatibility
type EventEvaluationPlanDto = EvaluationPlanDto;
type CreateEventEvaluationPlanRequest = CreateEvaluationPlanRequest;
type EventEvaluationPlan = EvaluationPlan;
const transformEventEvaluationPlanDto = transformEvaluationPlanDto;

const PREFIX = "/coaching";

// =============================================================================
// EVALUATION EXERCISES
// =============================================================================

/**
 * Get all evaluation exercises with pagination
 */
export async function getEvaluationExercises(
	page: number = 1,
	pageSize: number = 20
): Promise<PaginatedResponse<EvaluationExercise>> {
	const endpoint = "/v1/evaluation-exercises";
	const params = { page, pageSize };
	const response = await client.get<PaginatedResponse<EvaluationExerciseDto>>(PREFIX + endpoint, { params });
	return {
		...response.data,
		items: response.data.items.map(transformEvaluationExerciseDto),
	};
}

/**
 * Get a specific evaluation exercise by ID
 */
export async function getEvaluationExercise(id: string): Promise<EvaluationExercise> {
	const endpoint = `/v1/evaluation-exercises/${id}`;
	const response = await client.get<EvaluationExerciseDto>(PREFIX + endpoint);
	return transformEvaluationExerciseDto(response.data);
}

/**
 * Create a new evaluation exercise
 */
export async function createEvaluationExercise(request: CreateEvaluationExerciseRequest): Promise<EvaluationExercise> {
	const endpoint = "/v1/evaluation-exercises";
	const response = await client.post<EvaluationExerciseDto>(PREFIX + endpoint, request);
	return transformEvaluationExerciseDto(response.data);
}

/**
 * Update an evaluation exercise
 */
export async function updateEvaluationExercise(id: string, request: UpdateEvaluationExerciseRequest): Promise<EvaluationExercise> {
	const endpoint = `/v1/evaluation-exercises/${id}`;
	const response = await client.put<EvaluationExerciseDto>(PREFIX + endpoint, request);
	return transformEvaluationExerciseDto(response.data);
}

/**
 * Delete an evaluation exercise
 */
export async function deleteEvaluationExercise(id: string): Promise<void> {
	const endpoint = `/v1/evaluation-exercises/${id}`;
	await client.delete(PREFIX + endpoint);
}

/**
 * Get evaluation exercises for a club
 */
export async function getClubEvaluationExercises(clubId: string): Promise<EvaluationExercise[]> {
	const endpoint = `/v1/clubs/${clubId}/evaluation-exercises`;
	const response = await client.get<EvaluationExerciseDto[]>(PREFIX + endpoint);
	return response.data.map(transformEvaluationExerciseDto);
}

/**
 * Add a metric to an evaluation exercise
 */
export async function addExerciseMetric(exerciseId: string, request: AddMetricRequest): Promise<EvaluationExercise> {
	const endpoint = `/v1/evaluation-exercises/${exerciseId}/metrics`;
	const response = await client.post<EvaluationExerciseDto>(PREFIX + endpoint, request);
	return transformEvaluationExerciseDto(response.data);
}

/**
 * Update a metric on an evaluation exercise
 */
export async function updateExerciseMetric(exerciseId: string, metricId: string, request: UpdateEvaluationMetricRequest): Promise<EvaluationExercise> {
	const endpoint = `/v1/evaluation-exercises/${exerciseId}/metrics/${metricId}`;
	const response = await client.put<EvaluationExerciseDto>(PREFIX + endpoint, request);
	return transformEvaluationExerciseDto(response.data);
}

/**
 * Delete a metric from an evaluation exercise
 */
export async function deleteExerciseMetric(exerciseId: string, metricId: string): Promise<void> {
	const endpoint = `/v1/evaluation-exercises/${exerciseId}/metrics/${metricId}`;
	await client.delete(PREFIX + endpoint);
}

// =============================================================================
// EVENT EVALUATION PLANS
// =============================================================================

/**
 * Get evaluation plan for an event
 */
export async function getEventEvaluationPlan(eventId: string): Promise<EventEvaluationPlan> {
	const endpoint = `/v1/events/${eventId}/evaluation-plan`;
	const response = await client.get<EventEvaluationPlanDto>(PREFIX + endpoint);
	return transformEventEvaluationPlanDto(response.data);
}

/**
 * Get all evaluation plans created by the current user
 */
export async function getMyEvaluationPlans(): Promise<EvaluationPlan[]> {
	const endpoint = "/v1/evaluation-plans/me";
	const response = await client.get<EvaluationPlanDto[]>(PREFIX + endpoint);
	return response.data.map(transformEvaluationPlanDto);
}

/**
 * Create evaluation plan for an event
 */
export async function createEventEvaluationPlan(
	eventId: string,
	request: CreateEventEvaluationPlanRequest
): Promise<EventEvaluationPlan> {
	const endpoint = `/v1/events/${eventId}/evaluation-plan`;
	const response = await client.post<EventEvaluationPlanDto>(PREFIX + endpoint, request);
	return transformEventEvaluationPlanDto(response.data);
}

/**
 * Update an evaluation plan
 */
export async function updateEvaluationPlan(planId: string, request: UpdateEvaluationPlanRequest): Promise<EvaluationPlan> {
	const endpoint = `/v1/evaluation-plans/${planId}`;
	const response = await client.put<EvaluationPlanDto>(PREFIX + endpoint, request);
	return transformEvaluationPlanDto(response.data);
}

/**
 * Delete an evaluation plan
 */
export async function deleteEvaluationPlan(planId: string): Promise<void> {
	const endpoint = `/v1/evaluation-plans/${planId}`;
	await client.delete(PREFIX + endpoint);
}

/**
 * Add an exercise to a plan
 */
export async function addPlanItem(planId: string, request: AddPlanItemRequest): Promise<EvaluationPlan> {
	const endpoint = `/v1/evaluation-plans/${planId}/items`;
	const response = await client.post<EvaluationPlanDto>(PREFIX + endpoint, request);
	return transformEvaluationPlanDto(response.data);
}

/**
 * Remove an exercise from a plan
 */
export async function removePlanItem(planId: string, itemId: string): Promise<void> {
	const endpoint = `/v1/evaluation-plans/${planId}/items/${itemId}`;
	await client.delete(PREFIX + endpoint);
}

/**
 * Reorder exercises in a plan
 */
export async function reorderPlanItems(planId: string, request: ReorderPlanItemsRequest): Promise<EvaluationPlan> {
	const endpoint = `/v1/evaluation-plans/${planId}/items/reorder`;
	const response = await client.put<EvaluationPlanDto>(PREFIX + endpoint, request);
	return transformEvaluationPlanDto(response.data);
}

// =============================================================================
// PLAYER EVALUATIONS
// =============================================================================

/**
 * Get all player evaluations for an event
 */
export async function getEventPlayerEvaluations(eventId: string): Promise<PlayerEvaluation[]> {
	const endpoint = `/v1/events/${eventId}/player-evaluations`;
	const response = await client.get<PlayerEvaluationDto[]>(PREFIX + endpoint);
	return response.data.map(transformPlayerEvaluationDto);
}

/**
 * Create a player evaluation for an event
 */
export async function createPlayerEvaluation(
	eventId: string,
	request: CreatePlayerEvaluationRequest
): Promise<PlayerEvaluation> {
	const endpoint = `/v1/events/${eventId}/player-evaluations`;
	const response = await client.post<PlayerEvaluationDto>(PREFIX + endpoint, request);
	return transformPlayerEvaluationDto(response.data);
}

/**
 * Get current user's evaluations with pagination
 */
export async function getMyEvaluations(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<PlayerEvaluation>> {
	const endpoint = "/v1/player-evaluations/me";
	const params = { page, pageSize };
	const response = await client.get<PaginatedResponse<PlayerEvaluationDto>>(PREFIX + endpoint, { params });
	return {
		...response.data,
		items: response.data.items.map(transformPlayerEvaluationDto),
	};
}

// =============================================================================
// EVALUATION SESSIONS
// =============================================================================

export async function getEvaluationSession(sessionId: string): Promise<EvaluationSession> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}`;
	const response = await client.get<EvaluationSessionDto>(PREFIX + endpoint);
	return transformEvaluationSessionDto(response.data);
}

export async function getMySessions(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<EvaluationSession>> {
	const endpoint = "/v1/evaluation-sessions/me";
	const params = { page, pageSize };
	const response = await client.get<PaginatedResponse<EvaluationSessionDto>>(PREFIX + endpoint, { params });
	return {
		...response.data,
		items: response.data.items.map(transformEvaluationSessionDto),
	};
}

export async function getClubSessions(clubId: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<EvaluationSession>> {
	const endpoint = `/v1/clubs/${clubId}/evaluation-sessions`;
	const params = { page, pageSize };
	const response = await client.get<PaginatedResponse<EvaluationSessionDto>>(PREFIX + endpoint, { params });
	return {
		...response.data,
		items: response.data.items.map(transformEvaluationSessionDto),
	};
}

export async function createEvaluationSession(request: CreateEvaluationSessionRequest): Promise<EvaluationSession> {
	const endpoint = "/v1/evaluation-sessions";
	const response = await client.post<EvaluationSessionDto>(PREFIX + endpoint, request);
	return transformEvaluationSessionDto(response.data);
}

export async function updateEvaluationSession(sessionId: string, request: UpdateEvaluationSessionRequest): Promise<EvaluationSession> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}`;
	const response = await client.put<EvaluationSessionDto>(PREFIX + endpoint, request);
	return transformEvaluationSessionDto(response.data);
}

export async function deleteEvaluationSession(sessionId: string): Promise<void> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}`;
	await client.delete(PREFIX + endpoint);
}

export async function addSessionParticipants(sessionId: string, request: AddParticipantsRequest): Promise<EvaluationSession> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/participants`;
	const response = await client.post<EvaluationSessionDto>(PREFIX + endpoint, request);
	return transformEvaluationSessionDto(response.data);
}

export async function removeSessionParticipant(sessionId: string, participantId: string): Promise<EvaluationSession> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/participants/${participantId}`;
	const response = await client.delete<EvaluationSessionDto>(PREFIX + endpoint);
	return transformEvaluationSessionDto(response.data);
}

// === SESSION LIFECYCLE ===

export async function startSession(sessionId: string): Promise<EvaluationSession> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/start`;
	const response = await client.post<EvaluationSessionDto>(PREFIX + endpoint);
	return transformEvaluationSessionDto(response.data);
}

export async function pauseSession(sessionId: string): Promise<EvaluationSession> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/pause`;
	const response = await client.post<EvaluationSessionDto>(PREFIX + endpoint);
	return transformEvaluationSessionDto(response.data);
}

export async function resumeSession(sessionId: string): Promise<EvaluationSession> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/resume`;
	const response = await client.post<EvaluationSessionDto>(PREFIX + endpoint);
	return transformEvaluationSessionDto(response.data);
}

export async function completeSession(sessionId: string): Promise<EvaluationSession> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/complete`;
	const response = await client.post<EvaluationSessionDto>(PREFIX + endpoint);
	return transformEvaluationSessionDto(response.data);
}

export async function getSessionProgress(sessionId: string): Promise<SessionProgressDto> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/progress`;
	const response = await client.get<SessionProgressDto>(PREFIX + endpoint);
	return response.data;
}

export async function updateSessionSharing(sessionId: string, request: UpdateSharingRequest): Promise<void> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/sharing`;
	await client.put(PREFIX + endpoint, request);
}

export async function updatePlayerSharing(sessionId: string, evaluationId: string, request: UpdatePlayerSharingRequest): Promise<void> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/evaluations/${evaluationId}/sharing`;
	await client.put(PREFIX + endpoint, request);
}

// === GROUPS ===

export async function createGroup(sessionId: string, request: CreateGroupRequest): Promise<EvaluationGroupDto> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/groups`;
	const response = await client.post<EvaluationGroupDto>(PREFIX + endpoint, request);
	return response.data;
}

export async function updateGroup(sessionId: string, groupId: string, request: UpdateGroupRequest): Promise<EvaluationGroupDto> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/groups/${groupId}`;
	const response = await client.put<EvaluationGroupDto>(PREFIX + endpoint, request);
	return response.data;
}

export async function deleteGroup(sessionId: string, groupId: string): Promise<void> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/groups/${groupId}`;
	await client.delete(PREFIX + endpoint);
}

export async function autoSplitGroups(sessionId: string, request: AutoSplitGroupsRequest): Promise<EvaluationGroupDto[]> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/groups/auto-split`;
	const response = await client.post<EvaluationGroupDto[]>(PREFIX + endpoint, request);
	return response.data;
}

export async function addPlayerToGroup(sessionId: string, groupId: string, request: AssignPlayerToGroupRequest): Promise<EvaluationGroupDto> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/groups/${groupId}/players`;
	const response = await client.post<EvaluationGroupDto>(PREFIX + endpoint, request);
	return response.data;
}

export async function removePlayerFromGroup(sessionId: string, groupId: string, playerId: string): Promise<void> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/groups/${groupId}/players/${playerId}`;
	await client.delete(PREFIX + endpoint);
}

export async function movePlayer(sessionId: string, request: MovePlayerRequest): Promise<void> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/groups/move-player`;
	await client.post(PREFIX + endpoint, request);
}

// === SCORING ===

export async function submitExerciseScores(sessionId: string, request: SubmitExerciseScoresRequest): Promise<PlayerExerciseScoreDto> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/scores`;
	const response = await client.post<PlayerExerciseScoreDto>(PREFIX + endpoint, request);
	return response.data;
}

export async function getSessionScores(sessionId: string): Promise<PlayerExerciseScoreDto[]> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/scores`;
	const response = await client.get<PlayerExerciseScoreDto[]>(PREFIX + endpoint);
	return response.data;
}

export async function getGroupExerciseScores(sessionId: string, groupId: string, exerciseId: string): Promise<PlayerExerciseScoreDto[]> {
	const endpoint = `/v1/evaluation-sessions/${sessionId}/groups/${groupId}/exercises/${exerciseId}/scores`;
	const response = await client.get<PlayerExerciseScoreDto[]>(PREFIX + endpoint);
	return response.data;
}
