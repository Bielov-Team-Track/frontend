import {
	AddChildDto,
	CreateHouseholdDto,
	GrantConsentDto,
	GuardianConsent,
	Household,
	HouseholdMember,
	InviteGuardianDto,
	RenewConsentDto,
	RevokeConsentDto,
	TransferOwnershipDto,
	UpdateMemberPermissionsDto,
} from "../models/Family";
import client from "./client";

const HOUSEHOLDS_PREFIX = "/profiles/v1/households";
const CONSENT_PREFIX = "/profiles/v1/consent";

// Household Management
export const createHousehold = (dto: CreateHouseholdDto): Promise<Household> =>
	client.post<Household>(HOUSEHOLDS_PREFIX, dto).then((r) => r.data);

export const getMyHousehold = (): Promise<Household> => client.get<Household>(`${HOUSEHOLDS_PREFIX}/me`).then((r) => r.data);

export const deleteHousehold = (): Promise<void> => client.delete(HOUSEHOLDS_PREFIX).then(() => undefined);

export const transferOwnership = (dto: TransferOwnershipDto): Promise<void> =>
	client.post(`${HOUSEHOLDS_PREFIX}/transfer-ownership`, dto).then(() => undefined);

// Member Management
export const getMembers = (): Promise<HouseholdMember[]> =>
	client.get<HouseholdMember[]>(`${HOUSEHOLDS_PREFIX}/members`).then((r) => r.data);

export const addChild = (dto: AddChildDto): Promise<HouseholdMember> =>
	client.post<HouseholdMember>(`${HOUSEHOLDS_PREFIX}/members`, dto).then((r) => r.data);

export const inviteGuardian = (dto: InviteGuardianDto): Promise<void> =>
	client.post(`${HOUSEHOLDS_PREFIX}/invite-guardian`, dto).then(() => undefined);

export const removeMember = (userId: string): Promise<void> =>
	client.delete(`${HOUSEHOLDS_PREFIX}/members/${userId}`).then(() => undefined);

export const updateMemberPermissions = (userId: string, dto: UpdateMemberPermissionsDto): Promise<void> =>
	client.patch(`${HOUSEHOLDS_PREFIX}/members/${userId}`, dto).then(() => undefined);

// Guardian Consent Management
// Note: Consent endpoints may not be implemented yet in the backend controller
// These are based on the IConsentService interface structure
export const grantConsent = (minorId: string, dto: GrantConsentDto): Promise<GuardianConsent> =>
	client.post<GuardianConsent>(`${CONSENT_PREFIX}/${minorId}/grant`, dto).then((r) => r.data);

export const revokeConsent = (minorId: string, dto: RevokeConsentDto): Promise<void> =>
	client.post(`${CONSENT_PREFIX}/${minorId}/revoke`, dto).then(() => undefined);

export const getConsentsForMinor = (minorId: string): Promise<GuardianConsent[]> =>
	client.get<GuardianConsent[]>(`${CONSENT_PREFIX}/${minorId}`).then((r) => r.data);

export const renewConsent = (minorId: string, dto: RenewConsentDto): Promise<GuardianConsent> =>
	client.post<GuardianConsent>(`${CONSENT_PREFIX}/${minorId}/renew`, dto).then((r) => r.data);
