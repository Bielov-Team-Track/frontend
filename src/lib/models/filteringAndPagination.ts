export interface SortRequest {
	sortBy?: string;
	sortDirection?: SortDirection;
}

export interface CursorRequest {
	cursor?: string;
	limit?: number;
}

export interface QueryRequest {
	query?: string;
	excludeIds?: string[];
}

export enum SortDirection {
	Ascending = "Ascending",
	Descending = "Descending",
}
