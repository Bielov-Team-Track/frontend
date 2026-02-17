import { EventPaymentConfig as EventPaymentsConfig, Unit } from "./EventPaymentConfig";
import { ContextType } from "./shared/models";
import { Team } from "./Team";

export enum EventType {
	Match = "Match",
	CasualPlay = "CasualPlay",
	Social = "Social",
	TrainingSession = "TrainingSession",
	Evaluation = "Evaluation",
	Trial = "Trial",
}

export const EventTypeOptions = [
	{ value: EventType.CasualPlay, label: "Casual" },
	{ value: EventType.Social, label: "Tournament" },
	{ value: EventType.TrainingSession, label: "Training Session" },
	{ value: EventType.Match, label: "Match" },
];

export enum EventFormat {
	List = "List", // No teams, everyone joins individually (masterclass, social events)
	OpenTeams = "OpenTeams", // Teams with generic "Player" positions
	TeamsWithPositions = "TeamsWithPositions", // Teams with specific volleyball positions
}

export enum PlayingSurface {
	Grass = "Grass",
	Indoor = "Indoor",
	Beach = "Beach",
}

export const SurfaceOptions = [
	{ value: PlayingSurface.Indoor, label: "Indoor" },
	{ value: PlayingSurface.Grass, label: "Grass" },
	{ value: PlayingSurface.Beach, label: "Beach" },
];

export interface Event {
	id: string;
	image?: string | undefined; // Optional for some UIs
	imageUrl?: string | undefined; // Alias for image
	name: string;
	startTime: Date;
	endTime: Date;
	createdAt?: Date;
	updatedAt?: Date;
	locationId?: Location;
	location?: Location;
	description?: string;
	canceled?: boolean;

	// Registration and pricing
	registrationUnit: Unit; // How people register for this event
	paymentConfig?: EventPaymentsConfig; // Payment configuration from backend

	// Legacy pricing fields (for backward compatibility)
	costToEnter: number; // @deprecated - use paymentConfig instead

	// Extended fields to match backend model
	type: EventType;
	eventFormat: EventFormat;
	surface: PlayingSurface;
	isPrivate: boolean;
	teamsNumber: number;
	teams?: Team[]; // Array of team IDs

	// Training plan (from coaching-service)
	trainingPlanId?: string;
	trainingPlanSummary?: string; // JSON: { name, totalDuration, sectionCount, drillCount }

	// Recurring event series
	seriesId?: string;
	seriesOccurrenceNumber?: number;

	// Context association (club, team, or group)
	contextId?: string;
	contextType?: ContextType;
}

export interface EventAdmin {}

export interface EventFilterRequest {
	type?: EventType; // Optional filter by event type
	surface?: PlayingSurface; // Optional filter by playing surface
	from?: string; // Optional filter for start time (ISO string)
	to?: string; // Optional filter for end time (ISO string)
	status?: "outstanding" | "completed" | "cancelled"; // Filter by payment/event status
	searchTerm?: string; // Search by event name (case-insensitive)
	organizerId?: string; // Filter by event organizer
	participantId?: string; // Filter by participant
	page?: number; // Page number for pagination (default: 1)
	limit?: number; // Number of items per page (default: 20)
	sortBy?: "startDate" | "createdAt"; // Sort field
	sortOrder?: "asc" | "desc"; // Sort order (default: asc)
	contextId?: string; // Filter by context (club, team, group)
	contextType?: ContextType; // Type of context
}

export interface CreateEvent {
	name: string;
	description?: string;
	startTime: Date;
	endTime?: Date;
	isPublic: boolean;
	location: Location;

	type: EventType;
	surface: PlayingSurface;
	eventFormat: EventFormat;
	registrationConfig?: RegistrationConfig;
	paymentConfig?: EventPaymentsConfig;
	invitedUsers?: string[];

	contextType?: ContextType;
	contextId?: string;
}

export interface Location {
	name: string;
	address?: string;
	city?: string;
	country?: string;
	postalCode?: string;
	latitude?: number;
	longitude?: number;
	instructions?: string;
}

export interface RegistrationConfig {
	isOpen: boolean;
	capacity?: number;
	registrationType: RegistrationType;
	deadline?: Date;
	openDate?: Date;
}

export enum RegistrationType {
	Individuals = "Individuals",
	Teams = "Teams",
}

// Recurring Events Types
export enum RecurrencePattern {
	Weekly = "weekly",
	Biweekly = "biweekly",
	Monthly = "monthly",
	Semiannually = "semiannually",
	Annually = "annually",
}

export const RecurrencePatternOptions = [
	{ value: RecurrencePattern.Weekly, label: "Every Week" },
	{ value: RecurrencePattern.Biweekly, label: "Every 2 Weeks" },
	{ value: RecurrencePattern.Monthly, label: "Every Month" },
	{ value: RecurrencePattern.Semiannually, label: "Every 6 Months" },
	{ value: RecurrencePattern.Annually, label: "Every Year" },
];

export enum TimeOffsetUnit {
	Minutes = "minutes",
	Hours = "hours",
	Days = "days",
}

export const TimeOffsetUnitOptions = [
	{ value: TimeOffsetUnit.Minutes, label: "minutes" },
	{ value: TimeOffsetUnit.Hours, label: "hours" },
	{ value: TimeOffsetUnit.Days, label: "days" },
];

export interface TimeOffset {
	value: number;
	unit: TimeOffsetUnit;
}

export interface CreateEventSeries {
	name: string;
	description?: string;
	recurrencePattern: RecurrencePattern;
	firstOccurrenceDate: Date;
	seriesEndDate: Date;
	eventStartTime: string; // "HH:mm" format
	eventEndTime: string; // "HH:mm" format
	type: EventType;
	surface?: PlayingSurface;
	eventFormat: EventFormat;
	isPublic: boolean;
	location?: Location;
	paymentConfig?: EventPaymentsConfig;
	invitedUsers?: string[];
	registrationOpenOffset?: TimeOffset;
	registrationDeadlineOffset?: TimeOffset;
	contextType?: ContextType;
	contextId?: string;
}

export interface TrainingPlanSummary {
	name: string;
	totalDuration: number;
	sectionCount: number;
	drillCount: number;
}

export function parseTrainingPlanSummary(json: string | undefined): TrainingPlanSummary | null {
	if (!json) return null;
	try {
		return JSON.parse(json) as TrainingPlanSummary;
	} catch {
		return null;
	}
}

export interface EventSeries {
	id: string;
	name: string;
	recurrencePattern: RecurrencePattern;
	firstOccurrenceDate: Date;
	seriesEndDate: Date;
	totalEventsCount: number;
	events: Event[];
}
