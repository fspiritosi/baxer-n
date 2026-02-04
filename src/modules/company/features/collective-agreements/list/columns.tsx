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
import type { CollectiveAgreementListItem } from './actions.server';

interface ColumnsProps {
  onEdit: (collectiveAgreement: CollectiveAgreementListItem) => void;
  onDelete: (collectiveAgreement: CollectiveAgreementListItem) => void;
  permissions: ModulePermissions;
}

export function getColumns({ onEdit, onDelete, permissions }: ColumnsProps): ColumnDef<CollectiveAgreementListItem>[] {
  const { canUpdate, canDelete } = permissions;
  const hasAnyAction = canUpdate || canDelete;

  const baseColumns: ColumnDef<CollectiveAgreementListItem>[] = [
    // Nombre
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Convenio" />,
      cell: ({ row }) => (
        <span className="font-medium" data-testid={`collective-agreement-name-${row.original.id}`}>
          {row.getValue('name')}
        </span>
      ),
    },

    // Sindicato
    {
      id: 'union',
      accessorFn: (row) => row.union.name,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sindicato" />,
      cell: ({ row }) => (
        <span data-testid={`collective-agreement-union-${row.original.id}`}>
          {row.original.union.name}
        </span>
      ),
    },

    // Categorias
    {
      id: 'jobCategories',
      accessorFn: (row) => row._count.jobCategories,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Categorias" />,
      cell: ({ row }) => (
        <Badge variant="secondary" data-testid={`collective-agreement-categories-${row.original.id}`}>
          {row.original._count.jobCategories} categoria
          {row.original._count.jobCategories !== 1 ? 's' : ''}
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
        const collectiveAgreement = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                data-testid={`collective-agreement-actions-${collectiveAgreement.id}`}
              >
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canUpdate && (
                <DropdownMenuItem
                  onClick={() => onEdit(collectiveAgreement)}
                  data-testid={`collective-agreement-edit-${collectiveAgreement.id}`}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(collectiveAgreement)}
                  className="text-destructive"
                  data-testid={`collective-agreement-delete-${collectiveAgreement.id}`}
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
