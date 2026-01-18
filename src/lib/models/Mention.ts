export interface MentionSuggestion {
	userId: string;
	displayName: string;
	avatarUrl?: string;
}

export interface ParsedMention {
	userId?: string;
	isEveryone: boolean;
	displayName: string;
}
