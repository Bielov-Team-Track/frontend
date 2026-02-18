import client from "./client";
import {
	FeedbackDto,
	FeedbackListResponseDto,
	Feedback,
	FeedbackListResponse,
	CanCreateFeedbackResponse,
	transformFeedbackDto,
	transformFeedbackListResponseDto,
} from "../models/Feedback";
import type {
	CreateFeedbackRequest,
	UpdateFeedbackRequest,
	UpdatePraiseRequest,
	AddImprovementPointRequest,
	CreateImprovementPointMediaDto,
	CreatePraiseDto,
} from "../models/Feedback";

const PREFIX = "/coaching";

export const feedbackCoachApi = {
	createFeedback: async (dto: CreateFeedbackRequest): Promise<Feedback> => {
		const { data } = await client.post<FeedbackDto>(`${PREFIX}/v1/feedback`, dto);
		return transformFeedbackDto(data);
	},

	updateFeedback: async (id: string, dto: UpdateFeedbackRequest): Promise<Feedback> => {
		const { data } = await client.put<FeedbackDto>(`${PREFIX}/v1/feedback/${id}`, dto);
		return transformFeedbackDto(data);
	},

	deleteFeedback: async (id: string): Promise<void> => {
		await client.delete(`${PREFIX}/v1/feedback/${id}`);
	},

	getMyGivenFeedback: async (page = 1, pageSize = 20): Promise<FeedbackListResponse> => {
		const { data } = await client.get<FeedbackListResponseDto>(`${PREFIX}/v1/me/feedback/given`, {
			params: { page, pageSize },
		});
		return transformFeedbackListResponseDto(data);
	},

	shareFeedback: async (id: string, share: boolean): Promise<Feedback> => {
		const { data } = await client.put<FeedbackDto>(`${PREFIX}/v1/feedback/${id}/share`, null, {
			params: { share },
		});
		return transformFeedbackDto(data);
	},

	canCreateFeedback: async (params: {
		recipientUserId: string;
		eventId?: string;
		clubId?: string;
	}): Promise<CanCreateFeedbackResponse> => {
		const { data } = await client.get<CanCreateFeedbackResponse>(`${PREFIX}/v1/feedback/can-create`, { params });
		return data;
	},

	// Improvement points
	addImprovementPoint: async (feedbackId: string, dto: AddImprovementPointRequest): Promise<Feedback> => {
		const { data } = await client.post<FeedbackDto>(
			`${PREFIX}/v1/feedback/${feedbackId}/improvement-points`,
			dto
		);
		return transformFeedbackDto(data);
	},

	updateImprovementPoint: async (
		feedbackId: string,
		pointId: string,
		dto: { description?: string }
	): Promise<Feedback> => {
		const { data } = await client.put<FeedbackDto>(
			`${PREFIX}/v1/feedback/${feedbackId}/improvement-points/${pointId}`,
			dto
		);
		return transformFeedbackDto(data);
	},

	removeImprovementPoint: async (feedbackId: string, pointId: string): Promise<Feedback> => {
		const { data } = await client.delete<FeedbackDto>(
			`${PREFIX}/v1/feedback/${feedbackId}/improvement-points/${pointId}`
		);
		return transformFeedbackDto(data);
	},

	// Drills on improvement points
	addDrillToPoint: async (feedbackId: string, pointId: string, drillId: string): Promise<Feedback> => {
		const { data } = await client.post<FeedbackDto>(
			`${PREFIX}/v1/feedback/${feedbackId}/improvement-points/${pointId}/drills/${drillId}`
		);
		return transformFeedbackDto(data);
	},

	removeDrillFromPoint: async (feedbackId: string, pointId: string, drillId: string): Promise<Feedback> => {
		const { data } = await client.delete<FeedbackDto>(
			`${PREFIX}/v1/feedback/${feedbackId}/improvement-points/${pointId}/drills/${drillId}`
		);
		return transformFeedbackDto(data);
	},

	// Media on improvement points
	addMediaToPoint: async (
		feedbackId: string,
		pointId: string,
		dto: CreateImprovementPointMediaDto
	): Promise<Feedback> => {
		const { data } = await client.post<FeedbackDto>(
			`${PREFIX}/v1/feedback/${feedbackId}/improvement-points/${pointId}/media`,
			dto
		);
		return transformFeedbackDto(data);
	},

	removeMediaFromPoint: async (feedbackId: string, pointId: string, mediaId: string): Promise<Feedback> => {
		const { data } = await client.delete<FeedbackDto>(
			`${PREFIX}/v1/feedback/${feedbackId}/improvement-points/${pointId}/media/${mediaId}`
		);
		return transformFeedbackDto(data);
	},

	// Praise
	addPraise: async (feedbackId: string, dto: CreatePraiseDto): Promise<Feedback> => {
		const { data } = await client.post<FeedbackDto>(`${PREFIX}/v1/feedback/${feedbackId}/praise`, dto);
		return transformFeedbackDto(data);
	},

	updatePraise: async (feedbackId: string, dto: UpdatePraiseRequest): Promise<Feedback> => {
		const { data } = await client.put<FeedbackDto>(`${PREFIX}/v1/feedback/${feedbackId}/praise`, dto);
		return transformFeedbackDto(data);
	},

	removePraise: async (feedbackId: string): Promise<Feedback> => {
		const { data } = await client.delete<FeedbackDto>(`${PREFIX}/v1/feedback/${feedbackId}/praise`);
		return transformFeedbackDto(data);
	},
};
