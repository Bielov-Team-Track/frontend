import { UserProfile } from "./User";

export interface Message {
	id: string;
	sender: UserProfile;
	content: string;
	sentAt: Date;
	isEdited: boolean;
	editedAt?: Date;
	read: boolean;
	chatId: string;
	attachments?: Attachment[];
	embeds?: MessageEmbed[];
	replyTo?: MessageSummary;
	forwardedFrom?: MessageSummary;
	isDeleted: boolean;
	reactions: ReactionSummary[];
	/** Client-only: tracks optimistic messages before server confirmation */
	_optimisticId?: string;
	/** Client-only: 'sending' while awaiting server, 'error' on failure */
	_status?: "sending" | "error";
}

export interface Chat {
	imageUrl?: string;
	id: string;
	title: string;
	participants: ChatParticipant[];
	lastMessage: Message;
	unreadCount: number;
	createdAt: Date;
	source?: ChatSource;
}

export interface ChatParticipant {
	id: string;
	userId: string;
	role: "Member" | "Admin"; // ADD
	joinedAt: Date;
	lastReadAt?: Date;
	lastReadMessageId?: string;
	userProfile?: UserProfile;
}

export interface Attachment {
	id: string;
	fileName: string;
	fileUrl: string;
	thumbHash?: string;
	contentType: string;
	fileSize: number;
	order: number;
}

export interface MessageEmbed {
	id: string;
	url: string;
	title?: string;
	thumbnailUrl?: string;
	provider: string;
	embedUrl: string;
}
export interface MessageSummary {
	id: string;
	content: string;
	sender: UserProfile;
}

export interface ReactionSummary {
	emoji: string;
	userIds: string[];
}

export interface MessageReaction {
	emoji: string;
	userId: string;
	messageId: string;
}

export interface ChatSource {
	type: "event" | "team";
	id: string;
	name: string;
	imageUrl?: string;
}
