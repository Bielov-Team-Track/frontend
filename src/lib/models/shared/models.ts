export type ContextType = "club" | "group" | "team" | "event" | "None" | "Club" | "Group" | "Team" | "Event";

// Shared media types
export type MediaType = "image" | "video" | "document" | "videoEmbed";

export interface Media {
	id: string;
	mediaType: MediaType;
	url: string;
	thumbHash?: string;
	thumbnailUrl?: string;
	fileName?: string;
	fileSize?: number;
	mimeType?: string;
	embedProvider?: "youtube" | "vimeo";
	embedId?: string;
	displayOrder: number;
}

// Shared reaction types
export interface ReactionSummary {
	emoji: string;
	count: number;
	hasReacted: boolean;
}

// Shared upload types
export interface UploadUrlResponse {
	mediaId: string;
	uploadUrl: string;
}
