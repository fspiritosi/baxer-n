'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { getIncomeStatement } from '../actions.server';
import { formatAmount } from '../../../shared/utils';
import { useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import moment from 'moment';
import { exportToExcel, ExcelColumn } from '@/shared/lib/excel-export';
import { logger } from '@/shared/lib/logger';

interface IncomeStatementReportProps {
  companyId: string;
}

export function _IncomeStatementReport({ companyId }: IncomeStatementReportProps) {
  const [fromDate, setFromDate] = useState<string>(
    moment().startOf('month').format('YYYY-MM-DD')
  );
  const [toDate, setToDate] = useState<string>(
    moment().format('YYYY-MM-DD')
  );
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Awaited<ReturnType<typeof getIncomeStatement>> | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await getIncomeStatement(
        companyId,
        new Date(fromDate),
        new Date(toDate)
      );
      setData(result);
    } catch (error) {
      logger.error('Error al obtener estado de resultados', { data: { error } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!data) return;

    const flatData: any[] = [];

    // Ingresos
    flatData.push({
      code: '',
      name: 'INGRESOS',
      amount: '',
    });
    data.revenue.accounts.forEach((account) => {
      flatData.push({
        code: account.code,
        name: account.name,
        amount: account.amount,
      });
    });
    flatData.push({
      code: '',
      name: 'Total Ingresos',
      amount: data.revenue.total,
    });
    flatData.push({ code: '', name: '', amount: '' });

    // Gastos
    flatData.push({
      code: '',
      name: 'GASTOS',
      amount: '',
    });
    data.expenses.accounts.forEach((account) => {
      flatData.push({
        code: account.code,
        name: account.name,
        amount: account.amount,
      });
    });
    flatData.push({
      code: '',
      name: 'Total Gastos',
      amount: data.expenses.total,
    });
    flatData.push({ code: '', name: '', amount: '' });

    // Resultado
    flatData.push({
      code: '',
      name: 'Resultado del Período',
      amount: data.netIncome,
    });

    const columns: ExcelColumn[] = [
      { key: 'code', title: 'Código', width: 12 },
      { key: 'name', title: 'Cuenta', width: 40 },
      {
        key: 'amount',
        title: 'Monto',
        width: 18,
        formatter: (value) => value === '' ? '' : (value as number).toFixed(2),
      },
    ];

    await exportToExcel(flatData, columns, {
      filename: `estado-resultados-${moment().format('YYYY-MM-DD')}`,
      sheetName: 'Estado de Resultados',
      title: 'Estado de Resultados',
      includeDate: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Resultados</CardTitle>
        <CardDescription>
          Muestra ingresos, gastos y resultado del período
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
          <div className="space-y-6">
            {/* Ingresos */}
            <div className="rounded-md border">
              <div className="border-b bg-muted px-4 py-3">
                <h3 className="text-lg font-semibold">{data.revenue.title}</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 pl-4 text-left">Código</th>
                    <th className="py-3 text-left">Cuenta</th>
                    <th className="py-3 pr-4 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {data.revenue.accounts.length > 0 ? (
                    data.revenue.accounts.map((account) => (
                      <tr key={account.code} className="border-b">
                        <td className="py-2 pl-4">{account.code}</td>
                        <td>{account.name}</td>
                        <td className="py-2 pr-4 text-right">
                          {formatAmount(account.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-muted-foreground">
                        No hay ingresos en el período
                      </td>
                    </tr>
                  )}
                  <tr className="border-t bg-muted/30 font-medium">
                    <td className="py-3 pl-4" colSpan={2}>
                      Total Ingresos
                    </td>
                    <td className="py-3 pr-4 text-right text-green-600">
                      {formatAmount(data.revenue.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Gastos */}
            <div className="rounded-md border">
              <div className="border-b bg-muted px-4 py-3">
                <h3 className="text-lg font-semibold">{data.expenses.title}</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 pl-4 text-left">Código</th>
                    <th className="py-3 text-left">Cuenta</th>
                    <th className="py-3 pr-4 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {data.expenses.accounts.length > 0 ? (
                    data.expenses.accounts.map((account) => (
                      <tr key={account.code} className="border-b">
                        <td className="py-2 pl-4">{account.code}</td>
                        <td>{account.name}</td>
                        <td className="py-2 pr-4 text-right">
                          {formatAmount(account.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-muted-foreground">
                        No hay gastos en el período
                      </td>
                    </tr>
                  )}
                  <tr className="border-t bg-muted/30 font-medium">
                    <td className="py-3 pl-4" colSpan={2}>
                      Total Gastos
                    </td>
                    <td className="py-3 pr-4 text-right text-red-600">
                      {formatAmount(data.expenses.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Resultado */}
            <div className="rounded-md border bg-muted/20">
              <table className="w-full">
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 pl-4 font-semibold">Ingresos Totales</td>
                    <td className="py-3 pr-4 text-right font-semibold text-green-600">
                      {formatAmount(data.revenue.total)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pl-4 font-semibold">Gastos Totales</td>
                    <td className="py-3 pr-4 text-right font-semibold text-red-600">
                      - {formatAmount(data.expenses.total)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-4 text-lg font-bold">Resultado del Período</td>
                    <td className="py-3 pr-4 text-right text-lg font-bold">
                      <span
                        className={
                          data.netIncome < 0
                            ? 'text-destructive'
                            : 'text-green-600'
                        }
                      >
                        {formatAmount(data.netIncome)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
