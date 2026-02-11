'use client';

import { DataTable } from '@/shared/components/common/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import moment from 'moment';
import type { PurchaseInvoiceListItem } from '../actions.server';
import { confirmPurchaseInvoice, cancelPurchaseInvoice } from '../actions.server';
import { PURCHASE_INVOICE_STATUS_LABELS, VOUCHER_TYPE_LABELS } from '../../shared/validators';
import type { PurchaseInvoiceStatus } from '@/generated/prisma/enums';
import { useState } from 'react';

interface PurchaseInvoicesTableProps {
  initialData: {
    data: PurchaseInvoiceListItem[];
    total: number;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

export function _PurchaseInvoicesTable({ initialData, searchParams }: PurchaseInvoicesTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleConfirm = async (id: string, fullNumber: string) => {
    if (
      !confirm(
        `¿Confirmar factura ${fullNumber}?\n\nEsto incrementará el stock de los productos.`
      )
    ) {
      return;
    }

    try {
      setLoading(id);
      await confirmPurchaseInvoice(id);
      toast.success('Factura confirmada correctamente');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al confirmar la factura'
      );
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async (id: string, fullNumber: string) => {
    if (
      !confirm(
        `¿Cancelar factura ${fullNumber}?\n\nSi la factura está confirmada, se revertirá el stock.`
      )
    ) {
      return;
    }

    try {
      setLoading(id);
      await cancelPurchaseInvoice(id);
      toast.success('Factura cancelada correctamente');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al cancelar la factura'
      );
    } finally {
      setLoading(null);
    }
  };

  const columns: ColumnDef<PurchaseInvoiceListItem, unknown>[] = [
    {
      accessorKey: 'fullNumber',
      header: 'Número',
      meta: { title: 'Número' },
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.fullNumber}</div>
      ),
    },
    {
      accessorKey: 'voucherType',
      header: 'Tipo',
      meta: { title: 'Tipo' },
      cell: ({ row }) => (
        <div className="text-sm">
          {VOUCHER_TYPE_LABELS[row.original.voucherType] || row.original.voucherType}
        </div>
      ),
    },
    {
      accessorKey: 'supplier',
      header: 'Proveedor',
      meta: { title: 'Proveedor' },
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="font-medium truncate">
            {row.original.supplier.tradeName || row.original.supplier.businessName}
          </div>
          {row.original.supplier.taxId && (
            <div className="text-xs text-muted-foreground font-mono">
              {row.original.supplier.taxId}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'issueDate',
      header: 'Fecha',
      meta: { title: 'Fecha' },
      cell: ({ row }) => (
        <div className="text-sm">{moment(row.original.issueDate).format('DD/MM/YYYY')}</div>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      meta: { title: 'Total' },
      cell: ({ row }) => (
        <div className="text-right font-mono font-semibold">
          ${Number(row.original.total).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      meta: { title: 'Estado' },
      cell: ({ row }) => {
        const status = row.original.status;
        const variant:
          | 'default'
          | 'secondary'
          | 'destructive'
          | 'outline' =
          status === 'CONFIRMED'
            ? 'default'
            : status === 'PAID'
            ? 'default'
            : status === 'CANCELLED'
            ? 'destructive'
            : 'secondary';

        return (
          <Badge
            variant={variant}
            className={status === 'CONFIRMED' ? 'bg-green-600 hover:bg-green-700' : undefined}
          >
            {PURCHASE_INVOICE_STATUS_LABELS[status as PurchaseInvoiceStatus]}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const invoice = row.original;
        const isLoading = loading === invoice.id;
        const canConfirm = invoice.status === 'DRAFT';
        const canCancel =
          invoice.status === 'DRAFT' || invoice.status === 'CONFIRMED';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/commercial/purchases/${invoice.id}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </DropdownMenuItem>
              {canConfirm && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleConfirm(invoice.id, invoice.fullNumber)}
                    disabled={isLoading}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmar factura
                  </DropdownMenuItem>
                </>
              )}
              {canCancel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleCancel(invoice.id, invoice.fullNumber)}
                    disabled={isLoading}
                    className="text-destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar factura
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={initialData.data}
      totalRows={initialData.total}
      searchParams={searchParams}
      searchPlaceholder="Buscar facturas..."
    />
  );
}
