/**
 * Interface pour les réponses paginées
 * Basé sur PaginatedResponse<T>
 */
export interface IPaginatedResponse<T> {
  statusCode: number;
  statusMessage: string;
  data: IPaginatedData<T>;
}

export interface IPaginatedData<T> {
  total: number;
  pageSize: number;
  page: number;
  items: T[];
}

