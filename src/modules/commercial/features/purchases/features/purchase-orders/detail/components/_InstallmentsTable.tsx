'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
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
import { Link2, Unlink } from 'lucide-react';
import moment from 'moment';
import { formatCurrency } from '@/shared/utils/formatters';
import { INSTALLMENT_STATUS_LABELS, INSTALLMENT_STATUS_VARIANTS } from '../../shared/validators';
import type { PurchaseOrderInstallmentStatus } from '@/generated/prisma/enums';
import type { PurchaseOrderDetailData } from '../../list/actions.server';
import { unlinkInvoiceFromInstallment } from '../../list/actions.server';
import { _LinkInvoiceDialog } from './_LinkInvoiceDialog';

interface InstallmentsTableProps {
  installments: PurchaseOrderDetailData['installments'];
  orderId: string;
  supplierId: string;
  orderStatus: string;
}

export function _InstallmentsTable({ installments, orderId, supplierId, orderStatus }: InstallmentsTableProps) {
  const router = useRouter();
  const [linkingInstallmentId, setLinkingInstallmentId] = useState<string | null>(null);
  const [unlinkingInstallmentId, setUnlinkingInstallmentId] = useState<string | null>(null);

  const handleUnlink = async () => {
    if (!unlinkingInstallmentId) return;
    try {
      await unlinkInvoiceFromInstallment(unlinkingInstallmentId);
      toast.success('Factura desvinculada correctamente');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al desvincular');
    } finally {
      setUnlinkingInstallmentId(null);
    }
  };

  const canLink = orderStatus === 'APPROVED' || orderStatus === 'PARTIALLY_RECEIVED' || orderStatus === 'COMPLETED';

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead>Fecha Vencimiento</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Factura Vinculada</TableHead>
              {canLink && <TableHead className="w-[100px]">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {installments.map((inst) => {
              const status = inst.status as PurchaseOrderInstallmentStatus;
              return (
                <TableRow key={inst.id}>
                  <TableCell className="font-mono">{inst.number}</TableCell>
                  <TableCell>{moment.utc(inst.dueDate).format('DD/MM/YYYY')}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(inst.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={INSTALLMENT_STATUS_VARIANTS[status]}>
                      {INSTALLMENT_STATUS_LABELS[status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {inst.purchaseInvoice ? (
                      <span className="text-sm font-mono">{inst.purchaseInvoice.fullNumber}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  {canLink && (
                    <TableCell>
                      {status === 'PENDING' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLinkingInstallmentId(inst.id)}
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                      )}
                      {status === 'INVOICED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUnlinkingInstallmentId(inst.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Dialog para vincular factura */}
      {linkingInstallmentId && (
        <_LinkInvoiceDialog
          installmentId={linkingInstallmentId}
          supplierId={supplierId}
          open={!!linkingInstallmentId}
          onOpenChange={(open) => !open && setLinkingInstallmentId(null)}
        />
      )}

      {/* Confirmación para desvincular */}
      <AlertDialog
        open={!!unlinkingInstallmentId}
        onOpenChange={(open) => !open && setUnlinkingInstallmentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desvincular factura</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que querés desvincular la factura de esta cuota?
              La cuota volverá al estado &quot;Pendiente&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlink}>Desvincular</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
