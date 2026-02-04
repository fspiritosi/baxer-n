/**
 * Helpers para DataTable - Funciones puras que pueden ejecutarse en servidor o cliente
 * NO incluye 'use client' para que puedan ser importadas desde server actions
 */

import type { DataTableSearchParams, DataTableState } from './types';

// ============================================================================
// CONSTANTES
// ============================================================================

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 0;

// ============================================================================
// PARSE HELPERS
// ============================================================================

/**
 * Parsea los searchParams de la URL a un estado estructurado
 */
export function parseSearchParams(
  searchParams: DataTableSearchParams
): DataTableState {
  // Parsear página (1-indexed en URL, 0-indexed internamente)
  const page = searchParams.page ? Math.max(0, Number(searchParams.page) - 1) : DEFAULT_PAGE;

  // Parsear pageSize
  const pageSize = searchParams.pageSize
    ? Number(searchParams.pageSize)
    : DEFAULT_PAGE_SIZE;

  // Parsear sorting
  const sortBy = (searchParams.sortBy as string) || null;
  const sortOrder = (searchParams.sortOrder as 'asc' | 'desc') || 'asc';

  // Parsear búsqueda
  const search = (searchParams.search as string) || '';

  // Parsear filtros (todos los params que no son los estándar)
  const reservedKeys = ['page', 'pageSize', 'sortBy', 'sortOrder', 'search'];
  const filters: Record<string, string[]> = {};

  Object.entries(searchParams).forEach(([key, value]) => {
    if (!reservedKeys.includes(key) && value) {
      // Si es un array, usar directo; si es string, convertir a array
      filters[key] = Array.isArray(value) ? value : String(value).split(',');
    }
  });

  return { page, pageSize, sortBy, sortOrder, search, filters };
}

/**
 * Convierte el estado a searchParams de URL
 */
export function stateToSearchParams(state: Partial<DataTableState>): URLSearchParams {
  const params = new URLSearchParams();

  // Página (convertir de 0-indexed a 1-indexed para URL)
  if (state.page !== undefined && state.page > 0) {
    params.set('page', String(state.page + 1));
  }

  // PageSize (solo si es diferente al default)
  if (state.pageSize !== undefined && state.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set('pageSize', String(state.pageSize));
  }

  // Sorting
  if (state.sortBy) {
    params.set('sortBy', state.sortBy);
    params.set('sortOrder', state.sortOrder || 'asc');
  }

  // Búsqueda
  if (state.search) {
    params.set('search', state.search);
  }

  // Filtros
  if (state.filters) {
    Object.entries(state.filters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(','));
      }
    });
  }

  return params;
}

// ============================================================================
// PRISMA HELPERS
// ============================================================================

/**
 * Convierte DataTableState a parámetros de Prisma
 *
 * @example
 * ```tsx
 * // En un server action
 * export async function getEmployees(searchParams: DataTableSearchParams) {
 *   const state = parseSearchParams(searchParams);
 *   const prismaParams = stateToPrismaParams(state);
 *
 *   const [data, total] = await Promise.all([
 *     prisma.employee.findMany({
 *       ...prismaParams,
 *       where: {
 *         ...prismaParams.where,
 *         companyId,
 *       },
 *     }),
 *     prisma.employee.count({ where: { ...prismaParams.where, companyId } }),
 *   ]);
 *
 *   return { data, total };
 * }
 * ```
 */
export function stateToPrismaParams(state: DataTableState) {
  const params: {
    skip: number;
    take: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  } = {
    skip: state.page * state.pageSize,
    take: state.pageSize,
  };

  if (state.sortBy) {
    params.orderBy = { [state.sortBy]: state.sortOrder };
  }

  return params;
}

/**
 * Construye cláusula where para búsqueda en múltiples campos
 *
 * @example
 * ```tsx
 * const searchWhere = buildSearchWhere(state.search, ['name', 'email', 'documentNumber']);
 * // Resultado: { OR: [{ name: { contains: 'juan', mode: 'insensitive' } }, ...] }
 * ```
 */
export function buildSearchWhere(search: string, fields: string[]) {
  if (!search) return {};

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: search,
        mode: 'insensitive' as const,
      },
    })),
  };
}

/**
 * Construye cláusula where para filtros de columnas
 *
 * @example
 * ```tsx
 * const filtersWhere = buildFiltersWhere(state.filters, {
 *   status: 'status',           // directo
 *   department: 'departmentId', // mapeo a otro campo
 * });
 * ```
 */
export function buildFiltersWhere(
  filters: Record<string, string[]>,
  columnMap: Record<string, string> = {}
) {
  const where: Record<string, unknown> = {};

  Object.entries(filters).forEach(([columnId, values]) => {
    if (values.length > 0) {
      const field = columnMap[columnId] || columnId;
      where[field] = values.length === 1 ? values[0] : { in: values };
    }
  });

  return where;
}
