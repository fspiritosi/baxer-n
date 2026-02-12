'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Building2, Phone, Mail, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/shared/components/common/DataTable';
import type { ModulePermissions } from '@/shared/lib/permissions';
import type { Supplier } from '../../shared/types';
import { SUPPLIER_TAX_CONDITION_LABELS, SUPPLIER_STATUS_LABELS } from '../../shared/types';

interface ColumnsProps {
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  permissions: ModulePermissions;
}

export function getColumns({ onEdit, onDelete, permissions }: ColumnsProps): ColumnDef<Supplier>[] {
  const { canUpdate, canDelete } = permissions;
  const hasAnyAction = canUpdate || canDelete;

  const baseColumns: ColumnDef<Supplier>[] = [
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
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'businessName',
      meta: { title: 'Razón Social' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Razón Social" />,
      cell: ({ row }) => {
        const supplier = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <Link
                href={`/dashboard/commercial/suppliers/${supplier.id}`}
                className="font-medium hover:underline"
              >
                {supplier.businessName}
              </Link>
              {supplier.tradeName && (
                <p className="text-xs text-muted-foreground">{supplier.tradeName}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'taxId',
      meta: { title: 'CUIT' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="CUIT" />,
      cell: ({ row }) => {
        const taxId = row.original.taxId;
        // Formatear CUIT: XX-XXXXXXXX-X
        if (taxId.length === 11) {
          return (
            <span className="font-mono text-sm">
              {taxId.substring(0, 2)}-{taxId.substring(2, 10)}-{taxId.substring(10)}
            </span>
          );
        }
        return <span className="font-mono text-sm">{taxId}</span>;
      },
    },
    {
      accessorKey: 'taxCondition',
      meta: { title: 'Condición IVA' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Condición IVA" />,
      cell: ({ row }) => {
        const label = SUPPLIER_TAX_CONDITION_LABELS[row.original.taxCondition];
        return <span className="text-sm">{label}</span>;
      },
    },
    {
      accessorKey: 'email',
      meta: { title: 'Email' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => {
        const email = row.original.email;
        if (!email) return '-';
        return (
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="truncate max-w-[200px]">{email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'phone',
      meta: { title: 'Teléfono' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
      cell: ({ row }) => {
        const phone = row.original.phone;
        if (!phone) return '-';
        return (
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{phone}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'paymentTermDays',
      meta: { title: 'Plazo de Pago' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Plazo de Pago" />,
      cell: ({ row }) => {
        const days = row.original.paymentTermDays;
        if (days === null || days === undefined) return '-';
        if (days === 0) return <Badge variant="outline">Contado</Badge>;
        return (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{days} días</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      meta: { title: 'Estado' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === 'ACTIVE'
                ? 'default'
                : status === 'BLOCKED'
                ? 'destructive'
                : 'secondary'
            }
          >
            {SUPPLIER_STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
  ];

  // Solo agregar columna de acciones si el usuario tiene al menos un permiso
  if (hasAnyAction) {
    baseColumns.push({
      id: 'actions',
      cell: ({ row }) => {
        const supplier = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/commercial/suppliers/${supplier.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalle
                </Link>
              </DropdownMenuItem>
              {canUpdate && (
                <DropdownMenuItem onClick={() => onEdit(supplier)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canUpdate && canDelete && <DropdownMenuSeparator />}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(supplier)}
                  className="text-destructive"
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
