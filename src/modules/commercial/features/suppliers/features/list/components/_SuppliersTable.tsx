'use client';

import { DataTable } from '@/shared/components/common/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import type { Supplier } from '../../../shared/types';
import { SUPPLIER_TAX_CONDITION_LABELS, SUPPLIER_STATUS_LABELS } from '../../../shared/types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { MoreHorizontal, Eye, Edit, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteSupplier } from '../actions.server';
import { logger } from '@/shared/lib/logger';
import { toast } from 'sonner';

interface SuppliersTableProps {
  suppliers: Supplier[];
}

export function _SuppliersTable({ suppliers }: SuppliersTableProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, businessName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el proveedor "${businessName}"?`)) {
      return;
    }

    setIsDeleting(id);
    try {
      await deleteSupplier(id);
      toast.success('Proveedor eliminado correctamente');
      router.refresh();
    } catch (error) {
      logger.error('Error al eliminar proveedor', { data: { error } });
      toast.error('Error al eliminar proveedor');
    } finally {
      setIsDeleting(null);
    }
  };

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'code',
      header: 'Código',
      meta: { title: 'Código' },
    },
    {
      accessorKey: 'businessName',
      header: 'Razón Social',
      meta: { title: 'Razón Social' },
      cell: ({ row }) => {
        const tradeName = row.original.tradeName;
        return (
          <div>
            <div className="font-medium">{row.original.businessName}</div>
            {tradeName && (
              <div className="text-sm text-muted-foreground">{tradeName}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'taxId',
      header: 'CUIT',
      meta: { title: 'CUIT' },
      cell: ({ row }) => {
        const taxId = row.original.taxId;
        // Formatear CUIT: XX-XXXXXXXX-X
        if (taxId.length === 11) {
          return `${taxId.substring(0, 2)}-${taxId.substring(2, 10)}-${taxId.substring(10)}`;
        }
        return taxId;
      },
    },
    {
      accessorKey: 'taxCondition',
      header: 'Condición IVA',
      meta: { title: 'Condición IVA' },
      cell: ({ row }) => SUPPLIER_TAX_CONDITION_LABELS[row.original.taxCondition],
    },
    {
      accessorKey: 'phone',
      header: 'Teléfono',
      meta: { title: 'Teléfono' },
      cell: ({ row }) => row.original.phone || '-',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      meta: { title: 'Email' },
      cell: ({ row }) => row.original.email || '-',
    },
    {
      accessorKey: 'paymentTermDays',
      header: 'Plazo Pago',
      meta: { title: 'Plazo Pago (días)' },
      cell: ({ row }) => {
        const days = row.original.paymentTermDays;
        if (days === 0) return 'Contado';
        return `${days} días`;
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      meta: { title: 'Estado' },
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
    {
      id: 'actions',
      cell: ({ row }) => {
        const supplier = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/commercial/suppliers/${supplier.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/commercial/suppliers/${supplier.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(supplier.id, supplier.businessName)}
                disabled={isDeleting === supplier.id}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting === supplier.id ? 'Eliminando...' : 'Eliminar'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns as ColumnDef<Record<string, unknown>, unknown>[]}
      data={suppliers as Record<string, unknown>[]}
      totalRows={suppliers.length}
      searchColumn="businessName"
      searchPlaceholder="Buscar por razón social..."
      toolbarActions={
        <Link href="/dashboard/commercial/suppliers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proveedor
          </Button>
        </Link>
      }
    />
  );
}
