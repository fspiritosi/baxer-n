import { Metadata } from 'next';

import { CashRegistersList } from '@/modules/commercial/features/treasury/features/cash-registers/list';

export const metadata: Metadata = {
  title: 'Cajas | Tesorería',
  description: 'Gestión de cajas registradoras y control de efectivo',
};

export default function CashRegistersPage() {
  return <CashRegistersList />;
}
