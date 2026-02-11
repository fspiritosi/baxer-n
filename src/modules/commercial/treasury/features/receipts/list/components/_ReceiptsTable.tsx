'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/common/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle, Eye } from 'lucide-react';
import { RECEIPT_STATUS_LABELS, RECEIPT_STATUS_BADGES } from '../../../../shared/validators';
import type { ReceiptListItem } from '../../../../shared/types';
import moment from 'moment';
import { confirmReceipt } from '../../actions.server';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';

interface ReceiptsTableProps {
  receipts: ReceiptListItem[];
  onUpdate: () => void;
}

export function ReceiptsTable({ receipts, onUpdate }: ReceiptsTableProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!selectedReceiptId) return;

    setIsConfirming(true);
    try {
      await confirmReceipt(selectedReceiptId);
      toast.success('Recibo confirmado correctamente');
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al confirmar recibo');
    } finally {
      setIsConfirming(false);
      setConfirmDialogOpen(false);
      setSelectedReceiptId(null);
    }
  };

  const columns: ColumnDef<ReceiptListItem>[] = [
    {
      accessorKey: 'fullNumber',
      header: 'Número',
      meta: { title: 'Número' },
    },
    {
      accessorKey: 'date',
      header: 'Fecha',
      meta: { title: 'Fecha' },
      cell: ({ row }) => moment(row.original.date).format('DD/MM/YYYY'),
    },
    {
      accessorKey: 'customer',
      header: 'Cliente',
      meta: { title: 'Cliente' },
      cell: ({ row }) => row.original.customer.name,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Monto Total',
      meta: { title: 'Monto Total' },
      cell: ({ row }) => (
        <span className="font-medium">
          ${row.original.totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      accessorKey: '_count.items',
      header: 'Facturas',
      meta: { title: 'Facturas' },
      cell: ({ row }) => row.original._count.items,
    },
    {
      accessorKey: '_count.payments',
      header: 'Pagos',
      meta: { title: 'Pagos' },
      cell: ({ row }) => row.original._count.payments,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      meta: { title: 'Estado' },
      cell: ({ row }) => (
        <Badge variant={RECEIPT_STATUS_BADGES[row.original.status]}>
          {RECEIPT_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      meta: { title: 'Acciones' },
      cell: ({ row }) => {
        const receipt = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalle
              </DropdownMenuItem>

              {receipt.status === 'DRAFT' && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedReceiptId(receipt.id);
                    setConfirmDialogOpen(true);
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Recibo
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable<ReceiptListItem> columns={columns} data={receipts} totalRows={receipts.length} />

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar recibo?</AlertDialogTitle>
            <AlertDialogDescription>
              Al confirmar el recibo se registrarán los movimientos de caja/banco y se actualizará el estado de las
              facturas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConfirming}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isConfirming}>
              {isConfirming ? 'Confirmando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
