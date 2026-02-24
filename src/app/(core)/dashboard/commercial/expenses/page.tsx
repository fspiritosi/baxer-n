import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { ExpensesList } from '@/modules/commercial/features/expenses/list/ExpensesList';

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const params = await searchParams;
  return <ExpensesList searchParams={params} />;
}
