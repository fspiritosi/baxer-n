import { Suspense } from 'react';

import { getCashRegisters } from './actions.server';
import { _CashRegistersListContent } from './components/_CashRegistersListContent';

export async function CashRegistersList() {
  const cashRegisters = await getCashRegisters();

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <_CashRegistersListContent initialData={cashRegisters} />
    </Suspense>
  );
}
