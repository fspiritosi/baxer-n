import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getAccounts } from './actions.server';
import { buildAccountTree } from '../../shared/utils';
import { _AccountsTable } from './components/_AccountsTable';
import { _CreateAccountButton } from './components/_CreateAccountButton';
import { _ImportExportButtons } from './components/_ImportExportButtons';

import { getActiveCompanyId } from '@/shared/lib/company';

export async function AccountsList() {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');
  const accounts = await getAccounts(companyId);
  const accountTree = buildAccountTree(accounts);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plan de Cuentas</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las cuentas contables de tu empresa
          </p>
        </div>
        <div className="flex gap-2">
          <_ImportExportButtons companyId={companyId} />
          <_CreateAccountButton companyId={companyId} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cuentas Contables</CardTitle>
          <CardDescription>
            Lista de cuentas contables organizadas jerárquicamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <_AccountsTable accounts={accountTree} companyId={companyId} />
        </CardContent>
      </Card>
    </div>
  );
}
