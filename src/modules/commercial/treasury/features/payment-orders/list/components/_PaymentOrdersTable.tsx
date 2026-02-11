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
import { PAYMENT_ORDER_STATUS_LABELS, PAYMENT_ORDER_STATUS_BADGES } from '../../../../shared/validators';
import type { PaymentOrderListItem } from '../../../../shared/types';
import moment from 'moment';
import { confirmPaymentOrder } from '../../actions.server';
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

interface PaymentOrdersTableProps {
  paymentOrders: PaymentOrderListItem[];
  onUpdate: () => void;
}

export function PaymentOrdersTable({ paymentOrders, onUpdate }: PaymentOrdersTableProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPaymentOrderId, setSelectedPaymentOrderId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!selectedPaymentOrderId) return;

    setIsConfirming(true);
    try {
      await confirmPaymentOrder(selectedPaymentOrderId);
      toast.success('Orden de pago confirmada correctamente');
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al confirmar orden de pago');
    } finally {
      setIsConfirming(false);
      setConfirmDialogOpen(false);
      setSelectedPaymentOrderId(null);
    }
  };

  const columns: ColumnDef<PaymentOrderListItem>[] = [
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
      accessorKey: 'supplier',
      header: 'Proveedor',
      meta: { title: 'Proveedor' },
      cell: ({ row }) => row.original.supplier.name,
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
        <Badge variant={PAYMENT_ORDER_STATUS_BADGES[row.original.status]}>
          {PAYMENT_ORDER_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      meta: { title: 'Acciones' },
      cell: ({ row }) => {
        const paymentOrder = row.original;

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

              {paymentOrder.status === 'DRAFT' && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedPaymentOrderId(paymentOrder.id);
                    setConfirmDialogOpen(true);
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Orden
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
      <DataTable<PaymentOrderListItem> columns={columns} data={paymentOrders} totalRows={paymentOrders.length} />

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar orden de pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Al confirmar la orden de pago se registrarán los movimientos de caja/banco y se actualizará el estado
              de las facturas. Esta acción no se puede deshacer.
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
