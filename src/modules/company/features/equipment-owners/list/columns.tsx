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
import { vehicleTitularityTypeLabels } from '@/shared/utils/mappers';
import type { EquipmentOwnerListItem } from './actions.server';

interface ColumnsProps {
  onEdit: (owner: EquipmentOwnerListItem) => void;
  onDelete: (owner: EquipmentOwnerListItem) => void;
  permissions: ModulePermissions;
}

export function getColumns({ onEdit, onDelete, permissions }: ColumnsProps): ColumnDef<EquipmentOwnerListItem>[] {
  const { canUpdate, canDelete } = permissions;
  const hasAnyAction = canUpdate || canDelete;

  const baseColumns: ColumnDef<EquipmentOwnerListItem>[] = [
    // Nombre
    {
      accessorKey: 'name',
      meta: { title: 'Nombre' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => (
        <span className="font-medium" data-testid={`owner-name-${row.original.id}`}>
          {row.getValue('name')}
        </span>
      ),
    },

    // CUIT
    {
      accessorKey: 'cuit',
      meta: { title: 'CUIT' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="CUIT" />,
      cell: ({ row }) => (
        <span data-testid={`owner-cuit-${row.original.id}`}>{row.getValue('cuit')}</span>
      ),
    },

    // Tipos de Titularidad
    {
      id: 'titularityTypes',
      meta: { title: 'Tipos' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipos" />,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.titularityTypes.map((t) => (
            <Badge key={t.titularityType} variant="outline" className="text-xs">
              {vehicleTitularityTypeLabels[t.titularityType]}
            </Badge>
          ))}
        </div>
      ),
      enableSorting: false,
    },

    // Equipos asignados
    {
      id: 'vehicles',
      accessorFn: (row) => row._count.vehicles,
      meta: { title: 'Equipos' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Equipos" />,
      cell: ({ row }) => (
        <Badge variant="secondary" data-testid={`owner-vehicles-${row.original.id}`}>
          {row.original._count.vehicles} equipo{row.original._count.vehicles !== 1 ? 's' : ''}
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
        const owner = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                data-testid={`owner-actions-${owner.id}`}
              >
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canUpdate && (
                <DropdownMenuItem
                  onClick={() => onEdit(owner)}
                  data-testid={`owner-edit-${owner.id}`}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(owner)}
                  className="text-destructive"
                  data-testid={`owner-delete-${owner.id}`}
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
