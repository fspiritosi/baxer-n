'use client';

import { useState } from 'react';
import { _ReportSelector } from './components/_ReportSelector';
import { _PurchaseReportTable } from './components/_PurchaseReportTable';
import {
  getPurchasesByPeriod,
  getPurchasesBySupplier,
  getPurchasesByProduct,
  getVATPurchaseBook,
} from './actions.server';
import { toast } from 'sonner';

type ReportType = 'period' | 'supplier' | 'product' | 'vat';

export function PurchaseReports() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<{ startDate?: Date; endDate?: Date }>({});

  const handleGenerate = async (type: ReportType, startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      setReportType(type);
      setDateRange({ startDate, endDate });

      let data;
      switch (type) {
        case 'period':
          data = await getPurchasesByPeriod(startDate, endDate);
          break;
        case 'supplier':
          data = await getPurchasesBySupplier(startDate, endDate);
          break;
        case 'product':
          data = await getPurchasesByProduct(startDate, endDate);
          break;
        case 'vat':
          data = await getVATPurchaseBook(startDate, endDate);
          break;
      }

      setReportData(data);
      toast.success('Reporte generado correctamente');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al generar el reporte'
      );
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes de Compras</h1>
        <p className="text-muted-foreground">
          Analiza tus compras por período, proveedor, producto o genera el libro IVA
        </p>
      </div>

      <_ReportSelector onGenerate={handleGenerate} loading={loading} />

      <_PurchaseReportTable
        reportType={reportType}
        data={reportData}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />
    </div>
  );
}
