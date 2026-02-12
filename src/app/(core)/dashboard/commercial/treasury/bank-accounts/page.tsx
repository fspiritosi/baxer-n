import { Metadata } from 'next';

import { BankAccountsList } from '@/modules/commercial/features/treasury/features/bank-accounts/list';

export const metadata: Metadata = {
  title: 'Cuentas Bancarias | Tesorería',
  description: 'Gestión de cuentas bancarias y movimientos',
};

export default function BankAccountsPage() {
  return <BankAccountsList />;
}
