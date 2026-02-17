// Enums matching backend Shared.Enums
export type HouseholdRole = "PrimaryGuardian" | "Guardian" | "Minor" | "Adult";

export type ConsentStatus = "Pending" | "Granted" | "Revoked" | "Expired";

export type ConsentType =
	| "CoreProfileData"
	| "EventParticipation"
	| "Messaging"
	| "PhotoStorage"
	| "PhotoPublicSharing"
	| "VideoStorage"
	| "VideoPublicSharing"
	| "PaymentProcessing"
	| "ThirdPartySharing"
	| "Geolocation"
	| "AITraining";

export type ActionRiskLevel = "Low" | "Medium" | "High" | "Critical";

export type AgeTier = "Under13" | "Below13To14" | "Below15To17" | "AboveConsentAge" | "Adult";

export type VerificationMethod = "EmailPlus" | "TextPlus" | "SmsPlusKnowledgeBased" | "SmsPlusCallback" | "KnowledgeBased" | "CreditCard";

// Interfaces
export interface Household {
	id: string;
	name: string;
	createdByUserId: string;
	createdAt: string;
	members: HouseholdMember[];
}

export interface HouseholdMember {
	id: string;
	userId: string;
	name?: string;
	role: HouseholdRole;
	relationship?: string;
	permissions: number;
	isAttested: boolean;
	joinedAt: string;
}

export interface MinorAccount {
	userId: string;
	dateOfBirth: string;
	countryCode: string;
	hasCredentials: boolean;
	ageTier: AgeTier;
	credentialsGrantedAt?: string;
	transitionedToAdultAt?: string;
}

export interface GuardianConsent {
	id: string;
	guardianId: string;
	minorId: string;
	consentType: ConsentType;
	status: ConsentStatus;
	grantedAt?: string;
	expiresAt?: string;
	scopeVersion: number;
	renewalCount: number;
}

// DTOs
export interface CreateHouseholdDto {
	name: string;
}

export interface AddChildDto {
	name: string;
	surname: string;
	dateOfBirth: string;
	countryCode: string;
	relationship?: string;
}

export interface InviteGuardianDto {
	email: string;
	relationship?: string;
	permissions?: number;
}

export interface UpdateMemberPermissionsDto {
	permissions: number;
}

export interface TransferOwnershipDto {
	newPrimaryGuardianId: string;
}

export interface GrantConsentDto {
	consentType: ConsentType;
	consentScope: string;
	verificationMethod: VerificationMethod;
	ipAddress?: string;
}

export interface RevokeConsentDto {
	consentType: ConsentType;
}

export interface RenewConsentDto {
	consentType: ConsentType;
}

// Permission flags (matching backend GuardianPermission [Flags] enum)
export const GuardianPermission = {
	None: 0,
	View: 1,
	RSVP: 2,
	Register: 4,
	Message: 8,
	Pay: 16,
	Admin: 32,
	All: 63,
} as const;

export function hasPermission(permissions: number, flag: number): boolean {
	return (permissions & flag) === flag;
}

export function addPermission(permissions: number, flag: number): number {
	return permissions | flag;
}

export function removePermission(permissions: number, flag: number): number {
	return permissions & ~flag;
}

export function togglePermission(permissions: number, flag: number): boolean {
	return (permissions & flag) === flag;
}
