import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  UrlTabs,
  UrlTabsList,
  UrlTabsTrigger,
  UrlTabsContent,
} from '@/shared/components/ui/url-tabs';
import { getBankAccountById } from '../actions.server';
import { getBankAccountMovements, getReconciliationStats } from '../../bank-movements/actions.server';
import { _BankMovementsTable } from './components/_BankMovementsTable';
import { _BankAccountSummary } from './components/_BankAccountSummary';
import { _BankAccountDetailActions } from './components/_BankAccountDetailActions';
import { _ReconciliationView } from './components/_ReconciliationView';

interface Props {
  bankAccountId: string;
  searchParams: Record<string, string>;
}

export async function BankAccountDetail({ bankAccountId, searchParams }: Props) {
  const tab = (searchParams.tab as 'movements' | 'reconciliation') || 'movements';

  const [bankAccount, movements, reconciliationStats] = await Promise.all([
    getBankAccountById(bankAccountId),
    getBankAccountMovements(bankAccountId, 100),
    getReconciliationStats(bankAccountId),
  ]);

  if (!bankAccount) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/commercial/treasury/bank-accounts">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {bankAccount.bankName} - {bankAccount.accountNumber}
          </h1>
          <p className="text-muted-foreground">
            Historial de movimientos bancarios
          </p>
        </div>
        <_BankAccountDetailActions bankAccountId={bankAccountId} />
      </div>

      {/* Summary Card */}
      <_BankAccountSummary bankAccount={bankAccount} />

      {/* Tabs */}
      <UrlTabs value={tab} paramName="tab" replace>
        <UrlTabsList>
          <UrlTabsTrigger value="movements">Movimientos</UrlTabsTrigger>
          <UrlTabsTrigger value="reconciliation">
            Conciliación
            {reconciliationStats.pending > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                {reconciliationStats.pending}
              </span>
            )}
          </UrlTabsTrigger>
        </UrlTabsList>

        <UrlTabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Movimientos</CardTitle>
              <CardDescription>
                Historial completo de movimientos de la cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <_BankMovementsTable
                movements={movements}
                bankAccountId={bankAccountId}
              />
            </CardContent>
          </Card>
        </UrlTabsContent>

        <UrlTabsContent value="reconciliation">
          <_ReconciliationView
            movements={movements}
            bankAccountId={bankAccountId}
            stats={reconciliationStats}
          />
        </UrlTabsContent>
      </UrlTabs>
    </div>
  );
}
