/**
 * Interface pour les réponses API standard
 * Basé sur ApiResponse<T>
 */
export interface IApiResponse<T> {
  status_code: number;
  status_message: string;
  data: T;
}

