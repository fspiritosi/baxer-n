/**
 * Tipos globales del proyecto
 *
 * Aquí se exportan los tipos que se usan en múltiples features.
 * Los tipos específicos de cada feature deben estar en su carpeta types/
 */

// Re-exportar tipos de Prisma cuando se generen
// export * from '@/generated/prisma';

/**
 * Tipo base para respuestas de servidor
 */
export interface ServerResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Tipo para paginación
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Tipo para respuestas paginadas
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Tipo para filtros de búsqueda genéricos
 */
export interface SearchFilters {
  search?: string;
  [key: string]: string | number | boolean | undefined;
}
