import { SortDirection } from "./Pagination";
import { UserProfile } from "./User";

export interface Club {
	id: string;
	name: string;
	description?: string;
	logoUrl?: string;
	bannerUrl?: string;
	contactEmail?: string;
	contactPhone?: string;
	isPublic: boolean;
	settings: ClubSettings;
	memberCount?: number;
	location?: string;
	createdAt?: Date;
	updatedAt?: Date;
	groups?: Group[];
	teams?: Team[];
	websiteUrl?: string;
	isArchived?: boolean;
	archivedAt?: string;
	socialLinks?: ClubSocialLink[];
	venues?: Venue[];
}

export interface Venue {
	id: string;
	clubId: string;
	name: string;
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	country?: string;
	region?: string;
	postalCode?: string;
	latitude?: number;
	longitude?: number;
	howToGetThereInstructions?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export enum ClubRole {
	Member = "Member",
	WelfareOfficer = "WelfareOfficer",
	Treasurer = "Treasurer",
	Admin = "Admin",
	HeadCoach = "HeadCoach",
	Owner = "Owner",
}

export enum GroupRole {
	Member = "Member",
	Helper = "Helper",
	Admin = "Admin",
	AssistantCoach = "AssistantCoach",
	Coach = "Coach",
	Leader = "Leader",
	Captain = "Captain",
}

export enum TeamRole {
	Player = "Player",
	Admin = "Admin",
	Captain = "Captain",
	Manager = "Manager",
	AssistantCoach = "AssistantCoach",
	Coach = "Coach",
}

// Role Summary Types
export interface RoleSummaryResponse {
	isPlayer: boolean;
	isCoach: boolean;
	isWelfareOfficer: boolean;
	isTreasurer: boolean;
	isClubAdmin: boolean;
	isClubOwner: boolean;
	clubs: ClubRoleSummary[];
	teams: TeamRoleSummary[];
	groups: GroupRoleSummary[];
}

export interface ClubRoleSummary {
	clubId: string;
	clubName: string;
	roles: ClubRole[];
}

export interface TeamRoleSummary {
	teamId: string;
	teamName: string;
	clubId: string;
	roles: TeamRole[];
}

export interface GroupRoleSummary {
	groupId: string;
	groupName: string;
	clubId: string;
	roles: GroupRole[];
}

export interface ClubMember {
	id: string;
	clubId: string;
	userId: string;
	roles: ClubRole[];
	skillLevel?: SkillLevel;
	isActive: boolean;
	userProfile?: UserProfile;
	createdAt?: Date;
	updatedAt?: Date;
}

/**
 * Lightweight membership data for the current user.
 * Used for permission checks without fetching full member data.
 */
export interface MyClubMembership {
	clubId: string;
	roles: ClubRole[];
	isActive: boolean;
}

export enum SkillLevel {
	Beginner = "Beginner",
	Intermediate = "Intermediate",
	Advanced = "Advanced",
	Expert = "Expert",
	Mixed = "Mixed",
}

export interface ClubSearchFilters {
	query?: string;
	level?: SkillLevel[];
	surface?: string[];
	isPublic?: boolean;
}

export interface CreateClubRequest {
	name: string;
	description?: string;
	logoUrl?: string;
	bannerUrl?: string;
	websiteUrl?: string;
	contactEmail?: string;
	contactPhone?: string;
	isPublic?: boolean;
	venues?: CreateVenueRequest[];
}

export interface CreateVenueRequest {
	clubId?: string;
	name: string;
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	country?: string;
	region?: string;
	postalCode?: string;
	latitude?: number;
	longitude?: number;
	howToGetThereInstructions?: string;
}

export interface UpdateVenueRequest {
	name: string;
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	country?: string;
	region?: string;
	postalCode?: string;
	latitude?: number;
	longitude?: number;
	howToGetThereInstructions?: string;
}

// Team models
export interface Team {
	id: string;
	name: string;
	clubId: string;
	club?: Club;
	description?: string;
	logoUrl?: string;
	color?: string;
	skillLevel?: SkillLevel;
	createdByUserId: string;
	isActive: boolean;
	members?: TeamMember[];
	createdAt?: Date;
	updatedAt?: Date;
}

export enum VolleyballPosition {
	Setter = "Setter",
	OutsideHitter = "OutsideHitter",
	OppositeHitter = "OppositeHitter",
	MiddleBlocker = "MiddleBlocker",
	Libero = "Libero",
}

export interface TeamMember {
	id: string;
	teamId: string;
	userId: string;
	clubMemberId: string;
	positions?: VolleyballPosition[];
	jerseyNumber?: string;
	roles?: TeamRole[];
	isActive: boolean;
	userProfile?: UserProfile;
}

// Position assignment with priority for lineup management
export interface PositionAssignment {
	memberId: string;
	priority: number; // Lower number = higher priority (0 = starter)
}

// Court position assignments for a team's starting lineup
export interface TeamLineup {
	[positionId: string]: PositionAssignment[];
}

export interface UpdateTeamMemberRequest {
	positions?: VolleyballPosition[];
	jerseyNumber?: string;
	roles?: TeamRole[];
	isActive?: boolean;
}

export interface UpdateTeamLineupRequest {
	lineup: TeamLineup;
}

export interface CreateTeamRequest {
	clubId: string;
	name: string;
	description?: string;
	logoUrl?: string;
	skillLevel?: string;
}

export interface UpdateTeamRequest {
	name?: string;
	description?: string;
	logoUrl?: string;
	skillLevel?: string;
}

// Group models
export interface Group {
	id: string;
	name: string;
	clubId: string;
	club?: Club;
	description?: string;
	color?: string;
	logoUrl?: string;
	skillLevel?: SkillLevel;
	createdByUserId: string;
	isActive: boolean;
	members?: GroupMember[];
	createdAt?: Date;
	updatedAt?: Date;
}

export interface GroupMember {
	id: string;
	groupId: string;
	clubMemberId: string;
	roles: GroupRole[];
	isActive: boolean;
	clubMember?: ClubMember;
	userProfile?: UserProfile;
	userId: string;
}

export interface CreateGroupRequest {
	clubId: string;
	name: string;
	description?: string;
	color?: string;
	logoUrl?: string;
	skillLevel?: string;
}

export interface UpdateGroupRequest {
	name?: string;
	description?: string;
	color?: string;
	logoUrl?: string;
	skillLevel?: string;
}
// Invitation types
export enum InvitationStatus {
	Pending = "Pending",
	Accepted = "Accepted",
	Declined = "Declined",
	Expired = "Expired",
	Revoked = "Revoked",
}

export interface ClubInvitation {
	id: string;
	clubId: string;
	token: string;
	targetEmail?: string;
	targetUserId?: string;
	formTemplateId?: string;
	requirePlayerProfile: boolean;
	requireCoachProfile: boolean;
	status: InvitationStatus;
	expiresAt?: string;
	createdByUserId: string;
	acceptedByUserId?: string;
	acceptedAt?: string;
	declinedAt?: string;
	declineReason?: string;
	createdAt: string;
	club?: Club;
	formTemplate?: FormTemplate;
}

export interface CreateInvitationRequest {
	targetEmail?: string;
	targetUserId?: string;
	formTemplateId?: string;
	requirePlayerProfile?: boolean;
	requireCoachProfile?: boolean;
	expiresAt?: string;
}

// Registration types
export enum RegistrationStatus {
	Pending = "Pending",
	Waitlist = "Waitlist",
	Accepted = "Accepted",
	Declined = "Declined",
}

export enum RegistrationSortBy {
	SubmittedAt = "SubmittedAt",
	Status = "Status",
	UserName = "UserName",
}

export interface RegistrationFilterRequest {
	status?: RegistrationStatus;
	search?: string;
	submittedFrom?: string; // ISO Date string
	submittedTo?: string; // ISO Date string
	sortBy?: RegistrationSortBy;
	sortDirection?: SortDirection;
	cursor?: string;
	limit?: number;
}

export interface ClubRegistration {
	id: string;
	clubId: string;
	userId: string;
	formTemplateId?: string;
	status: RegistrationStatus;
	statusChangedByUserId?: string;
	statusChangedAt?: string;
	privateNote?: string;
	publicNote?: string;
	submittedAt: string;
	createdAt: string;
	club?: Club;
	formTemplate?: FormTemplate;
	formResponse?: FormResponse;
	user?: UserProfile;
}

export interface CreateRegistrationRequest {
	formAnswers?: FormFieldAnswerDto[];
}

export interface UpdateRegistrationStatusRequest {
	status: RegistrationStatus;
	privateNote?: string;
	publicNote?: string;
}

export interface RegistrationStatusCounts {
	pending: number;
	waitlist: number;
	accepted: number;
	declined: number;
}

// Form types
export enum FieldType {
	Text = "Text",
	TextArea = "TextArea",
	Number = "Number",
	Radio = "Radio",
	Checkbox = "Checkbox",
	Dropdown = "Dropdown",
	Date = "Date",
}

export interface FormTemplate {
	id: string;
	clubId: string;
	name: string;
	isDefault: boolean;
	isActive: boolean;
	createdAt: string;
	fields: FormField[];
}

export interface FormField {
	id: string;
	formTemplateId: string;
	type: FieldType;
	label: string;
	description?: string;
	isRequired: boolean;
	options?: string[];
	config?: string;
	orderIndex: number;
}

export interface CreateFormTemplateRequest {
	name: string;
	isDefault?: boolean;
	fields: CreateFormFieldRequest[];
}

export interface CreateFormFieldRequest {
	type: FieldType;
	label: string;
	description?: string;
	isRequired?: boolean;
	options?: string[];
	config?: string;
	orderIndex: number;
}

export interface UpdateFormTemplateRequest {
	name?: string;
	isDefault?: boolean;
	isActive?: boolean;
	fields?: CreateFormFieldRequest[];
}

export interface FormResponse {
	id: string;
	formTemplateId: string;
	clubInvitationId?: string;
	clubRegistrationId?: string;
	userId: string;
	createdAt: string;
	answers: FormFieldAnswer[];
}

export interface FormFieldAnswer {
	id: string;
	formResponseId: string;
	formFieldId: string;
	value: string;
}

export interface FormFieldAnswerDto {
	formFieldId: string;
	value: string;
}

// Club settings
export interface ClubSettings {
	id: string;
	clubId: string;
	declineHighlightThreshold: number;
	requireDeclineReason: boolean;
	requirePlayerProfile: boolean;
	requireCoachProfile: boolean;
	defaultFormTemplateId?: string;
	allowPublicRegistration: boolean;
	welcomeMessage?: string;
	pendingMessage?: string;
	waitlistMessage?: string;
	declinedMessage?: string;
}

export interface UpdateClubSettingsRequest {
	declineHighlightThreshold?: number;
	requireDeclineReason?: boolean;
	requirePlayerProfile?: boolean;
	requireCoachProfile?: boolean;
	defaultFormTemplateId?: string;
	allowPublicRegistration?: boolean;
	welcomeMessage?: string;
	pendingMessage?: string;
	waitlistMessage?: string;
	declinedMessage?: string;
}

// Invitation preview (public endpoint response)
export interface InvitationPreview {
	id: string;
	token: string;
	status: InvitationStatus;
	requirePlayerProfile: boolean;
	requireCoachProfile: boolean;
	expiresAt?: string;
	club: {
		id: string;
		name: string;
		description?: string;
		logoUrl?: string;
		bannerUrl?: string;
	};
	formTemplate?: FormTemplate;
}

export enum SocialPlatform {
	Instagram = "Instagram",
	Facebook = "Facebook",
	Twitter = "Twitter",
	YouTube = "YouTube",
	TikTok = "TikTok",
}

export interface ClubSocialLink {
	id: string;
	clubId: string;
	platform: SocialPlatform;
	url: string;
	orderIndex: number;
}
// Extended club update request
export interface UpdateClubRequest {
	name?: string;
	description?: string;
	logoUrl?: string;
	bannerUrl?: string;
	contactEmail?: string;
	contactPhone?: string;
	websiteUrl?: string;
	timezone?: string;
	defaultLanguage?: string;
	isPublic?: boolean;
}

// Archive/Transfer requests
export interface ArchiveClubRequest {
	reason?: string;
}

export interface TransferOwnershipRequest {
	newOwnerUserId: string;
	confirmClubName: string;
}

// Form template with usage count (extended)
export interface FormTemplateWithStats extends FormTemplate {
	usageCount: number;
}
