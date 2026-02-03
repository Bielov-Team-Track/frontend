// =============================================================================
// DRILL ATTACHMENTS EXPORTS
// =============================================================================

export { default as DrillAttachments } from "./DrillAttachments";
export { default as DrillAttachmentInput } from "./DrillAttachmentInput";
export { default as EmbedPreview } from "./EmbedPreview";

export type { AttachmentInput, AttachmentType } from "./DrillAttachmentInput";

export {
	isEmbedUrl,
	isYouTubeUrl,
	isVimeoUrl,
	parseEmbedUrl,
	getYouTubeVideoId,
	getVimeoVideoId,
	getProviderDisplayName,
	type EmbedInfo,
	type EmbedProvider,
} from "./embedUtils";
