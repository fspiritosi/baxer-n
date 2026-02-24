import { type Metadata } from 'next';
import { CashflowDashboard } from '@/modules/commercial/features/treasury/features/cashflow';
import type { Granularity } from '@/modules/commercial/features/treasury/features/cashflow/actions.server';

export const metadata: Metadata = {
  title: 'Flujo de Caja | Tesorería',
  description: 'Proyección de flujo de caja',
};

interface Props {
  searchParams: Promise<{ granularity?: string; month?: string }>;
}

export default async function CashflowPage({ searchParams }: Props) {
  const params = await searchParams;
  const granularity = (['daily', 'weekly', 'monthly'].includes(params.granularity ?? '')
    ? params.granularity
    : 'weekly') as Granularity;

  // month param in YYYY-MM format, undefined means "from today"
  const month = /^\d{4}-\d{2}$/.test(params.month ?? '') ? params.month : undefined;

  return <CashflowDashboard granularity={granularity} month={month} />;
}
