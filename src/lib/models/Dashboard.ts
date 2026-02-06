// Dashboard DTOs matching backend Events.Application.DTOs.Dashboard

export interface PlayerDashboardDto {
	userId: string;
	recentFeedback: RecentFeedbackDto[];
	recentEvaluations: RecentEvaluationDto[];
	assignedDrills: AssignedDrillDto[];
	badges: BadgeDto[];
	skillProgress?: SkillProgressDto;
}

export interface RecentFeedbackDto {
	id: string;
	eventName?: string;
	date?: string;
	hasPraise: boolean;
	improvementPointsCount: number;
}

export interface RecentEvaluationDto {
	id: string;
	eventName?: string;
	date?: string;
	outcome?: string; // EvaluationOutcome enum
	averageScore?: number;
	highestSkillLevel?: string;
}

export interface AssignedDrillDto {
	feedbackId: string;
	drillId: string;
	drillName: string;
	coachNote?: string;
	assignedDate: string;
}

export interface BadgeDto {
	type: string; // BadgeType enum
	message: string;
	awardedDate: string;
	eventName?: string;
}

export interface SkillProgressDto {
	trends: SkillTrendDto[];
}

export interface SkillTrendDto {
	skill: string; // VolleyballSkill enum
	dataPoints: SkillDataPointDto[];
	currentLevel?: number;
	previousLevel?: number;
	change?: number;
}

export interface SkillDataPointDto {
	date: string;
	score: number;
	eventName?: string;
}

export interface CoachDashboardDto {
	userId: string;
	pendingEvaluations: PendingEvaluationDto[];
	recentActivity: RecentActivityDto[];
	stats: EvaluationStatsDto;
}

export interface PendingEvaluationDto {
	eventId: string;
	eventName: string;
	eventDate: string;
	totalPlayers: number;
	evaluatedCount: number;
	pendingCount: number;
}

export interface RecentActivityDto {
	type: string;
	entityId: string;
	playerName: string;
	eventName?: string;
	date: string;
	summary?: string;
}

export interface EvaluationStatsDto {
	totalEvaluationsGiven: number;
	totalFeedbackGiven: number;
	playersEvaluatedThisMonth: number;
	praiseGivenThisMonth: number;
}

// Transformed models
export interface PlayerDashboard {
	userId: string;
	recentFeedback: RecentFeedback[];
	recentEvaluations: RecentEvaluation[];
	assignedDrills: AssignedDrill[];
	badges: Badge[];
	skillProgress?: SkillProgress;
}

export interface RecentFeedback {
	id: string;
	eventName?: string;
	date?: Date;
	hasPraise: boolean;
	improvementPointsCount: number;
}

export interface RecentEvaluation {
	id: string;
	eventName?: string;
	date?: Date;
	outcome?: string;
	averageScore?: number;
	highestSkillLevel?: string;
}

export interface AssignedDrill {
	feedbackId: string;
	drillId: string;
	drillName: string;
	coachNote?: string;
	assignedDate: Date;
}

export interface Badge {
	type: string;
	message: string;
	awardedDate: Date;
	eventName?: string;
}

export interface SkillProgress {
	trends: SkillTrend[];
}

export interface SkillTrend {
	skill: string;
	dataPoints: SkillDataPoint[];
	currentLevel?: number;
	previousLevel?: number;
	change?: number;
}

export interface SkillDataPoint {
	date: Date;
	score: number;
	eventName?: string;
}

export interface CoachDashboard {
	userId: string;
	pendingEvaluations: PendingEvaluation[];
	recentActivity: RecentActivity[];
	recentEvaluations?: RecentEvaluation[];
	stats: EvaluationStats;
	// Extended fields for dashboard display
	averageSkillLevel?: number;
	skillLevelChange?: number;
	playersEvaluated?: number;
	evaluationsThisMonth?: number;
	improvementRate?: number;
}

export interface PendingEvaluation {
	eventId: string;
	eventName: string;
	eventDate: Date;
	totalPlayers: number;
	evaluatedCount: number;
	pendingCount: number;
	// Extended fields
	deadline?: Date;
	playersToEvaluate?: number;
}

export interface RecentActivity {
	type: string;
	entityId: string;
	playerName: string;
	eventName?: string;
	date: Date;
	summary?: string;
}

export interface EvaluationStats {
	totalEvaluationsGiven: number;
	totalFeedbackGiven: number;
	playersEvaluatedThisMonth: number;
	praiseGivenThisMonth: number;
}

// Transform functions
export function transformPlayerDashboardDto(dto: PlayerDashboardDto): PlayerDashboard {
	return {
		userId: dto.userId,
		recentFeedback: dto.recentFeedback.map(transformRecentFeedbackDto),
		recentEvaluations: dto.recentEvaluations.map(transformRecentEvaluationDto),
		assignedDrills: dto.assignedDrills.map(transformAssignedDrillDto),
		badges: dto.badges.map(transformBadgeDto),
		skillProgress: dto.skillProgress ? transformSkillProgressDto(dto.skillProgress) : undefined,
	};
}

export function transformRecentFeedbackDto(dto: RecentFeedbackDto): RecentFeedback {
	return {
		id: dto.id,
		eventName: dto.eventName,
		date: dto.date ? new Date(dto.date) : undefined,
		hasPraise: dto.hasPraise,
		improvementPointsCount: dto.improvementPointsCount,
	};
}

export function transformRecentEvaluationDto(dto: RecentEvaluationDto): RecentEvaluation {
	return {
		id: dto.id,
		eventName: dto.eventName,
		date: dto.date ? new Date(dto.date) : undefined,
		outcome: dto.outcome,
		averageScore: dto.averageScore,
		highestSkillLevel: dto.highestSkillLevel,
	};
}

export function transformAssignedDrillDto(dto: AssignedDrillDto): AssignedDrill {
	return {
		feedbackId: dto.feedbackId,
		drillId: dto.drillId,
		drillName: dto.drillName,
		coachNote: dto.coachNote,
		assignedDate: new Date(dto.assignedDate),
	};
}

export function transformBadgeDto(dto: BadgeDto): Badge {
	return {
		type: dto.type,
		message: dto.message,
		awardedDate: new Date(dto.awardedDate),
		eventName: dto.eventName,
	};
}

export function transformSkillProgressDto(dto: SkillProgressDto): SkillProgress {
	return {
		trends: dto.trends.map(transformSkillTrendDto),
	};
}

export function transformSkillTrendDto(dto: SkillTrendDto): SkillTrend {
	return {
		skill: dto.skill,
		dataPoints: dto.dataPoints.map(transformSkillDataPointDto),
		currentLevel: dto.currentLevel,
		previousLevel: dto.previousLevel,
		change: dto.change,
	};
}

export function transformSkillDataPointDto(dto: SkillDataPointDto): SkillDataPoint {
	return {
		date: new Date(dto.date),
		score: dto.score,
		eventName: dto.eventName,
	};
}

export function transformCoachDashboardDto(dto: CoachDashboardDto): CoachDashboard {
	return {
		userId: dto.userId,
		pendingEvaluations: dto.pendingEvaluations.map(transformPendingEvaluationDto),
		recentActivity: dto.recentActivity.map(transformRecentActivityDto),
		stats: dto.stats,
	};
}

export function transformPendingEvaluationDto(dto: PendingEvaluationDto): PendingEvaluation {
	return {
		eventId: dto.eventId,
		eventName: dto.eventName,
		eventDate: new Date(dto.eventDate),
		totalPlayers: dto.totalPlayers,
		evaluatedCount: dto.evaluatedCount,
		pendingCount: dto.pendingCount,
	};
}

export function transformRecentActivityDto(dto: RecentActivityDto): RecentActivity {
	return {
		type: dto.type,
		entityId: dto.entityId,
		playerName: dto.playerName,
		eventName: dto.eventName,
		date: new Date(dto.date),
		summary: dto.summary,
	};
}
