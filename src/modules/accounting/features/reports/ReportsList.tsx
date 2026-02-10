import { getActiveCompanyId } from '@/shared/lib/company';
import { _ReportsContent } from './components/_ReportsContent';

export async function ReportsList() {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  return <_ReportsContent companyId={companyId} />;
}
