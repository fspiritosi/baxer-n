import { EntriesList } from '@/modules/accounting/features/entries/EntriesList';
import { checkPermission } from '@/shared/lib/permissions';

export default async function EntriesPage() {
  await checkPermission('accounting.entries', 'view');

  return <EntriesList />;
}
