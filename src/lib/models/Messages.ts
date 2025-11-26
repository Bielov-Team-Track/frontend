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
}

export interface Attachment {
	id: string;
	fileName: string;
	fileType: string;
	fileSize: number;
	downloadUrl: string;
}
