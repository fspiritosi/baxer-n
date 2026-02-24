'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Link2 } from 'lucide-react';
import moment from 'moment';
import { formatCurrency } from '@/shared/utils/formatters';
import {
  getUnlinkedPurchaseInvoicesForSupplier,
  linkInvoiceToInstallment,
} from '../../list/actions.server';

interface LinkInvoiceDialogProps {
  installmentId: string;
  supplierId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function _LinkInvoiceDialog({
  installmentId,
  supplierId,
  open,
  onOpenChange,
}: LinkInvoiceDialogProps) {
  const router = useRouter();
  const [linking, setLinking] = useState(false);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['unlinked-invoices', supplierId],
    queryFn: () => getUnlinkedPurchaseInvoicesForSupplier(supplierId),
    enabled: open,
  });

  const handleLink = async (purchaseInvoiceId: string) => {
    setLinking(true);
    try {
      await linkInvoiceToInstallment(installmentId, purchaseInvoiceId);
      toast.success('Factura vinculada correctamente');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al vincular factura');
    } finally {
      setLinking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Vincular Factura de Compra</DialogTitle>
          <DialogDescription>
            Seleccioná una factura de compra del proveedor para vincular a esta cuota.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-4">Cargando facturas...</p>
        )}

        {!isLoading && (!invoices || invoices.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay facturas de compra disponibles para vincular.
          </p>
        )}

        {!isLoading && invoices && invoices.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono">{invoice.fullNumber}</TableCell>
                  <TableCell>{moment.utc(invoice.issueDate).format('DD/MM/YYYY')}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(Number(invoice.total))}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLink(invoice.id)}
                      disabled={linking}
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
