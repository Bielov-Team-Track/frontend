import {
	ClubInvitation,
	ClubRegistration,
	ClubSettings,
	CreateFormTemplateRequest,
	CreateInvitationRequest,
	CreateRegistrationRequest,
	FormFieldAnswerDto,
	FormTemplate,
	InvitationPreview,
	InvitationStatus,
	RegistrationFilterRequest,
	RegistrationStatus,
	RegistrationStatusCounts,
	UpdateFormTemplateRequest,
	UpdateRegistrationStatusRequest,
} from "@/lib/models/Club";
import { CLUBS_API_V1 } from "../constants";
import {
	Club,
	ClubMember,
	ClubSearchFilters,
	ClubSocialLink,
	CreateClubRequest,
	CreateGroupRequest,
	CreateTeamRequest,
	Group,
	Team,
	TeamMember,
	UpdateGroupRequest,
	UpdateTeamMemberRequest,
	UpdateTeamRequest,
} from "../models/Club";
import { CursorPagedResult } from "../models/Pagination";
import client from "./client";

export async function getClubs(): Promise<Club[]> {
	const endpoint = "/clubs";
	return (await client.get<Club[]>(CLUBS_API_V1 + endpoint)).data;
}

export async function getClub(id: string): Promise<Club> {
	const endpoint = `/clubs/${id}`;
	return (await client.get<Club>(CLUBS_API_V1 + endpoint)).data;
}

export async function searchClubs(filters: ClubSearchFilters): Promise<Club[]> {
	const params = new URLSearchParams();
	if (filters.query) params.append("query", filters.query);
	if (filters.isPublic !== undefined) params.append("isPublic", String(filters.isPublic));

	const queryString = params.toString();
	const endpoint = `/clubs${queryString ? `?${queryString}` : ""}`;
	return (await client.get<Club[]>(CLUBS_API_V1 + endpoint)).data;
}

export async function createClub(data: CreateClubRequest): Promise<Club> {
	const endpoint = "/clubs";
	return (await client.post<Club>(CLUBS_API_V1 + endpoint, data)).data;
}

export async function updateClub(id: string, data: Partial<CreateClubRequest>): Promise<Club> {
	const endpoint = `/clubs/${id}`;
	return (await client.put<Club>(CLUBS_API_V1 + endpoint, data)).data;
}

export async function deleteClub(id: string): Promise<void> {
	const endpoint = `/clubs/${id}`;
	await client.delete(CLUBS_API_V1 + endpoint);
}

export async function getUserClubs(userId: string): Promise<Club[]> {
	const endpoint = `/clubs/users/${userId}/clubs`;
	return (await client.get<Club[]>(CLUBS_API_V1 + endpoint)).data;
}

export async function joinClub(clubId: string, userId: string): Promise<void> {
	const endpoint = `/clubs/${clubId}/members`;
	await client.post(CLUBS_API_V1 + endpoint, { userId, role: "Member" });
}

export async function inviteMember(clubId: string, userId: string, role: string): Promise<void> {
	const endpoint = `/clubs/${clubId}/members`;
	await client.post(CLUBS_API_V1 + endpoint, { userId, role });
}

export async function leaveClub(clubId: string, userId: string): Promise<void> {
	const endpoint = `/clubs/${clubId}/members/${userId}`;
	await client.delete(CLUBS_API_V1 + endpoint);
}

export interface UpdateClubMemberRequest {
	role?: string;
	skillLevel?: string;
	isActive?: boolean;
}

export async function updateClubMember(clubId: string, memberId: string, data: UpdateClubMemberRequest): Promise<ClubMember> {
	const endpoint = `/clubs/${clubId}/members/${memberId}`;
	return (await client.put<ClubMember>(CLUBS_API_V1 + endpoint, data)).data;
}

export async function getClubMembers(clubId: string): Promise<ClubMember[]> {
	const endpoint = `/clubs/${clubId}/members`;
	return (await client.get<ClubMember[]>(CLUBS_API_V1 + endpoint)).data;
}

// Team API functions
export async function getTeamsByClub(clubId: string): Promise<Team[]> {
	const endpoint = `/teams/club/${clubId}`;
	return (await client.get<Team[]>(CLUBS_API_V1 + endpoint)).data;
}

export async function getTeam(teamId: string): Promise<Team> {
	const endpoint = `/teams/${teamId}`;
	return (await client.get<Team>(CLUBS_API_V1 + endpoint)).data;
}

export async function createTeam(data: CreateTeamRequest): Promise<Team> {
	const endpoint = "/teams";
	return (await client.post<Team>(CLUBS_API_V1 + endpoint, data)).data;
}

export async function updateTeam(teamId: string, data: UpdateTeamRequest): Promise<Team> {
	const endpoint = `/teams/${teamId}`;
	return (await client.put<Team>(CLUBS_API_V1 + endpoint, data)).data;
}

export async function deleteTeam(teamId: string): Promise<void> {
	const endpoint = `/teams/${teamId}`;
	await client.delete(CLUBS_API_V1 + endpoint);
}

export async function addTeamMember(teamId: string, userId: string, positions: string[] = [], jerseyNumber?: string): Promise<void> {
	const endpoint = `/teams/${teamId}/members`;
	await client.post(CLUBS_API_V1 + endpoint, { userId, positions, jerseyNumber });
}

export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
	const endpoint = `/teams/${teamId}/members/${userId}`;
	await client.delete(CLUBS_API_V1 + endpoint);
}

export async function updateTeamMember(teamId: string, memberId: string, data: UpdateTeamMemberRequest): Promise<TeamMember> {
	const endpoint = `/teams/${teamId}/members/${memberId}`;
	return (await client.put<TeamMember>(CLUBS_API_V1 + endpoint, data)).data;
}

// Group API functions
export async function getGroupsByClub(clubId: string): Promise<Group[]> {
	const endpoint = `/groups/club/${clubId}`;
	return (await client.get<Group[]>(CLUBS_API_V1 + endpoint)).data;
}

export async function getGroup(groupId: string): Promise<Group> {
	const endpoint = `/groups/${groupId}`;
	return (await client.get<Group>(CLUBS_API_V1 + endpoint)).data;
}

export async function createGroup(data: CreateGroupRequest): Promise<Group> {
	const endpoint = "/groups";
	return (await client.post<Group>(CLUBS_API_V1 + endpoint, data)).data;
}

export async function updateGroup(groupId: string, data: UpdateGroupRequest): Promise<Group> {
	const endpoint = `/groups/${groupId}`;
	return (await client.put<Group>(CLUBS_API_V1 + endpoint, data)).data;
}

export async function deleteGroup(groupId: string): Promise<void> {
	const endpoint = `/groups/${groupId}`;
	await client.delete(CLUBS_API_V1 + endpoint);
}

export async function addGroupMember(groupId: string, userId: string): Promise<void> {
	const endpoint = `/groups/${groupId}/members`;
	await client.post(CLUBS_API_V1 + endpoint, userId);
}

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
	const endpoint = `/groups/${groupId}/members/${userId}`;
	await client.delete(CLUBS_API_V1 + endpoint);
}

// Club Image Upload Functions
export async function getClubLogoUploadUrl(clubId: string, fileType: string): Promise<string> {
	const endpoint = `/clubs/${clubId}/logo-upload-url?fileType=${encodeURIComponent(fileType)}`;
	const response = await client.get<string>(CLUBS_API_V1 + endpoint);
	return response.data;
}

export async function getClubBannerUploadUrl(clubId: string, fileType: string): Promise<string> {
	const endpoint = `/clubs/${clubId}/banner-upload-url?fileType=${encodeURIComponent(fileType)}`;
	const response = await client.get<string>(CLUBS_API_V1 + endpoint);
	return response.data;
}

export async function uploadClubImage(clubId: string, image: Blob, imageType: "logo" | "banner"): Promise<string> {
	const fileType = image.type || "image/png";

	// Get presigned URL
	const presignedUrl = imageType === "logo" ? await getClubLogoUploadUrl(clubId, fileType) : await getClubBannerUploadUrl(clubId, fileType);

	// Upload directly to S3
	const uploadResponse = await fetch(presignedUrl, {
		method: "PUT",
		body: image,
		headers: {
			"Content-Type": fileType,
		},
	});

	if (!uploadResponse.ok) {
		throw new Error(`Failed to upload ${imageType}`);
	}

	// Return public URL (remove query params from presigned URL)
	return presignedUrl.split("?")[0];
}

// Invitation endpoints (admin)
export async function createInvitation(clubId: string, data: CreateInvitationRequest): Promise<ClubInvitation> {
	return (await client.post<ClubInvitation>(CLUBS_API_V1 + `/clubs/${clubId}/invitations`, data)).data;
}

export async function getClubInvitations(clubId: string, status?: InvitationStatus): Promise<ClubInvitation[]> {
	const params = status ? `?status=${status}` : "";
	return (await client.get<ClubInvitation[]>(CLUBS_API_V1 + `/clubs/${clubId}/invitations${params}`)).data;
}

export async function getClubInvitation(clubId: string, invitationId: string): Promise<ClubInvitation> {
	return (await client.get<ClubInvitation>(CLUBS_API_V1 + `/clubs/${clubId}/invitations/${invitationId}`)).data;
}

export async function revokeInvitation(clubId: string, invitationId: string): Promise<void> {
	await client.delete(CLUBS_API_V1 + `/clubs/${clubId}/invitations/${invitationId}`);
}

// Public invitation endpoints
export async function getInvitationByToken(token: string): Promise<InvitationPreview> {
	return (await client.get<InvitationPreview>(CLUBS_API_V1 + `/invitations/${token}`)).data;
}

export async function acceptInvitation(token: string, formAnswers?: FormFieldAnswerDto[]): Promise<ClubInvitation> {
	return (await client.post<ClubInvitation>(CLUBS_API_V1 + `/invitations/${token}/accept`, { formAnswers })).data;
}

export async function declineInvitation(token: string, reason?: string): Promise<ClubInvitation> {
	return (await client.post<ClubInvitation>(CLUBS_API_V1 + `/invitations/${token}/decline`, { reason })).data;
}

// Registration endpoints (user)
export async function createRegistration(clubId: string, data?: CreateRegistrationRequest): Promise<ClubRegistration> {
	return (await client.post<ClubRegistration>(CLUBS_API_V1 + `/clubs/${clubId}/registrations`, data || {})).data;
}

export async function getMyRegistration(clubId: string): Promise<ClubRegistration | null> {
	try {
		return (await client.get<ClubRegistration>(CLUBS_API_V1 + `/clubs/${clubId}/registrations/me`)).data;
	} catch (error: any) {
		if (error.response?.status === 404) {
			return null;
		}
		throw error;
	}
}

export async function cancelMyRegistration(clubId: string): Promise<void> {
	await client.delete(CLUBS_API_V1 + `/clubs/${clubId}/registrations/me`);
}

// Registration endpoints (admin)
export async function getClubRegistrations(clubId: string, status?: RegistrationStatus): Promise<ClubRegistration[]> {
	const params = status ? `?status=${status}` : "";
	return (await client.get<ClubRegistration[]>(CLUBS_API_V1 + `/clubs/${clubId}/registrations${params}`)).data;
}

export async function getClubRegistrationsPaged(clubId: string, filter: RegistrationFilterRequest): Promise<CursorPagedResult<ClubRegistration>> {
	const params = new URLSearchParams();
	if (filter.status) params.append("Status", filter.status);
	if (filter.search) params.append("Search", filter.search);
	if (filter.submittedFrom) params.append("SubmittedFrom", filter.submittedFrom);
	if (filter.submittedTo) params.append("SubmittedTo", filter.submittedTo);
	if (filter.sortBy) params.append("SortBy", filter.sortBy);
	if (filter.sortDirection) params.append("SortDirection", filter.sortDirection);
	if (filter.cursor) params.append("Cursor", filter.cursor);
	if (filter.limit) params.append("Limit", filter.limit.toString());

	return (await client.get<CursorPagedResult<ClubRegistration>>(CLUBS_API_V1 + `/clubs/${clubId}/registrations?${params.toString()}`)).data;
}

export async function getClubRegistration(clubId: string, registrationId: string): Promise<ClubRegistration> {
	return (await client.get<ClubRegistration>(CLUBS_API_V1 + `/clubs/${clubId}/registrations/${registrationId}`)).data;
}

export async function updateRegistrationStatus(clubId: string, registrationId: string, data: UpdateRegistrationStatusRequest): Promise<ClubRegistration> {
	return (await client.patch<ClubRegistration>(CLUBS_API_V1 + `/clubs/${clubId}/registrations/${registrationId}`, data)).data;
}

export async function getPendingRegistrationsCount(clubId: string): Promise<number> {
	const response = await client.get<{ count: number }>(CLUBS_API_V1 + `/clubs/${clubId}/registrations/pending-count`);
	return response.data.count;
}

export async function getRegistrationStatusCounts(clubId: string): Promise<RegistrationStatusCounts> {
	const response = await client.get<RegistrationStatusCounts>(CLUBS_API_V1 + `/clubs/${clubId}/registrations/counts`);
	return response.data;
}

// Form template endpoints
export async function createFormTemplate(clubId: string, data: CreateFormTemplateRequest): Promise<FormTemplate> {
	return (await client.post<FormTemplate>(CLUBS_API_V1 + `/clubs/${clubId}/forms`, data)).data;
}

export async function getClubFormTemplates(clubId: string): Promise<FormTemplate[]> {
	return (await client.get<FormTemplate[]>(CLUBS_API_V1 + `/clubs/${clubId}/forms`)).data;
}

export async function getFormTemplate(clubId: string, formId: string): Promise<FormTemplate> {
	return (await client.get<FormTemplate>(CLUBS_API_V1 + `/clubs/${clubId}/forms/${formId}`)).data;
}

export async function updateFormTemplate(clubId: string, formId: string, data: UpdateFormTemplateRequest): Promise<FormTemplate> {
	return (await client.put<FormTemplate>(CLUBS_API_V1 + `/clubs/${clubId}/forms/${formId}`, data)).data;
}

export async function deleteFormTemplate(clubId: string, formId: string): Promise<void> {
	await client.delete(CLUBS_API_V1 + `/clubs/${clubId}/forms/${formId}`);
}

export async function duplicateFormTemplate(clubId: string, formId: string): Promise<FormTemplate> {
	return (await client.post<FormTemplate>(CLUBS_API_V1 + `/clubs/${clubId}/forms/${formId}/duplicate`)).data;
}
// Social links
export async function getClubSocialLinks(clubId: string): Promise<ClubSocialLink[]> {
	return (await client.get<ClubSocialLink[]>(CLUBS_API_V1 + `/clubs/${clubId}/social-links`)).data;
}

export async function updateClubSocialLinks(clubId: string, links: Omit<ClubSocialLink, "id" | "clubId">[]): Promise<ClubSocialLink[]> {
	return (await client.put<ClubSocialLink[]>(CLUBS_API_V1 + `/clubs/${clubId}/social-links`, { links })).data;
}

// Archive/Restore
export async function archiveClub(clubId: string, reason?: string): Promise<void> {
	await client.post(CLUBS_API_V1 + `/clubs/${clubId}/archive`, { reason });
}

export async function restoreClub(clubId: string): Promise<void> {
	await client.post(CLUBS_API_V1 + `/clubs/${clubId}/restore`);
}

// Transfer ownership
export async function transferClubOwnership(clubId: string, newOwnerUserId: string, confirmClubName: string): Promise<void> {
	await client.post(CLUBS_API_V1 + `/clubs/${clubId}/transfer`, { newOwnerUserId, confirmClubName });
}

// Export club data
export async function exportClubData(clubId: string): Promise<Blob> {
	const response = await client.get(CLUBS_API_V1 + `/clubs/${clubId}/export`, {
		responseType: "blob",
	});
	return response.data;
}

export async function getClubSettings(clubId: string): Promise<ClubSettings> {
	const endpoint = `/clubs/${clubId}/settings`;
	return (await client.get<ClubSettings>(CLUBS_API_V1 + endpoint)).data;
}

export async function updateClubSettings(clubId: string, settings: Partial<ClubSettings>): Promise<ClubSettings> {
	const endpoint = `/clubs/${clubId}/settings`;
	return (await client.put<ClubSettings>(CLUBS_API_V1 + endpoint, settings)).data;
}

// Form templates with filtering
export interface GetFormTemplatesParams {
	search?: string;
	isActive?: boolean;
	sortBy?: "name" | "createdAt";
	sortOrder?: "asc" | "desc";
}

export async function getClubFormTemplatesFiltered(clubId: string, params?: GetFormTemplatesParams): Promise<FormTemplate[]> {
	const searchParams = new URLSearchParams();
	if (params?.search) searchParams.append("search", params.search);
	if (params?.isActive !== undefined) searchParams.append("isActive", String(params.isActive));
	if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
	if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

	const queryString = searchParams.toString();
	const endpoint = `/clubs/${clubId}/forms${queryString ? `?${queryString}` : ""}`;
	return (await client.get<FormTemplate[]>(CLUBS_API_V1 + endpoint)).data;
}
