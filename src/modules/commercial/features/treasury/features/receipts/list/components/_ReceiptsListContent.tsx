'use client';

import { useQuery } from '@tanstack/react-query';
import { ReceiptsTable } from './_ReceiptsTable';
import { CreateReceiptModal } from './_CreateReceiptModal';
import { getReceipts } from '../actions.server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { DollarSign, FileText, CheckCircle2 } from 'lucide-react';

export function ReceiptsListContent() {
  const {
    data: receipts = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['receipts'],
    queryFn: () => getReceipts(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Calcular KPIs
  const totalAmount = receipts.reduce((acc, r) => acc + r.totalAmount, 0);
  const confirmedCount = receipts.filter((r) => r.status === 'CONFIRMED').length;
  const draftCount = receipts.filter((r) => r.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      {/* Dashboard con KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cobrado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Total de recibos confirmados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recibos Confirmados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedCount}</div>
            <p className="text-xs text-muted-foreground">De {receipts.length} totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borradores</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
            <p className="text-xs text-muted-foreground">Pendientes de confirmar</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de recibos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recibos de Cobro</CardTitle>
              <CardDescription>Lista de todos los recibos registrados</CardDescription>
            </div>
            <CreateReceiptModal onSuccess={() => refetch()} />
          </div>
        </CardHeader>
        <CardContent>
          <ReceiptsTable receipts={receipts} onUpdate={() => refetch()} />
        </CardContent>
      </Card>
    </div>
  );
}
