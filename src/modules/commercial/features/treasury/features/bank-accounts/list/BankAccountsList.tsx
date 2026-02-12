import { Suspense } from 'react';

import { getBankAccounts } from './actions.server';
import { _BankAccountsListContent } from './components/_BankAccountsListContent';

export async function BankAccountsList() {
  const bankAccounts = await getBankAccounts();

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <_BankAccountsListContent initialData={bankAccounts} />
    </Suspense>
  );
}
