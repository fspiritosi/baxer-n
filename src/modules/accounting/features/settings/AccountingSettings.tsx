import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getAccountingSettings } from './actions.server';
import { _AccountingSettingsForm } from './components/_AccountingSettingsForm';

import { getActiveCompanyId } from '@/shared/lib/company';

export async function AccountingSettings() {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');
  const settings = await getAccountingSettings(companyId);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Configuración Contable</h1>
        <p className="text-sm text-muted-foreground">
          Configura los parámetros contables de tu empresa
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ejercicio Fiscal</CardTitle>
          <CardDescription>
            Define el período del ejercicio fiscal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <_AccountingSettingsForm
            companyId={companyId}
            defaultValues={{
              fiscalYearStart: settings?.fiscalYearStart ?? new Date(),
              fiscalYearEnd: settings?.fiscalYearEnd ?? new Date(),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
