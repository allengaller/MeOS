export interface PaginationInput {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationResult {
  data: unknown[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function getPaginationParams(input: PaginationInput): { take: number; skip: number } {
  const page = Math.max(1, input.page || 1);
  const pageSize = Math.min(100, Math.max(1, input.pageSize || input.limit || 20));
  const skip = input.offset !== undefined ? input.offset : (page - 1) * pageSize;

  return { take: pageSize, skip };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  input: PaginationInput
): PaginationResult {
  const pageSize = Math.min(100, Math.max(1, input.pageSize || input.limit || 20));
  const page = input.offset !== undefined ? Math.floor(input.offset / pageSize) + 1 : (input.page || 1);
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data as unknown[],
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}