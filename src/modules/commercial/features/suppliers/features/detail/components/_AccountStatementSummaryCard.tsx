'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

interface AccountStatementSummaryCardProps {
  totalInvoiced: number;
  totalPaid: number;
  totalBalance: number;
}

export function _AccountStatementSummaryCard({
  totalInvoiced,
  totalPaid,
  totalBalance,
}: AccountStatementSummaryCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Facturado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalInvoiced.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-muted-foreground">Facturas confirmadas</p>
        </CardContent>
      </Card>

      {/* Total Pagado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
          <TrendingDown className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${totalPaid.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">Pagos confirmados</p>
        </CardContent>
      </Card>

      {/* Saldo Pendiente */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
          <TrendingUp className={`h-4 w-4 ${totalBalance > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalBalance > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
            ${totalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">
            {totalBalance > 0 ? 'Adeudado al proveedor' : 'Sin saldo pendiente'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
