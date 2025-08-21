import { Team } from "./Team";
import { UserProfile } from "./User";

export enum EventType {
  CasualPlay = "CasualPlay",
  Tournament = "Tournament",
}

export const EventTypeOptions = [
  { value: EventType.CasualPlay, label: "Casual" },
  { value: EventType.Tournament, label: "Tournament" },
];

export enum EventFormat {
  Open = 0, // No teams, everyone joins individually (masterclass, social events)
  OpenTeams = 1, // Teams with generic "Player" positions
  TeamsWithPositions = 2, // Teams with specific volleyball positions
}

export enum PlayingSurface {
  Grass = "Grass",
  Indoor = "Indoor",
  Beach = "Beach",
}

export const SurfaceOptions = [
  { value: PlayingSurface.Indoor.toString(), label: "Indoor" },
  { value: PlayingSurface.Grass.toString(), label: "Grass" },
  { value: PlayingSurface.Beach.toString(), label: "Beach" },
];

export interface Event {
  id?: string | undefined;
  image?: string | undefined; // Optional for some UIs
  name: string;
  startTime: Date;
  endTime: Date;
  locationId?: string;
  location?: Location;
  description?: string;
  costToEnter: number;
  // Extended fields to match backend model
  type: EventType;
  surface: PlayingSurface;
  isPrivate: boolean;
  teamsNumber: number;
  // Optional for some UIs
  admins?: UserProfile[];
  teams?: Team[]; // Array of team IDs
}

export interface GetEventsRequest {
  type?: EventType; // Optional filter by event type
  surface?: PlayingSurface; // Optional filter by playing surface
  from?: Date; // Optional filter for start time
  to?: Date; // Optional filter for end time
}

export interface CreateEvent {
  id?: string | undefined;
  name: string;
  startTime: Date;
  endTime: Date;
  // Send location as string to be mapped to address in backend
  location: string;
  approveGuests: boolean;
  teamsNumber: number;
  eventFormat: EventFormat;
  cost: number;
  type: EventType;
  surface: PlayingSurface;
  isPrivate: boolean;
  capacity?: number | null; // Changed from maxParticipants to match backend
  courtsNumber: number;
  payToEnter?: boolean; // Indicates if participants need to pay to join this event
}

export interface Location {
  id?: string | undefined;
  name: string;
  latLng?: string;
  address: string;
}
