import { AxiosError } from "axios";
import client from "./client";
import { Comment } from "../models/Comment";

const PREFIX = "/events/v1";

export async function loadComments(
	eventId: string,
	cursor?: string,
	limit?: number,
): Promise<Comment[]> {
	const endpoint = "/events/" + eventId + "/comments";
	try {
		return (
			await client.get<Comment[]>(PREFIX + endpoint, {
				params: { cursor, limit },
			})
		).data;
	} catch (error: any) {
		console.error("Error loading comments:", error.response);
		return [];
	}
}

export async function createComment(
	eventId: string,
	content: string,
): Promise<Comment> {
	const endpoint = "/events/" + eventId + "/comments";
	return (await client.post<Comment>(PREFIX + endpoint, { content })).data;
}
