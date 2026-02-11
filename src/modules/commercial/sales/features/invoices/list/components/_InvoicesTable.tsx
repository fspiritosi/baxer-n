'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/common/DataTable';
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
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Download,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { confirmInvoice, cancelInvoice, getInvoices } from '../actions.server';
import { toast } from 'sonner';
import moment from 'moment';
import { VOUCHER_TYPE_LABELS, INVOICE_STATUS_LABELS } from '../../shared/validators';

type Invoice = Awaited<ReturnType<typeof getInvoices>>[number];

interface InvoicesTableProps {
  data: Invoice[];
}

export function InvoicesTable({ data }: InvoicesTableProps) {
  const router = useRouter();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleView = (invoice: Invoice) => {
    router.push(`/dashboard/commercial/invoices/${invoice.id}`);
  };

  const handleConfirmClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setConfirmDialogOpen(true);
  };

  const handleConfirmInvoice = async () => {
    if (!selectedInvoice) return;

    setIsProcessing(true);
    try {
      await confirmInvoice(selectedInvoice.id);
      toast.success('Factura confirmada y stock descontado correctamente');
      setConfirmDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al confirmar la factura');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setCancelDialogOpen(true);
  };

  const handleCancelInvoice = async () => {
    if (!selectedInvoice) return;

    setIsProcessing(true);
    try {
      await cancelInvoice(selectedInvoice.id);
      toast.success('Factura anulada correctamente');
      setCancelDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al anular la factura');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <Badge variant="outline" className="gap-1">
            <FileText className="h-3 w-3" />
            {INVOICE_STATUS_LABELS[status]}
          </Badge>
        );
      case 'CONFIRMED':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {INVOICE_STATUS_LABELS[status]}
          </Badge>
        );
      case 'PAID':
        return (
          <Badge className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            {INVOICE_STATUS_LABELS[status]}
          </Badge>
        );
      case 'PARTIAL_PAID':
        return (
          <Badge className="gap-1 bg-yellow-600">
            <CheckCircle className="h-3 w-3" />
            {INVOICE_STATUS_LABELS[status]}
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {INVOICE_STATUS_LABELS[status]}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'fullNumber',
      header: 'Número',
      meta: { title: 'Número' },
      cell: ({ row }) => {
        const fullNumber = row.original.fullNumber;
        return <div className="font-mono font-semibold">{fullNumber}</div>;
      },
    },
    {
      accessorKey: 'voucherType',
      header: 'Tipo',
      meta: { title: 'Tipo' },
      cell: ({ row }) => {
        const type = row.original.voucherType;
        return (
          <Badge variant="outline">
            {VOUCHER_TYPE_LABELS[type as keyof typeof VOUCHER_TYPE_LABELS]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'issueDate',
      header: 'Fecha',
      meta: { title: 'Fecha' },
      cell: ({ row }) => {
        const date = row.original.issueDate;
        return moment(date).format('DD/MM/YYYY');
      },
    },
    {
      accessorKey: 'customer.name',
      header: 'Cliente',
      meta: { title: 'Cliente' },
      cell: ({ row }) => {
        const customer = row.original.customer;
        return (
          <div>
            <div className="font-medium">{customer.name}</div>
            {customer.taxId && (
              <div className="text-xs text-muted-foreground">{customer.taxId}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      meta: { title: 'Total' },
      cell: ({ row }) => {
        const total = Number(row.original.total);
        return (
          <div className="font-semibold text-right">
            ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      meta: { title: 'Estado' },
      cell: ({ row }) => {
        return getStatusBadge(row.original.status);
      },
    },
    {
      accessorKey: 'cae',
      header: 'CAE',
      meta: { title: 'CAE' },
      cell: ({ row }) => {
        const cae = row.original.cae;
        return cae ? (
          <div className="font-mono text-xs">{cae}</div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const invoice = row.original;
        const isDraft = invoice.status === 'DRAFT';
        const isCancelled = invoice.status === 'CANCELLED';

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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleView(invoice)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalle
              </DropdownMenuItem>
              {isDraft && (
                <>
                  <DropdownMenuItem onClick={() => handleConfirmClick(invoice)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmar
                  </DropdownMenuItem>
                </>
              )}
              {!isCancelled && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleCancelClick(invoice)}
                    className="text-destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Anular
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={data} totalRows={data.length} />

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar factura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción confirmará la factura{' '}
              <strong>{selectedInvoice?.fullNumber}</strong> y descontará el stock de los
              productos. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmInvoice} disabled={isProcessing}>
              {isProcessing ? 'Confirmando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Anular factura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción anulará la factura <strong>{selectedInvoice?.fullNumber}</strong>.
              Esta acción no se puede deshacer. Para revertir el stock, deberá crear una Nota
              de Crédito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelInvoice}
              disabled={isProcessing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing ? 'Anulando...' : 'Anular'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
