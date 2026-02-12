import { Suspense } from 'react';
import { PaymentOrdersListContent } from './components/_PaymentOrdersListContent';

export function PaymentOrdersList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Órdenes de Pago</h1>
          <p className="text-muted-foreground">Gestión de órdenes de pago a proveedores</p>
        </div>
      </div>

      <Suspense fallback={<div>Cargando...</div>}>
        <PaymentOrdersListContent />
      </Suspense>
    </div>
  );
}
