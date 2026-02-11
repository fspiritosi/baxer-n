'use client';

import { useQuery } from '@tanstack/react-query';
import { PaymentOrdersTable } from './_PaymentOrdersTable';
import { CreatePaymentOrderModal } from './_CreatePaymentOrderModal';
import { getPaymentOrders } from '../actions.server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { DollarSign, FileText, CheckCircle2 } from 'lucide-react';

export function PaymentOrdersListContent() {
  const {
    data: paymentOrders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['paymentOrders'],
    queryFn: () => getPaymentOrders(),
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
  const totalAmount = paymentOrders.reduce((acc, po) => acc + po.totalAmount, 0);
  const confirmedCount = paymentOrders.filter((po) => po.status === 'CONFIRMED').length;
  const draftCount = paymentOrders.filter((po) => po.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      {/* Dashboard con KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Total de órdenes confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Confirmadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedCount}</div>
            <p className="text-xs text-muted-foreground">De {paymentOrders.length} totales</p>
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

      {/* Tabla de órdenes de pago */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Órdenes de Pago</CardTitle>
              <CardDescription>Lista de todas las órdenes de pago registradas</CardDescription>
            </div>
            <CreatePaymentOrderModal onSuccess={() => refetch()} />
          </div>
        </CardHeader>
        <CardContent>
          <PaymentOrdersTable paymentOrders={paymentOrders} onUpdate={() => refetch()} />
        </CardContent>
      </Card>
    </div>
  );
}
