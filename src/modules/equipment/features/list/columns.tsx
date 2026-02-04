'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

import { DataTableColumnHeader } from '@/shared/components/common/DataTable';
import type { ModulePermissions } from '@/shared/lib/permissions';
import {
  getBadgeConfig,
  vehicleConditionBadges,
  vehicleStatusBadges,
} from '@/shared/utils/mappers';
import type { EquipmentListItem } from './actions.server';

interface ColumnsOptions {
  onSoftDelete: (vehicle: EquipmentListItem) => void;
  onReactivate: (id: string) => void;
  permissions: ModulePermissions;
}

export function getColumns({ onSoftDelete, onReactivate, permissions }: ColumnsOptions): ColumnDef<EquipmentListItem>[] {
  const { canView, canUpdate, canDelete } = permissions;
  const hasAnyAction = canView || canUpdate || canDelete;

  const baseColumns: ColumnDef<EquipmentListItem>[] = [
    // Columna de selección
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todos"
          data-testid="select-all-checkbox"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
          data-testid={`select-row-${row.original.id}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // N° Interno
    {
      accessorKey: 'internNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="N° Interno" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/equipment/${row.original.id}`}
          className="font-medium text-primary hover:underline"
          data-testid={`equipment-intern-${row.original.id}`}
        >
          {row.original.internNumber || '-'}
        </Link>
      ),
    },

    // Dominio
    {
      accessorKey: 'domain',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Dominio" />
      ),
      cell: ({ row }) => (
        <span data-testid={`equipment-domain-${row.original.id}`}>
          {row.original.domain || '-'}
        </span>
      ),
    },

    // Tipo
    {
      id: 'type',
      accessorFn: (row) => row.type?.name || '',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tipo" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.type?.name || '-'}</Badge>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.original.type?.id);
      },
    },

    // Marca
    {
      id: 'brand',
      accessorFn: (row) => row.brand?.name || '',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Marca" />
      ),
      cell: ({ row }) => <span>{row.original.brand?.name || '-'}</span>,
      filterFn: (row, id, value) => {
        return value.includes(row.original.brand?.id);
      },
    },

    // Modelo
    {
      id: 'model',
      accessorFn: (row) => row.model?.name || '',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Modelo" />
      ),
      cell: ({ row }) => <span>{row.original.model?.name || '-'}</span>,
    },

    // Año
    {
      accessorKey: 'year',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Año" />
      ),
    },

    // Estado
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estado" />
      ),
      cell: ({ row }) => {
        const badge = getBadgeConfig(row.original.status, vehicleStatusBadges);
        return (
          <Badge variant={badge.variant} data-testid={`equipment-status-${row.original.id}`}>
            {badge.label}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },

    // Condición
    {
      accessorKey: 'condition',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Condición" />
      ),
      cell: ({ row }) => {
        const badge = getBadgeConfig(row.original.condition, vehicleConditionBadges);
        return (
          <Badge variant={badge.variant} data-testid={`equipment-condition-${row.original.id}`}>
            {badge.label}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },

    // Activo
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Activo" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.original.isActive ? 'default' : 'secondary'}
          data-testid={`equipment-active-${row.original.id}`}
        >
          {row.original.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        const isActiveStr = row.original.isActive ? 'true' : 'false';
        return value.includes(isActiveStr);
      },
    },
  ];

  // Solo agregar columna de acciones si el usuario tiene al menos un permiso
  if (hasAnyAction) {
    baseColumns.push({
      id: 'actions',
      cell: ({ row }) => {
        const vehicle = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                data-testid={`equipment-actions-${vehicle.id}`}
              >
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canView && (
                <DropdownMenuItem asChild data-testid={`equipment-view-${vehicle.id}`}>
                  <Link href={`/dashboard/equipment/${vehicle.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalle
                  </Link>
                </DropdownMenuItem>
              )}
              {canUpdate && (
                <DropdownMenuItem asChild data-testid={`equipment-edit-${vehicle.id}`}>
                  <Link href={`/dashboard/equipment/${vehicle.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
              )}
              {(canView || canUpdate) && canDelete && <DropdownMenuSeparator />}
              {canDelete && vehicle.isActive && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onSoftDelete(vehicle)}
                  data-testid={`equipment-delete-${vehicle.id}`}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Dar de baja
                </DropdownMenuItem>
              )}
              {canUpdate && !vehicle.isActive && (
                <DropdownMenuItem
                  onClick={() => onReactivate(vehicle.id)}
                  data-testid={`equipment-reactivate-${vehicle.id}`}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reactivar
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
