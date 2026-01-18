import { Team } from "@/lib/models/Club";
import { EventType } from "@/lib/models/Event";

// Registration type - open or closed
export type RegistrationType = "open" | "closed";

// Registration unit for open registration
export type RegistrationUnit = "individual" | "team";

// Team slot selection type
export type TeamSlotType = "own" | "invited" | "manual";

// Team slot for Match events
export interface MatchTeamSlot {
	type: TeamSlotType;
	teamId?: string;
	team?: Team;
	invitationId?: string;
	name?: string;
	contactEmail?: string;
	color?: string;
	status?: "pending" | "accepted" | "declined";
}

// Team slot for Casual Play (open registration)
export interface CasualTeamSlot {
	name: string;
	color: string;
}

// Team for Casual Play (closed registration)
export interface CasualTeamClosed {
	type: "invited" | "created";
	teamId?: string;
	name?: string;
	color?: string;
	captainId?: string;
	status?: "pending" | "accepted" | "declined";
}

// Invitee types
export type InviteeType = "user" | "team" | "group" | "club";

export interface Invitee {
	type: InviteeType;
	id: string;
	name: string;
	avatarUrl?: string;
	memberCount?: number; // for groups/teams/clubs
	excludedUserIds?: string[]; // for granular control
}

// Event format determined by event type
export function getEventFormatForType(eventType: EventType): "match" | "list" | "choice" {
	switch (eventType) {
		case EventType.Match:
			return "match";
		case EventType.Social:
		case EventType.TrainingSession:
			return "list";
		case EventType.CasualPlay:
			return "choice";
		default:
			return "list";
	}
}

// Casual Play format options
export type CasualPlayFormat = "list" | "openTeams" | "teamsWithPositions";
