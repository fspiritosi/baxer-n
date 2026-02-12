import { type Metadata } from 'next';
import { PaymentOrdersList } from '@/modules/commercial/features/treasury/features/payment-orders/list';

export const metadata: Metadata = {
  title: 'Órdenes de Pago | Tesorería',
  description: 'Gestión de órdenes de pago a proveedores',
};

export default function PaymentOrdersPage() {
  return <PaymentOrdersList />;
}
