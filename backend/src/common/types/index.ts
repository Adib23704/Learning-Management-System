export interface PaginationQuery {
  cursor?: string;
  limit?: string;
}

export interface SortQuery {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
