export interface TeamEvent {
	id: string;
	name: string;
	description?: string;
	startTime: Date;
	endTime: Date;
	location?: string;
	createdAt: Date;
}

export interface TeamPost {
	id: string;
	authorName: string;
	content: string;
	createdAt: Date;
	likes: number;
	comments: number;
}
