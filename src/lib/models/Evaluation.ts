import { DifficultyLevel } from "./Template";

// =============================================================================
// PLAYER EVALUATIONS - Matching Events.Application.DTOs.Evaluation.PlayerEvaluationDtos
// =============================================================================

export interface PlayerEvaluationDto {
	id: string;
	eventId: string;
	playerId: string;
	evaluatedByUserId: string;
	outcome?: string; // EvaluationOutcome enum
	sharedWithPlayer: boolean;
	coachNotes?: string;
	metricScores: PlayerMetricScoreDto[];
	skillScores: PlayerSkillScoreDto[];
	createdAt?: string;
	updatedAt?: string;
}

export interface PlayerMetricScoreDto {
	id: string;
	metricId: string;
	metricName: string;
	rawValue: number;
	normalizedScore: number;
}

export interface PlayerSkillScoreDto {
	id: string;
	skill: string; // VolleyballSkill enum
	earnedPoints: number;
	maxPoints: number;
	score: number;
	level?: string;
}

export interface CreatePlayerEvaluationRequest {
	playerId: string;
	coachNotes?: string;
}

export interface RecordMetricScoreDto {
	metricId: string;
	rawValue: number;
}

export interface RecordMetricScoresRequest {
	scores: RecordMetricScoreDto[];
}

export interface UpdateEvaluationOutcomeRequest {
	outcome: string; // EvaluationOutcome enum
	coachNotes?: string;
}

export interface EvaluationSummaryDto {
	eventId: string;
	totalPlayers: number;
	evaluatedCount: number;
	passedCount: number;
	failedCount: number;
	pendingCount: number;
	evaluations: PlayerEvaluationDto[];
}

export interface PlayerEvaluation {
	id: string;
	eventId: string;
	playerId: string;
	evaluatedByUserId: string;
	outcome?: string;
	sharedWithPlayer: boolean;
	coachNotes?: string;
	metricScores: PlayerMetricScore[];
	skillScores: PlayerSkillScore[];
	createdAt?: Date;
	updatedAt?: Date;
}

export interface PlayerMetricScore {
	id: string;
	metricId: string;
	metricName: string;
	rawValue: number;
	normalizedScore: number;
}

export interface PlayerSkillScore {
	id: string;
	skill: string;
	earnedPoints: number;
	maxPoints: number;
	score: number;
	level?: string;
}

export interface EvaluationSummary {
	eventId: string;
	totalPlayers: number;
	evaluatedCount: number;
	passedCount: number;
	failedCount: number;
	pendingCount: number;
	evaluations: PlayerEvaluation[];
}

// =============================================================================
// EVALUATION EXERCISES - Matching Events.Application.DTOs.Evaluation.EvaluationExerciseDtos
// =============================================================================

export interface EvaluationExerciseDto {
	id: string;
	name: string;
	description?: string;
	clubId?: string;
	createdByUserId: string;
	level: DifficultyLevel;
	metrics: EvaluationMetricDto[];
	createdAt?: string;
	updatedAt?: string;
}

export interface EvaluationMetricDto {
	id: string;
	name: string;
	type: string; // MetricType enum
	maxPoints: number;
	config?: string;
	order: number;
	skillWeights: MetricSkillWeightDto[];
}

export interface MetricSkillWeightDto {
	id: string;
	skill: string; // VolleyballSkill enum
	percentage: number;
}

export interface CreateEvaluationExerciseRequest {
	name: string;
	description?: string;
	clubId?: string;
	level?: DifficultyLevel;
	metrics?: CreateEvaluationMetricDto[];
}

export interface CreateEvaluationMetricDto {
	name: string;
	type: string; // MetricType enum
	maxPoints: number;
	config?: string;
	skillWeights: CreateMetricSkillWeightDto[];
}

export interface CreateMetricSkillWeightDto {
	skill: string; // VolleyballSkill enum
	percentage: number;
}

export interface UpdateEvaluationExerciseRequest {
	name?: string;
	description?: string;
	level?: DifficultyLevel;
}

export interface UpdateEvaluationMetricRequest {
	name?: string;
	type?: string;
	maxPoints?: number;
	config?: string;
}

export interface AddMetricRequest {
	name: string;
	type: string;
	maxPoints: number;
	config?: string;
	order?: number;
	skillWeights: CreateMetricSkillWeightDto[];
}

export interface ExerciseListResponseDto {
	items: EvaluationExerciseDto[];
	totalCount: number;
	page: number;
	pageSize: number;
}

export interface EvaluationExercise {
	id: string;
	name: string;
	description?: string;
	clubId?: string;
	createdByUserId: string;
	level: DifficultyLevel;
	metrics: EvaluationMetric[];
	createdAt?: Date;
	updatedAt?: Date;
}

export interface EvaluationMetric {
	id: string;
	name: string;
	type: string;
	maxPoints: number;
	config?: string;
	order: number;
	skillWeights: MetricSkillWeight[];
}

export interface MetricSkillWeight {
	id: string;
	skill: string;
	percentage: number;
}

export interface ExerciseListResponse {
	items: EvaluationExercise[];
	totalCount: number;
	page: number;
	pageSize: number;
}

// =============================================================================
// EVALUATION PLANS - Matching Events.Application.DTOs.Evaluation.EvaluationPlanDtos
// =============================================================================

export interface EvaluationPlanDto {
	id: string;
	eventId: string;
	name?: string;
	notes?: string;
	items: EvaluationPlanItemDto[];
	createdAt?: string;
	updatedAt?: string;
}

export interface EvaluationPlanItemDto {
	id: string;
	exerciseId: string;
	order: number;
	exercise: EvaluationExerciseDto;
}

export interface CreateEvaluationPlanRequest {
	name?: string;
	notes?: string;
	exerciseIds?: string[];
}

export interface UpdateEvaluationPlanRequest {
	name?: string;
	notes?: string;
}

export interface AddPlanItemRequest {
	exerciseId: string;
	order?: number;
}

export interface ReorderPlanItemsRequest {
	itemIds: string[];
}

export interface EvaluationPlan {
	id: string;
	eventId: string;
	name?: string;
	notes?: string;
	items: EvaluationPlanItem[];
	createdAt?: Date;
	updatedAt?: Date;
}

export interface EvaluationPlanItem {
	id: string;
	exerciseId: string;
	order: number;
	exercise: EvaluationExercise;
}

// =============================================================================
// THRESHOLDS - Matching Events.Application.DTOs.Evaluation.ThresholdDtos
// =============================================================================

export interface EvaluationThresholdDto {
	id: string;
	clubId: string;
	skill?: string; // VolleyballSkill enum
	minScore: number;
	isActive: boolean;
	description?: string;
}

export interface CreateThresholdRequest {
	skill?: string;
	minScore: number;
	description?: string;
}

export interface UpdateThresholdRequest {
	minScore?: number;
	isActive?: boolean;
	description?: string;
}

export interface ThresholdCheckResultDto {
	passed: boolean;
	skillResults: SkillThresholdResultDto[];
	suggestedOutcome?: string;
}

export interface SkillThresholdResultDto {
	skill: string; // VolleyballSkill enum
	score: number;
	minRequired: number;
	passed: boolean;
}

export interface EvaluationThreshold {
	id: string;
	clubId: string;
	skill?: string;
	minScore: number;
	isActive: boolean;
	description?: string;
}

export interface ThresholdCheckResult {
	passed: boolean;
	skillResults: SkillThresholdResult[];
	suggestedOutcome?: string;
}

export interface SkillThresholdResult {
	skill: string;
	score: number;
	minRequired: number;
	passed: boolean;
}

// =============================================================================
// BADGES - Matching Events.Application.DTOs.Feedback.BadgeDtos
// =============================================================================

export interface PlayerBadgeDto {
	id: string;
	userId: string;
	praiseId?: string;
	eventId?: string;
	badgeType: string; // BadgeType enum
	badgeName: string;
	badgeDescription: string;
	badgeIcon: string;
	message: string;
	awardedByUserId: string;
	createdAt?: string;
}

export interface BadgeStatsDto {
	totalBadges: number;
	badgesByType: Record<string, number>;
	mostCommonBadge?: string; // BadgeType enum
	latestBadge?: PlayerBadgeDto;
}

export interface AwardBadgeRequest {
	userId: string;
	praiseId?: string;
	eventId?: string;
	badgeType: string; // BadgeType enum
	message: string;
}

export interface PlayerBadge {
	id: string;
	userId: string;
	praiseId?: string;
	eventId?: string;
	badgeType: string;
	badgeName: string;
	badgeDescription: string;
	badgeIcon: string;
	message: string;
	awardedByUserId: string;
	createdAt?: Date;
	awardedAt?: Date;
	isNew?: boolean;
}

export interface BadgeStats {
	totalBadges: number;
	totalBadgeTypes?: number;
	earnedCount?: number;
	completionPercentage?: number;
	badgesByType: Record<string, number>;
	mostCommonBadge?: string;
	latestBadge?: PlayerBadge;
}

// =============================================================================
// BADGE METADATA
// =============================================================================

export enum BadgeType {
	Star = "Star",
	Improvement = "Improvement",
	Teamwork = "Teamwork",
	Effort = "Effort",
	Skill = "Skill",
	Leadership = "Leadership",
	Consistency = "Consistency",
	Breakthrough = "Breakthrough",
}

export interface BadgeMetadata {
	name: string;
	description: string;
	icon: string;
}

export const BADGE_METADATA: Record<BadgeType, BadgeMetadata> = {
	[BadgeType.Star]: {
		name: "Star Player",
		description: "Exceptional performance and standout contribution",
		icon: "⭐",
	},
	[BadgeType.Improvement]: {
		name: "Most Improved",
		description: "Significant growth and development shown",
		icon: "📈",
	},
	[BadgeType.Teamwork]: {
		name: "Team Player",
		description: "Outstanding collaboration and support for teammates",
		icon: "🤝",
	},
	[BadgeType.Effort]: {
		name: "Maximum Effort",
		description: "Exceptional dedication and work ethic",
		icon: "💪",
	},
	[BadgeType.Skill]: {
		name: "Skilled Performer",
		description: "High technical ability demonstrated",
		icon: "🎯",
	},
	[BadgeType.Leadership]: {
		name: "Leader",
		description: "Inspiring and guiding teammates effectively",
		icon: "👑",
	},
	[BadgeType.Consistency]: {
		name: "Consistent Performer",
		description: "Reliable and steady performance",
		icon: "🔄",
	},
	[BadgeType.Breakthrough]: {
		name: "Breakthrough Moment",
		description: "Achieved a significant milestone or breakthrough",
		icon: "🚀",
	},
};

// =============================================================================
// EVALUATION SESSIONS - Matching Coaching.Application.DTOs.Evaluation
// =============================================================================

export type EvaluationSessionStatus = 'Draft' | 'Running' | 'Paused' | 'Completed';
export type EvaluationScoreStatus = 'Pending' | 'Scored';
export type EvaluationOutcome = 'Pending' | 'Pass' | 'Fail';

export interface EvaluationSessionDto {
	id: string;
	clubId: string;
	eventId: string | null;
	coachUserId: string;
	evaluationPlanId: string | null;
	title: string;
	description: string | null;
	status: EvaluationSessionStatus;
	shareFeedback: boolean;
	shareMetrics: boolean;
	startedAt: string | null;
	pausedAt: string | null;
	completedAt: string | null;
	evaluationPlan: EvaluationPlanDto | null;
	participants: EvaluationParticipantDto[];
	groups: EvaluationGroupDto[];
	createdAt: string | null;
	updatedAt: string | null;
}

export interface EvaluationParticipantDto {
	id: string;
	sessionId: string;
	playerId: string;
	playerName: string | null;
	avatarUrl: string | null;
}

export interface EvaluationGroupDto {
	id: string;
	sessionId: string;
	name: string;
	evaluatorUserId: string | null;
	order: number;
	players: GroupPlayerDto[];
}

export interface GroupPlayerDto {
	id: string;
	playerId: string;
}

export interface PlayerExerciseScoreDto {
	id: string;
	sessionId: string;
	playerId: string;
	exerciseId: string;
	evaluatorUserId: string | null;
	status: EvaluationScoreStatus;
	scoredAt: string | null;
	metricScores: MetricScoreValueDto[];
}

export interface MetricScoreValueDto {
	metricId: string;
	value: number;
	notes: string | null;
}

export interface SubmitExerciseScoresRequest {
	playerId: string;
	exerciseId: string;
	scores: MetricScoreValueDto[];
}

export interface SessionProgressDto {
	sessionId: string;
	status: EvaluationSessionStatus;
	totalPlayers: number;
	totalExercises: number;
	totalScored: number;
	totalPossible: number;
	overallProgress: number;
	groups: GroupProgressDto[];
}

export interface GroupProgressDto {
	groupId: string;
	groupName: string;
	evaluatorUserId: string | null;
	evaluatorName: string | null;
	currentExerciseName: string | null;
	playersScored: number;
	totalPlayers: number;
	exercisesCompleted: number;
	totalExercises: number;
}

export interface CreateEvaluationSessionRequest {
	clubId: string;
	eventId?: string;
	evaluationPlanId?: string;
	title: string;
	description?: string;
}

export interface UpdateEvaluationSessionRequest {
	title?: string;
	description?: string;
	evaluationPlanId?: string;
	status?: EvaluationSessionStatus;
}

export interface UpdateSharingRequest {
	shareFeedback?: boolean;
	shareMetrics?: boolean;
}

export interface UpdatePlayerSharingRequest {
	sharedWithPlayer: boolean;
}

export interface CreateGroupRequest {
	name: string;
	evaluatorUserId?: string;
}

export interface UpdateGroupRequest {
	name?: string;
	evaluatorUserId?: string;
}

export interface AutoSplitGroupsRequest {
	numberOfGroups: number;
}

export interface AssignPlayerToGroupRequest {
	playerId: string;
}

export interface MovePlayerRequest {
	playerId: string;
	targetGroupId: string;
}

export interface AddParticipantsRequest {
	playerIds: string[];
}

export interface EvaluationSession {
	id: string;
	clubId: string;
	eventId: string | null;
	coachUserId: string;
	evaluationPlanId: string | null;
	title: string;
	description: string | null;
	status: EvaluationSessionStatus;
	shareFeedback: boolean;
	shareMetrics: boolean;
	startedAt: Date | null;
	pausedAt: Date | null;
	completedAt: Date | null;
	evaluationPlan: EvaluationPlan | null;
	participants: EvaluationParticipantDto[];
	groups: EvaluationGroupDto[];
	createdAt: Date | null;
	updatedAt: Date | null;
}

// =============================================================================
// TRANSFORM FUNCTIONS
// =============================================================================

export function transformPlayerEvaluationDto(dto: PlayerEvaluationDto): PlayerEvaluation {
	return {
		...dto,
		metricScores: dto.metricScores,
		skillScores: dto.skillScores,
		createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
		updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
	};
}

export function transformEvaluationSummaryDto(dto: EvaluationSummaryDto): EvaluationSummary {
	return {
		...dto,
		evaluations: dto.evaluations.map(transformPlayerEvaluationDto),
	};
}

export function transformEvaluationExerciseDto(dto: EvaluationExerciseDto): EvaluationExercise {
	return {
		...dto,
		createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
		updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
	};
}

export function transformExerciseListResponseDto(dto: ExerciseListResponseDto): ExerciseListResponse {
	return {
		...dto,
		items: dto.items.map(transformEvaluationExerciseDto),
	};
}

export function transformEvaluationPlanDto(dto: EvaluationPlanDto): EvaluationPlan {
	return {
		...dto,
		items: dto.items.map((item) => ({
			...item,
			exercise: transformEvaluationExerciseDto(item.exercise),
		})),
		createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
		updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
	};
}

export function transformPlayerBadgeDto(dto: PlayerBadgeDto): PlayerBadge {
	return {
		...dto,
		createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
	};
}

export function transformBadgeStatsDto(dto: BadgeStatsDto): BadgeStats {
	return {
		...dto,
		latestBadge: dto.latestBadge ? transformPlayerBadgeDto(dto.latestBadge) : undefined,
	};
}

export function transformEvaluationSessionDto(dto: EvaluationSessionDto): EvaluationSession {
	return {
		...dto,
		evaluationPlan: dto.evaluationPlan ? transformEvaluationPlanDto(dto.evaluationPlan) : null,
		startedAt: dto.startedAt ? new Date(dto.startedAt) : null,
		pausedAt: dto.pausedAt ? new Date(dto.pausedAt) : null,
		completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
		createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
		updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null,
	};
}

// Type aliases for backward compatibility
export type ClubThresholdDto = EvaluationThresholdDto;
export type ClubThreshold = EvaluationThreshold;
export type CreateClubThresholdRequest = CreateThresholdRequest;
export type UpdateClubThresholdRequest = UpdateThresholdRequest;

export function transformClubThresholdDto(dto: EvaluationThresholdDto): EvaluationThreshold {
	return { ...dto };
}

export function transformThresholdCheckResultDto(dto: ThresholdCheckResultDto): ThresholdCheckResult {
	return { ...dto };
}
