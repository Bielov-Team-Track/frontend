export enum TournamentStatus {
	Draft = "Draft",
	Registration = "Registration",
	InProgress = "InProgress",
	Completed = "Completed",
	Cancelled = "Cancelled",
}

export enum StageType {
	Group = "Group",
	SingleElimination = "SingleElimination",
	DoubleElimination = "DoubleElimination",
}

export enum ScoringFormat {
	SetsBased = "SetsBased",
	Timed = "Timed",
	RaceToPoints = "RaceToPoints",
}

export enum SlotStatus {
	Empty = "Empty",
	Invited = "Invited",
	Filled = "Filled",
}

export enum MatchScoreStatus {
	NotStarted = "NotStarted",
	InProgress = "InProgress",
	Completed = "Completed",
}

export enum MatchEndReason {
	Completed = "Completed",
	Forfeit = "Forfeit",
	Disqualification = "Disqualification",
	Abandoned = "Abandoned",
	OrganizerDecision = "OrganizerDecision",
}

export enum GroupAssignmentMethod {
	Manual = "Manual",
	Random = "Random",
	Seeded = "Seeded",
}

export enum BracketSeeding {
	GroupPosition = "GroupPosition",
	Random = "Random",
	Manual = "Manual",
}

export interface Tournament {
	id: string;
	name: string;
	description?: string;
	organizerId: string;
	visibility: "Public" | "Private";
	registrationStatus: "Open" | "Closed";
	status: TournamentStatus;
	registrationDeadline?: Date;
	startDate?: Date;
	endDate?: Date;
	maxTeams: number;
	registrationFee?: number;
	defaultScoringFormat: ScoringFormat;
	minRosterSize?: number;
	maxRosterSize?: number;
	filledSlots: number;
	stages: TournamentStage[];
	slots: TournamentSlot[];
	teams: TournamentTeam[];
	createdAt?: Date;
}

export interface TournamentStage {
	id: string;
	tournamentId: string;
	type: StageType;
	order: number;
	status: "Pending" | "InProgress" | "Completed";
	groupCount?: number;
	advanceCount?: number;
	bracketSize?: number;
	thirdPlaceMatch: boolean;
}

export interface TournamentSlot {
	id: string;
	slotNumber: number;
	status: SlotStatus;
	registrationId?: string;
	teamName?: string;
}

export interface TournamentTeam {
	id: string;
	displayName: string;
	groupAssignment?: string;
	seed?: number;
	status: "Active" | "Withdrawn" | "Disqualified";
	isInLosersBracket: boolean;
}

export interface TournamentMatch {
	id: string;
	name: string;
	startTime?: Date;
	tournamentId: string;
	stageId?: string;
	homeTeam?: TournamentTeam;
	awayTeam?: TournamentTeam;
	winnerId?: string;
	scheduledCourt?: string;
	matchOrder?: number;
	bracketRound?: number;
	isLosersBracketMatch: boolean;
	score?: MatchScore;
}

export interface MatchScore {
	id: string;
	scoringFormat: ScoringFormat;
	status: MatchScoreStatus;
	currentSet?: number;
	sets?: SetScore[];
	finalHomeScore: number;
	finalAwayScore: number;
	winnerId?: string;
	endReason?: string;
}

export interface SetScore {
	setNumber: number;
	homeScore: number;
	awayScore: number;
}

export interface GroupStanding {
	id: string;
	groupName: string;
	teamId: string;
	team?: TournamentTeam;
	position: number;
	matchesPlayed: number;
	wins: number;
	losses: number;
	draws: number;
	setsWon: number;
	setsLost: number;
	pointsScored: number;
	pointsConceded: number;
	isManuallyOverridden: boolean;
}

// Request types
export interface CreateTournamentRequest {
	name: string;
	description?: string;
	visibility?: "Public" | "Private";
	maxTeams: number;
	registrationFee?: number;
	registrationDeadline?: Date;
	startDate?: Date;
	endDate?: Date;
	defaultScoringFormat?: ScoringFormat;
	defaultScoringConfig?: string;
	minRosterSize?: number;
	maxRosterSize?: number;
	contextId?: string;
}

export interface UpdateTournamentRequest {
	name?: string;
	description?: string;
	visibility?: "Public" | "Private";
	maxTeams?: number;
	registrationFee?: number;
	registrationDeadline?: Date;
	startDate?: Date;
	endDate?: Date;
	defaultScoringFormat?: ScoringFormat;
	defaultScoringConfig?: string;
	minRosterSize?: number;
	maxRosterSize?: number;
}

export interface AssignTeamToSlotRequest {
	teamName: string;
	sourceTeamId?: string;
	roster?: string;
}

export interface RecordMatchScoreRequest {
	scoringFormat: string;
	sets?: string;
	finalHomeScore: number;
	finalAwayScore: number;
	winnerId?: string;
	endReason?: string;
	endNotes?: string;
}

export interface AddStageRequest {
	type: string;
	groupCount?: number;
	assignmentMethod?: string;
	advanceCount?: number;
	wildcardCount?: number;
	bracketSize?: number;
	thirdPlaceMatch?: boolean;
}

export interface AssignTeamsToGroupRequest {
	groupName: string;
	teamIds: string[];
}
