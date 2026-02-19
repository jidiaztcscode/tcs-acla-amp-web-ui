export interface PaginatedResponse<T> {
  items: T[];
  totalRecords: number;
  totalPages: number;
  page: number;
  pageSize: number;
}
