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
}

export enum ClubRole {
	Member = "Member",
	Assistant = "Assistant",
	Coach = "Coach",
	Admin = "Admin",
	Owner = "Owner",
}

export enum GroupRole {
	Member = "Member",
	Captain = "Captain",
	Leader = "Leader",
}

export interface ClubMember {
	id: string;
	clubId: string;
	userId: string;
	role: ClubRole;
	skillLevel?: SkillLevel;
	isActive: boolean;
	userProfile?: UserProfile;
	createdAt?: Date;
	updatedAt?: Date;
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
	timezone?: string;
	defaultLanguage?: string;
}

// Team models
export interface Team {
	id: string;
	name: string;
	clubId: string;
	description?: string;
	logoUrl?: string;
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
	description?: string;
	color?: string;
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
	role?: GroupRole;
	isActive: boolean;
	clubMember?: ClubMember;
}

export interface CreateGroupRequest {
	clubId: string;
	name: string;
	description?: string;
	color?: string;
	skillLevel?: string;
}

export interface UpdateGroupRequest {
	name?: string;
	description?: string;
	color?: string;
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

export interface ClubRegistration {
	id: string;
	clubId: string;
	userId: string;
	formTemplateId?: string;
	status: RegistrationStatus;
	statusChangedByUserId?: string;
	statusChangedAt?: string;
	statusNote?: string;
	submittedAt: string;
	createdAt: string;
	club?: Club;
	formTemplate?: FormTemplate;
	formResponse?: FormResponse;
}

export interface CreateRegistrationRequest {
	formAnswers?: FormFieldAnswerDto[];
}

export interface UpdateRegistrationStatusRequest {
	status: RegistrationStatus;
	statusNote?: string;
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
}

export interface UpdateClubSettingsRequest {
	declineHighlightThreshold?: number;
	requireDeclineReason?: boolean;
	requirePlayerProfile?: boolean;
	requireCoachProfile?: boolean;
	defaultFormTemplateId?: string;
	allowPublicRegistration?: boolean;
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
