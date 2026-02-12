import { Suspense } from 'react';
import { ReceiptsListContent } from './components/_ReceiptsListContent';

export function ReceiptsList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recibos de Cobro</h1>
          <p className="text-muted-foreground">Gestión de recibos de cobro y cobranzas</p>
        </div>
      </div>

      <Suspense fallback={<div>Cargando...</div>}>
        <ReceiptsListContent />
      </Suspense>
    </div>
  );
}
