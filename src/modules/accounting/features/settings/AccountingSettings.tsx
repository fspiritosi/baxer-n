import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getAccountingSettings, getActiveAccounts } from './actions.server';
import { _AccountingSettingsForm } from './components/_AccountingSettingsForm';
import { _CommercialIntegrationForm } from './components/_CommercialIntegrationForm';

import { getActiveCompanyId } from '@/shared/lib/company';

export async function AccountingSettings() {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');
  const settings = await getAccountingSettings(companyId);
  const accounts = await getActiveAccounts(companyId);

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

      <Card>
        <CardHeader>
          <CardTitle>Integración Comercial</CardTitle>
          <CardDescription>
            Configura las cuentas contables por defecto para la generación automática de asientos desde el módulo comercial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <_CommercialIntegrationForm
            companyId={companyId}
            accounts={accounts}
            defaultValues={{
              salesAccountId: settings?.salesAccountId ?? null,
              purchasesAccountId: settings?.purchasesAccountId ?? null,
              receivablesAccountId: settings?.receivablesAccountId ?? null,
              payablesAccountId: settings?.payablesAccountId ?? null,
              vatDebitAccountId: settings?.vatDebitAccountId ?? null,
              vatCreditAccountId: settings?.vatCreditAccountId ?? null,
              defaultCashAccountId: settings?.defaultCashAccountId ?? null,
              defaultBankAccountId: settings?.defaultBankAccountId ?? null,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
