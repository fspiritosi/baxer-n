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
import type { SectorListItem } from './actions.server';

interface ColumnsProps {
  onEdit: (sector: SectorListItem) => void;
  onDelete: (sector: SectorListItem) => void;
  permissions: ModulePermissions;
}

export function getColumns({ onEdit, onDelete, permissions }: ColumnsProps): ColumnDef<SectorListItem>[] {
  const { canUpdate, canDelete } = permissions;
  const hasAnyAction = canUpdate || canDelete;

  const baseColumns: ColumnDef<SectorListItem>[] = [
    // Nombre
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => (
        <span className="font-medium" data-testid={`sector-name-${row.original.id}`}>
          {row.getValue('name')}
        </span>
      ),
    },

    // Descripción corta
    {
      accessorKey: 'shortDescription',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Descripción" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground" data-testid={`sector-description-${row.original.id}`}>
          {row.getValue('shortDescription') || '-'}
        </span>
      ),
      enableSorting: false,
    },

    // Vehículos
    {
      id: 'vehicles',
      accessorFn: (row) => row._count.vehicles,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vehículos" />,
      cell: ({ row }) => (
        <Badge variant="secondary" data-testid={`sector-vehicles-${row.original.id}`}>
          {row.original._count.vehicles} vehículo{row.original._count.vehicles !== 1 ? 's' : ''}
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
        const sector = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                data-testid={`sector-actions-${sector.id}`}
              >
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canUpdate && (
                <DropdownMenuItem
                  onClick={() => onEdit(sector)}
                  data-testid={`sector-edit-${sector.id}`}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(sector)}
                  className="text-destructive"
                  data-testid={`sector-delete-${sector.id}`}
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
