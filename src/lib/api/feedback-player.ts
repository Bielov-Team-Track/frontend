import client from "./client";
import {
	FeedbackDto,
	FeedbackListResponseDto,
	Feedback,
	FeedbackListResponse,
	transformFeedbackDto,
	transformFeedbackListResponseDto,
} from "../models/Feedback";

const PREFIX = "/coaching";

/**
 * Get current user's received feedback with pagination
 */
export async function getMyReceivedFeedback(page: number = 1, pageSize: number = 20): Promise<FeedbackListResponse> {
	const endpoint = "/v1/me/feedback/received";
	const params = { page, pageSize };
	const response = await client.get<FeedbackListResponseDto>(PREFIX + endpoint, { params });
	return transformFeedbackListResponseDto(response.data);
}

/**
 * Get feedback by ID
 */
export async function getFeedbackById(id: string): Promise<Feedback> {
	const endpoint = `/v1/feedback/${id}`;
	const response = await client.get<FeedbackDto>(PREFIX + endpoint);
	return transformFeedbackDto(response.data);
}
