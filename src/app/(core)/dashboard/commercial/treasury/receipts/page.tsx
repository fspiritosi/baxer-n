import { type Metadata } from 'next';
import { ReceiptsList } from '@/modules/commercial/treasury/features/receipts/list';

export const metadata: Metadata = {
  title: 'Recibos de Cobro | Tesorería',
  description: 'Gestión de recibos de cobro y cobranzas',
};

export default function ReceiptsPage() {
  return <ReceiptsList />;
}
