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
import { MoreHorizontal, CheckCircle, Eye, Download, Edit, Trash2 } from 'lucide-react';
import { PAYMENT_ORDER_STATUS_LABELS, PAYMENT_ORDER_STATUS_BADGES } from '../../../../shared/validators';
import type { PaymentOrderListItem } from '../../../../shared/types';
import moment from 'moment';
import { confirmPaymentOrder, deletePaymentOrder } from '../../actions.server';
import { toast } from 'sonner';
import { PaymentOrderDetailModal } from './_PaymentOrderDetailModal';
import { EditPaymentOrderModal } from './_EditPaymentOrderModal';
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPaymentOrderId, setSelectedPaymentOrderId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!selectedPaymentOrderId) return;

    setIsDeleting(true);
    try {
      await deletePaymentOrder(selectedPaymentOrderId);
      toast.success('Orden de pago eliminada correctamente');
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar orden de pago');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
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
      cell: ({ row }) => row.original.supplier.tradeName || row.original.supplier.businessName,
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
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPaymentOrderId(paymentOrder.id);
                  setDetailModalOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalle
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  window.open(`/api/payment-orders/${paymentOrder.id}/pdf`, '_blank');
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </DropdownMenuItem>

              {paymentOrder.status === 'DRAFT' && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedPaymentOrderId(paymentOrder.id);
                      setEditModalOpen(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedPaymentOrderId(paymentOrder.id);
                      setConfirmDialogOpen(true);
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmar Orden
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedPaymentOrderId(paymentOrder.id);
                      setDeleteDialogOpen(true);
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
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
    <>
      <DataTable<PaymentOrderListItem> columns={columns} data={paymentOrders} totalRows={paymentOrders.length} />

      {/* Diálogo de Confirmación */}
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

      {/* Diálogo de Eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar orden de pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la orden de pago y todos sus registros asociados.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Detalle */}
      <PaymentOrderDetailModal
        paymentOrderId={selectedPaymentOrderId}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      {/* Modal de Edición */}
      <EditPaymentOrderModal
        paymentOrderId={selectedPaymentOrderId}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </>
  );
}
