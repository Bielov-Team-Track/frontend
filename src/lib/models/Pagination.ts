/**
 * Generic cursor-based pagination result.
 * Used across all paginated API responses.
 */
export interface CursorPagedResult<T> {
	items: T[];
	nextCursor?: string;
	hasMore: boolean;
	totalCount?: number;
}

/**
 * Generic cursor-based pagination filters.
 * Extend this for domain-specific filters.
 */
export interface CursorPaginationFilters {
	cursor?: string;
	limit?: number;
}

/**
 * Sort direction for paginated queries.
 */
export enum SortDirection {
	Ascending = "Ascending",
	Descending = "Descending",
}

/**
 * Generic page-based pagination result.
 * Used for traditional page/pageSize pagination.
 */
export interface PaginatedResponse<T> {
	items: T[];
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}
