import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getInvoices } from './actions.server';
import { InvoicesTable } from './components/_InvoicesTable';

export async function InvoicesList() {
  const invoices = await getInvoices();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Facturas de Venta</h2>
          <p className="text-muted-foreground">
            Gestiona las facturas emitidas a tus clientes
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/commercial/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Link>
        </Button>
      </div>

      <InvoicesTable data={invoices} />
    </div>
  );
}
