import { ReportsList } from '@/modules/accounting/features/reports/ReportsList';
import { checkPermission } from '@/shared/lib/permissions';

export default async function ReportsPage() {
  await checkPermission('accounting.reports', 'view');

  return <ReportsList />;
}
