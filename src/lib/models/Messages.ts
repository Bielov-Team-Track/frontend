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
	replyTo?: MessageSummary;
	forwardedFrom?: MessageSummary;
	isDeleted: boolean;
	reactions: Reaction[];
}

export interface Chat {
	imageUrl?: string;
	id: string;
	title: string;
	participantIds: string[];
	participants: UserProfile[];
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
	userProfile?: UserProfile;
}

export interface Attachment {
	id: string;
	fileName: string;
	fileType: string;
	fileSize: number;
	downloadUrl: string;
}
export interface MessageSummary {
	id: string;
	content: string;
	sender: UserProfile;
}

export interface Reaction {
	emoji: string;
	count: number;
	hasReacted: boolean;
	userIds: string[];
}

export interface ChatSource {
	type: "event" | "team";
	id: string;
	name: string;
	imageUrl?: string;
}
