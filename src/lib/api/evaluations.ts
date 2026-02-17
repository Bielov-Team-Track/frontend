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
