import client from "./client";

const PREFIX = "/profiles";

export interface CreateGuardianInvitationPayload {
	guardianEmail: string;
	relationship: string;
}

export interface GuardianInvitationResponse {
	id: string;
	expiresAt: string;
	status: string;
}

export interface GuardianStatusResponse {
	hasGuardian: boolean;
	hasRequiredConsent: boolean;
	guardianEmail: string | null;
	invitationStatus: string | null;
	invitationExpiresAt: string | null;
}

export async function createGuardianRequest(payload: CreateGuardianInvitationPayload): Promise<GuardianInvitationResponse> {
	const res = await client.post<GuardianInvitationResponse>(`${PREFIX}/v1/profiles/me/guardian-request`, payload);
	return res.data;
}

export async function updateGuardianRequest(payload: CreateGuardianInvitationPayload): Promise<GuardianInvitationResponse> {
	const res = await client.put<GuardianInvitationResponse>(`${PREFIX}/v1/profiles/me/guardian-request`, payload);
	return res.data;
}

export async function getGuardianStatus(): Promise<GuardianStatusResponse> {
	const res = await client.get<GuardianStatusResponse>(`${PREFIX}/v1/profiles/me/guardian-status`);
	return res.data;
}
