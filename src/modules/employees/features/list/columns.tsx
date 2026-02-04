'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Pencil, Trash2, UserX } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
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
import { employeeStatusBadges, getBadgeConfig } from '@/shared/utils/mappers';
import type { EmployeeListItem } from './actions.server';

/** Genera las iniciales del empleado para el avatar fallback */
function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getColumns(permissions: ModulePermissions): ColumnDef<EmployeeListItem>[] {
  const { canView, canUpdate, canDelete } = permissions;
  const hasAnyAction = canView || canUpdate || canDelete;

  const baseColumns: ColumnDef<EmployeeListItem>[] = [
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

  // Legajo
  {
    accessorKey: 'employeeNumber',
    meta: { title: 'Legajo' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Legajo" />
    ),
    cell: ({ row }) => (
      <span className="font-medium" data-testid={`employee-number-${row.original.id}`}>
        {row.getValue('employeeNumber')}
      </span>
    ),
  },

  // Nombre completo con foto
  {
    id: 'fullName',
    accessorFn: (row) => `${row.lastName}, ${row.firstName}`,
    meta: { title: 'Nombre' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      const { firstName, lastName, pictureUrl } = row.original;
      return (
        <div className="flex items-center gap-3" data-testid={`employee-name-${row.original.id}`}>
          <Avatar className="h-8 w-8">
            {pictureUrl ? (
              <AvatarImage src={pictureUrl} alt={`${firstName} ${lastName}`} />
            ) : null}
            <AvatarFallback className="text-xs">
              {getInitials(firstName, lastName)}
            </AvatarFallback>
          </Avatar>
          <Link
            href={`/dashboard/employees/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {lastName}, {firstName}
          </Link>
        </div>
      );
    },
  },

  // Documento
  {
    id: 'document',
    accessorKey: 'documentNumber',
    meta: { title: 'Documento' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Documento" />
    ),
    cell: ({ row }) => (
      <span>
        {row.original.identityDocumentType} {row.original.documentNumber}
      </span>
    ),
  },

  // CUIL
  {
    accessorKey: 'cuil',
    meta: { title: 'CUIL' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CUIL" />
    ),
    cell: ({ row }) => <span>{row.getValue('cuil')}</span>,
  },

  // Puesto
  {
    id: 'jobPosition',
    accessorFn: (row) => row.jobPosition?.name || '',
    meta: { title: 'Puesto' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Puesto" />
    ),
    cell: ({ row }) => (
      <span>{row.original.jobPosition?.name || '-'}</span>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.original.jobPosition?.id);
    },
  },

  // Tipo de Contrato
  {
    id: 'contractType',
    accessorFn: (row) => row.contractType?.name || '',
    meta: { title: 'Contrato' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contrato" />
    ),
    cell: ({ row }) => (
      <span>{row.original.contractType?.name || '-'}</span>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.original.contractType?.id);
    },
  },

  // Estado
  {
    accessorKey: 'status',
    meta: { title: 'Estado' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const badge = getBadgeConfig(status as keyof typeof employeeStatusBadges, employeeStatusBadges);
      return (
        <Badge variant={badge.variant} data-testid={`employee-status-${row.original.id}`}>
          {badge.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  ];

  // Solo agregar columna de acciones si el usuario tiene al menos un permiso
  if (hasAnyAction) {
    baseColumns.push({
      id: 'actions',
      cell: ({ row }) => {
        const employee = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                data-testid={`employee-actions-${employee.id}`}
              >
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canView && (
                <DropdownMenuItem asChild data-testid={`employee-view-${employee.id}`}>
                  <Link href={`/dashboard/employees/${employee.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalle
                  </Link>
                </DropdownMenuItem>
              )}
              {canUpdate && (
                <DropdownMenuItem asChild data-testid={`employee-edit-${employee.id}`}>
                  <Link href={`/dashboard/employees/${employee.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
              )}
              {(canView || canUpdate) && canDelete && <DropdownMenuSeparator />}
              {canUpdate && (
                <DropdownMenuItem asChild data-testid={`employee-terminate-${employee.id}`}>
                  <Link href={`/dashboard/employees/${employee.id}/terminate`}>
                    <UserX className="mr-2 h-4 w-4" />
                    Dar de baja
                  </Link>
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  className="text-destructive"
                  data-testid={`employee-delete-${employee.id}`}
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
