'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { AccountType } from '@/generated/prisma/enums';
import { getTrialBalance } from '../actions.server';
import { formatAmount } from '../../../shared/utils';
import { useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import moment from 'moment';
import { exportToExcel, ExcelColumn } from '@/shared/lib/excel-export';
import { logger } from '@/shared/lib/logger';

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  [AccountType.ASSET]: 'Activo',
  [AccountType.LIABILITY]: 'Pasivo',
  [AccountType.EQUITY]: 'Patrimonio',
  [AccountType.REVENUE]: 'Ingresos',
  [AccountType.EXPENSE]: 'Gastos',
};

interface TrialBalanceReportProps {
  companyId: string;
}

export function _TrialBalanceReport({ companyId }: TrialBalanceReportProps) {
  const [fromDate, setFromDate] = useState<string>(
    moment().startOf('month').format('YYYY-MM-DD')
  );
  const [toDate, setToDate] = useState<string>(
    moment().format('YYYY-MM-DD')
  );
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Awaited<ReturnType<typeof getTrialBalance>> | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await getTrialBalance(
        companyId,
        new Date(fromDate),
        new Date(toDate)
      );
      setData(result);
    } catch (error) {
      logger.error('Error al obtener balance', { data: { error } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!data) return;

    const flatData = data.accounts.map((account) => ({
      code: account.code,
      name: account.name,
      type: ACCOUNT_TYPE_LABELS[account.type],
      debitTotal: account.debitTotal,
      creditTotal: account.creditTotal,
      balance: account.balance,
    }));

    flatData.push({
      code: '',
      name: 'TOTALES',
      type: '',
      debitTotal: data.totalDebit,
      creditTotal: data.totalCredit,
      balance: data.totalDebit - data.totalCredit,
    });

    const columns: ExcelColumn[] = [
      { key: 'code', title: 'Codigo', width: 12 },
      { key: 'name', title: 'Cuenta', width: 30 },
      { key: 'type', title: 'Tipo', width: 15 },
      {
        key: 'debitTotal',
        title: 'Debe',
        width: 15,
        formatter: (value) => (value as number).toFixed(2),
      },
      {
        key: 'creditTotal',
        title: 'Haber',
        width: 15,
        formatter: (value) => (value as number).toFixed(2),
      },
      {
        key: 'balance',
        title: 'Saldo',
        width: 15,
        formatter: (value) => (value as number).toFixed(2),
      },
    ];

    await exportToExcel(flatData, columns, {
      filename: `balance-sumas-saldos-${moment().format('YYYY-MM-DD')}`,
      sheetName: 'Balance',
      title: 'Balance de Sumas y Saldos',
      includeDate: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance de Sumas y Saldos</CardTitle>
        <CardDescription>
          Muestra los saldos de todas las cuentas en un periodo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="mb-6 flex items-end gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fromDate">Desde</Label>
            <Input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="toDate">Hasta</Label>
            <Input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleExport}
            disabled={isLoading || !data}
            title="Exportar a Excel"
          >
            <Download className="h-4 w-4" />
          </Button>
        </form>

        {data && (
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 pl-4 text-left">Codigo</th>
                  <th className="py-3 text-left">Nombre</th>
                  <th className="py-3 text-left">Tipo</th>
                  <th className="py-3 text-right">Debe</th>
                  <th className="py-3 text-right">Haber</th>
                  <th className="py-3 pr-4 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {data.accounts.map((account) => (
                  <tr key={account.accountId} className="border-b">
                    <td className="py-2 pl-4">{account.code}</td>
                    <td>{account.name}</td>
                    <td>{ACCOUNT_TYPE_LABELS[account.type]}</td>
                    <td className="text-right">{formatAmount(account.debitTotal)}</td>
                    <td className="text-right">{formatAmount(account.creditTotal)}</td>
                    <td className="py-2 pr-4 text-right">
                      <span
                        className={
                          account.balance < 0
                            ? 'text-destructive'
                            : account.balance > 0
                            ? 'text-green-600'
                            : ''
                        }
                      >
                        {formatAmount(account.balance)}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="border-t bg-muted/30 font-medium">
                  <td className="py-2 pl-4" colSpan={3}>
                    Totales
                  </td>
                  <td className="text-right">{formatAmount(data.totalDebit)}</td>
                  <td className="text-right">{formatAmount(data.totalCredit)}</td>
                  <td className="py-2 pr-4 text-right">
                    {formatAmount(data.totalDebit - data.totalCredit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
