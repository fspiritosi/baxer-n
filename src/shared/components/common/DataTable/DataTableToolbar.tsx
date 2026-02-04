'use client';

import { X } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

import { DataTableFacetedFilter } from './DataTableFacetedFilter';
import { DataTableViewOptions } from './DataTableViewOptions';
import type { DataTableToolbarProps } from './types';

/**
 * Barra de herramientas con búsqueda, filtros y acciones
 *
 * @example
 * ```tsx
 * <DataTableToolbar
 *   table={table}
 *   searchPlaceholder="Buscar empleados..."
 *   searchColumn="name"
 *   facetedFilters={[
 *     { columnId: 'status', title: 'Estado', options: statusOptions },
 *   ]}
 *   toolbarActions={<Button>Nueva acción</Button>}
 * />
 * ```
 */
export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Buscar...',
  searchColumn,
  facetedFilters = [],
  showColumnToggle = true,
  toolbarActions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  // Si hay searchColumn específico, usar ese; si no, usar filtro global
  const searchValue = searchColumn
    ? (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''
    : (table.getState().globalFilter as string) ?? '';

  const handleSearchChange = (value: string) => {
    if (searchColumn) {
      table.getColumn(searchColumn)?.setFilterValue(value);
    } else {
      table.setGlobalFilter(value);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* Input de búsqueda */}
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
          data-testid="search-input"
        />

        {/* Filtros faceteados */}
        {facetedFilters.map((filter) => {
          const column = table.getColumn(filter.columnId);
          if (!column) return null;

          return (
            <DataTableFacetedFilter
              key={filter.columnId}
              column={column}
              title={filter.title}
              options={filter.options}
            />
          );
        })}

        {/* Botón para limpiar filtros */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
            data-testid="clear-filters"
          >
            Limpiar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Acciones personalizadas */}
        {toolbarActions}

        {/* Toggle de columnas */}
        {showColumnToggle && <DataTableViewOptions table={table} />}
      </div>
    </div>
  );
}
