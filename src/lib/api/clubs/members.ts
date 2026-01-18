import { CLUBS_API_V1 } from "@/lib/constants";
import { ClubMember } from "@/lib/models/Club";
import { CursorRequest, QueryRequest, SortRequest } from "@/lib/models/filteringAndPagination";
import { CursorPagedResult } from "@/lib/models/Pagination";
import client from "../client";

export async function getClubMembers(): Promise<ClubMember[]> {
	const endpoint = "/clubs";
	return (await client.get<ClubMember[]>(CLUBS_API_V1 + endpoint)).data;
}

export interface ClubMembersSearchRequest extends SortRequest, CursorRequest, QueryRequest {
	teamId?: string;
	groupId?: string;
}

export async function searchClubMembers(clubId: string, request: ClubMembersSearchRequest): Promise<CursorPagedResult<ClubMember>> {
	const params = new URLSearchParams();
	console.log(request);
	if (request.query) params.append("Query", encodeURIComponent(request.query.trim()));
	if (request.teamId) params.append("TeamId", request.teamId);
	if (request.groupId) params.append("GroupId", request.groupId);
	if (request.sortBy) params.append("SortBy", request.sortBy);
	if (request.sortDirection) params.append("SortDirection", request.sortDirection);
	if (request.cursor) params.append("Cursor", request.cursor);
	if (request.limit) params.append("Limit", request.limit.toString());

	const endpoint = "/clubs/" + clubId + "/members/search?" + params.toString();

	return (await client.get<CursorPagedResult<ClubMember>>(CLUBS_API_V1 + endpoint)).data;
}
