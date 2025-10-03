import { Team } from "./Team";
import { UserProfile } from "./User";
import { EventBudget, Unit } from "./EventBudget";

export enum EventType {
  CasualPlay = "CasualPlay",
  Tournament = "Tournament",
  TrainingSession = "TrainingSession",
}

export const EventTypeOptions = [
  { value: EventType.CasualPlay, label: "Casual" },
  { value: EventType.Tournament, label: "Tournament" },
  { value: EventType.TrainingSession, label: "Training Session" },
];

export enum EventFormat {
  Open = "Open", // No teams, everyone joins individually (masterclass, social events)
  OpenTeams = "OpenTeams", // Teams with generic "Player" positions
  TeamsWithPositions = "TeamsWithPositions", // Teams with specific volleyball positions
}

export enum PlayingSurface {
  Grass = 0,
  Indoor = 1,
  Beach = 2,
}

export const SurfaceOptions = [
  { value: PlayingSurface.Indoor, label: "Indoor" },
  { value: PlayingSurface.Grass, label: "Grass" },
  { value: PlayingSurface.Beach, label: "Beach" },
];

export interface Event {
  id: string;
  image?: string | undefined; // Optional for some UIs
  name: string;
  startTime: Date;
  endTime: Date;
  locationId?: Location;
  location?: Location;
  description?: string;
  canceled?: boolean;

  // Registration and pricing
  registrationUnit: Unit; // How people register for this event
  budget?: EventBudget; // Budget configuration (new approach)
  budgetId?: string; // Reference to budget if using separate budget entity

  // Legacy pricing fields (for backward compatibility)
  costToEnter: number; // @deprecated - use budget instead

  // Extended fields to match backend model
  type: EventType;
  eventFormat: EventFormat;
  surface: PlayingSurface;
  isPrivate: boolean;
  teamsNumber: number;

  // Optional for some UIs
  admins?: UserProfile[];
  teams?: Team[]; // Array of team IDs
}

export interface EventAdmin {}

export interface EventFilterRequest {
  type?: EventType; // Optional filter by event type
  surface?: PlayingSurface; // Optional filter by playing surface
  from?: Date; // Optional filter for start time
  to?: Date; // Optional filter for end time
  status?: "outstanding" | "completed" | "cancelled"; // Filter by payment/event status
  organizerId?: string; // Filter by event organizer
  participantId?: string; // Filter by participant
  page?: number; // Page number for pagination (default: 1)
  limit?: number; // Number of items per page (default: 20)
  sortBy?: "startDate" | "createdAt"; // Sort field
  sortOrder?: "asc" | "desc"; // Sort order (default: asc)
}

export interface CreateEvent {
  id?: string | undefined;
  name: string;
  startTime: Date;
  endTime: Date;
  location: Location;
  approveGuests: boolean;
  teamsNumber: number;
  eventFormat: EventFormat;

  // Registration and pricing
  registrationUnit: Unit;
  budget?: EventBudget; // Inline budget configuration
  budgetId?: string; // Or reference to existing budget template

  type: EventType;
  surface: PlayingSurface;
  isPrivate: boolean;
}

export interface Location {
  id?: string | undefined;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}
