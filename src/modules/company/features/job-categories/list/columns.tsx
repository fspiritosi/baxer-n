'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

import { DataTableColumnHeader } from '@/shared/components/common/DataTable';
import type { ModulePermissions } from '@/shared/lib/permissions';
import type { JobCategoryListItem } from './actions.server';

interface ColumnsProps {
  onEdit: (jobCategory: JobCategoryListItem) => void;
  onDelete: (jobCategory: JobCategoryListItem) => void;
  permissions: ModulePermissions;
}

export function getColumns({ onEdit, onDelete, permissions }: ColumnsProps): ColumnDef<JobCategoryListItem>[] {
  const { canUpdate, canDelete } = permissions;
  const hasAnyAction = canUpdate || canDelete;

  const baseColumns: ColumnDef<JobCategoryListItem>[] = [
    // Nombre
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => (
        <span className="font-medium" data-testid={`job-category-name-${row.original.id}`}>
          {row.getValue('name')}
        </span>
      ),
    },

    // Convenio
    {
      id: 'agreement',
      accessorFn: (row) => row.agreement.name,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Convenio" />,
      cell: ({ row }) => (
        <span data-testid={`job-category-agreement-${row.original.id}`}>
          {row.original.agreement.name}
        </span>
      ),
    },

    // Sindicato
    {
      id: 'union',
      accessorFn: (row) => row.agreement.union.name,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sindicato" />,
      cell: ({ row }) => (
        <span data-testid={`job-category-union-${row.original.id}`}>
          {row.original.agreement.union.name}
        </span>
      ),
    },

    // Empleados
    {
      id: 'employees',
      accessorFn: (row) => row._count.employees,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Empleados" />,
      cell: ({ row }) => (
        <Badge variant="secondary" data-testid={`job-category-employees-${row.original.id}`}>
          {row.original._count.employees} empleado{row.original._count.employees !== 1 ? 's' : ''}
        </Badge>
      ),
      enableSorting: false,
    },
  ];

  // Solo agregar columna de acciones si el usuario tiene al menos un permiso
  if (hasAnyAction) {
    baseColumns.push({
      id: 'actions',
      cell: ({ row }) => {
        const jobCategory = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                data-testid={`job-category-actions-${jobCategory.id}`}
              >
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canUpdate && (
                <DropdownMenuItem
                  onClick={() => onEdit(jobCategory)}
                  data-testid={`job-category-edit-${jobCategory.id}`}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(jobCategory)}
                  className="text-destructive"
                  data-testid={`job-category-delete-${jobCategory.id}`}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return baseColumns;
}
