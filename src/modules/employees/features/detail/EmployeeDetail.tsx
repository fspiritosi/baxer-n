import { notFound } from 'next/navigation';

import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { Card, CardContent } from '@/shared/components/ui/card';
import { UrlTabsContent } from '@/shared/components/ui/url-tabs';

import { EmployeeDocumentsList } from '@/modules/documents';
import { formatDateTime } from '@/shared/utils/formatters';
import { getEmployeeById, getEmployeeDocumentStatusInfo } from './actions.server';
import { _ContactTab } from './components/_ContactTab';
import { _EmployeeDetailTabs, type EmployeeDetailTab } from './components/_EmployeeDetailTabs';
import { _EmployeeHeader } from './components/_EmployeeHeader';
import { _PersonalInfoTab } from './components/_PersonalInfoTab';
import { _WorkInfoTab } from './components/_WorkInfoTab';

interface Props {
  id: string;
  searchParams?: { tab?: string };
}

export async function EmployeeDetail({ id, searchParams }: Props) {
  let employee;
  try {
    employee = await getEmployeeById(id);
  } catch {
    notFound();
  }

  // Get status info for tooltip
  const statusInfo = await getEmployeeDocumentStatusInfo(id);

  const validTabs: EmployeeDetailTab[] = ['personal', 'contact', 'work', 'documents'];
  const currentTab: EmployeeDetailTab = validTabs.includes(searchParams?.tab as EmployeeDetailTab)
    ? (searchParams?.tab as EmployeeDetailTab)
    : 'personal';

  return (
    <PermissionGuard module="employees" action="view" redirect>
      <div className="space-y-6">
        <_EmployeeHeader employee={employee} statusInfo={statusInfo} />

        <_EmployeeDetailTabs employeeId={employee.id} currentTab={currentTab}>
          <UrlTabsContent value="personal" className="mt-6">
            <_PersonalInfoTab employee={employee} />
          </UrlTabsContent>

          <UrlTabsContent value="contact" className="mt-6">
            <_ContactTab employee={employee} />
          </UrlTabsContent>

          <UrlTabsContent value="work" className="mt-6">
            <_WorkInfoTab employee={employee} />
          </UrlTabsContent>

          <UrlTabsContent value="documents" className="mt-6">
            <EmployeeDocumentsList employeeId={employee.id} />
          </UrlTabsContent>
        </_EmployeeDetailTabs>

        {/* Timestamps */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>Creado: {formatDateTime(employee.createdAt)}</span>
              <span>Última actualización: {formatDateTime(employee.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
