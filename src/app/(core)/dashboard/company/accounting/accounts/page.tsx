import { AccountsList } from '@/modules/accounting/features/accounts/AccountsList';
import { checkPermission } from '@/shared/lib/permissions';

export default async function AccountsPage() {
  await checkPermission('accounting.accounts', 'view');
  return <AccountsList />;
}
