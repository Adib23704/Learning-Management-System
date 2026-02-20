export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export function parsePaginationParams(query: {
  cursor?: string;
  limit?: string;
}): PaginationParams {
  return {
    cursor: query.cursor || undefined,
    limit: Math.min(Number(query.limit) || 20, 50),
  };
}

export function buildPaginationArgs(params: PaginationParams) {
  const take = (params.limit ?? 20) + 1;
  return {
    take,
    ...(params.cursor && {
      cursor: { id: params.cursor },
      skip: 1,
    }),
  };
}

export function buildPaginatedResult<T extends { id: string }>(
  items: T[],
  limit: number,
): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore ? data[data.length - 1].id : null;
  return { data, meta: { nextCursor, hasMore } };
}
