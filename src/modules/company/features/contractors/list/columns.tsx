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
import type { ContractorListItem } from './actions.server';

interface ColumnsProps {
  onEdit: (contractor: ContractorListItem) => void;
  onDelete: (contractor: ContractorListItem) => void;
  permissions: ModulePermissions;
}

export function getColumns({ onEdit, onDelete, permissions }: ColumnsProps): ColumnDef<ContractorListItem>[] {
  const { canUpdate, canDelete } = permissions;
  const hasAnyAction = canUpdate || canDelete;

  const baseColumns: ColumnDef<ContractorListItem>[] = [
    // Nombre
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => (
        <span className="font-medium" data-testid={`contractor-name-${row.original.id}`}>
          {row.getValue('name')}
        </span>
      ),
    },

    // CUIT
    {
      accessorKey: 'taxId',
      header: ({ column }) => <DataTableColumnHeader column={column} title="CUIT" />,
      cell: ({ row }) => (
        <span data-testid={`contractor-taxId-${row.original.id}`}>
          {row.getValue('taxId') || '-'}
        </span>
      ),
    },

    // Email
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => (
        <span data-testid={`contractor-email-${row.original.id}`}>
          {row.getValue('email') || '-'}
        </span>
      ),
    },

    // Telefono
    {
      accessorKey: 'phone',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Telefono" />,
      cell: ({ row }) => (
        <span data-testid={`contractor-phone-${row.original.id}`}>
          {row.getValue('phone') || '-'}
        </span>
      ),
      enableSorting: false,
    },

    // Vehiculos asignados
    {
      id: 'vehicleAllocations',
      accessorFn: (row) => row._count.vehicleAllocations,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vehiculos" />,
      cell: ({ row }) => (
        <Badge variant="outline" data-testid={`contractor-vehicles-${row.original.id}`}>
          {row.original._count.vehicleAllocations} vehiculo
          {row.original._count.vehicleAllocations !== 1 ? 's' : ''}
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
        const contractor = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                data-testid={`contractor-actions-${contractor.id}`}
              >
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canUpdate && (
                <DropdownMenuItem
                  onClick={() => onEdit(contractor)}
                  data-testid={`contractor-edit-${contractor.id}`}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(contractor)}
                  className="text-destructive"
                  data-testid={`contractor-delete-${contractor.id}`}
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
