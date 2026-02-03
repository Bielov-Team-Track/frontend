// =============================================================================
// MEDIA PREVIEW TYPES
// =============================================================================

export type MediaPreviewType = "image" | "video" | "document" | "embed" | "animation";

export type DocumentSubtype = "pdf" | "word" | "excel" | "powerpoint" | "unknown";

export type EmbedProvider = "youtube" | "vimeo" | "unknown";

// Embed info for YouTube/Vimeo videos
export interface EmbedInfo {
	provider: EmbedProvider;
	videoId: string;
	embedUrl: string;
	thumbnailUrl?: string;
}

// Animation types (imported from drills but defined here for modularity)
export interface AnimationPlayerPosition {
	id: string;
	x: number;
	y: number;
	color: string;
	label?: string;
}

export interface AnimationEquipmentItem {
	id: string;
	type: string;
	x: number;
	y: number;
	rotation?: number;
	label?: string;
}

export interface AnimationKeyframe {
	id: string;
	players: AnimationPlayerPosition[];
	ball: { x: number; y: number };
	equipment?: AnimationEquipmentItem[];
}

export interface AnimationData {
	keyframes: AnimationKeyframe[];
	speed: number; // ms per frame transition
}

export interface MediaItem {
	id: string;
	type: MediaPreviewType;
	url: string;
	thumbnailUrl?: string;
	fileName?: string;
	mimeType?: string;
	fileSize?: number;
	// For embed type
	embedInfo?: EmbedInfo;
	// For animation type
	animation?: AnimationData;
}

export interface MediaThumbnailProps {
	item: MediaItem;
	size?: "sm" | "md" | "lg";
	onClick?: () => void;
	className?: string;
}

export interface MediaLightboxProps {
	items: MediaItem[];
	initialIndex?: number;
	isOpen: boolean;
	onClose: () => void;
}

export interface MediaGalleryProps {
	items: MediaItem[];
	maxVisible?: number;
	thumbnailSize?: "sm" | "md" | "lg";
	className?: string;
}

export interface ImagePreviewProps {
	item: MediaItem;
	className?: string;
}

export interface VideoPreviewProps {
	item: MediaItem;
	className?: string;
}

export interface DocumentPreviewProps {
	item: MediaItem;
	className?: string;
}

export interface AnimationPreviewProps {
	item: MediaItem;
	className?: string;
	showControls?: boolean;
}

export interface EmbedPreviewProps {
	item: MediaItem;
	className?: string;
	autoPlay?: boolean;
}
