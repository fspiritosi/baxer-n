import type { VoucherType } from '@/generated/prisma/enums';

const CREDIT_NOTE_TYPES: VoucherType[] = ['NOTA_CREDITO_A', 'NOTA_CREDITO_B', 'NOTA_CREDITO_C'];
const DEBIT_NOTE_TYPES: VoucherType[] = ['NOTA_DEBITO_A', 'NOTA_DEBITO_B', 'NOTA_DEBITO_C'];

export function isCreditNote(voucherType: string): boolean {
  return CREDIT_NOTE_TYPES.includes(voucherType as VoucherType);
}

export function isDebitNote(voucherType: string): boolean {
  return DEBIT_NOTE_TYPES.includes(voucherType as VoucherType);
}

export { CREDIT_NOTE_TYPES, DEBIT_NOTE_TYPES };
