import { AccountingSettings } from '@/modules/accounting/features/settings/AccountingSettings';
import { checkPermission } from '@/shared/lib/permissions';

export default async function SettingsPage() {
  await checkPermission('accounting.settings', 'view');

  return <AccountingSettings />;
}
