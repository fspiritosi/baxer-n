import type { Metadata } from 'next';
import { BankAccountDetail } from '@/modules/commercial/features/treasury/features/bank-accounts/detail';

export const metadata: Metadata = {
  title: 'Movimientos Bancarios',
  description: 'Historial de movimientos de cuenta bancaria',
};

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string>>;
}

export default async function BankAccountDetailPage({ params, searchParams }: Props) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  return <BankAccountDetail bankAccountId={id} searchParams={resolvedSearchParams} />;
}
