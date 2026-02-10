'use client';

import { Button } from '@/shared/components/ui/button';
import { FileText, Book, BookOpen } from 'lucide-react';

interface ReportsSelectorProps {
  selectedReport: 'trial-balance' | 'journal-book' | 'general-ledger';
  onSelect: (report: 'trial-balance' | 'journal-book' | 'general-ledger') => void;
}

export function _ReportsSelector({ selectedReport, onSelect }: ReportsSelectorProps) {
  const reports = [
    {
      id: 'trial-balance',
      name: 'Balance de Sumas y Saldos',
      description: 'Muestra los saldos de todas las cuentas',
      icon: FileText,
    },
    {
      id: 'journal-book',
      name: 'Libro Diario',
      description: 'Muestra todos los asientos contables',
      icon: Book,
    },
    {
      id: 'general-ledger',
      name: 'Libro Mayor',
      description: 'Muestra los movimientos por cuenta',
      icon: BookOpen,
    },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {reports.map((report) => {
        const Icon = report.icon;
        return (
          <Button
            key={report.id}
            variant={selectedReport === report.id ? 'default' : 'outline'}
            className="flex h-auto flex-col items-center gap-2 p-6"
            onClick={() => onSelect(report.id)}
          >
            <Icon className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">{report.name}</div>
              <div className="text-sm text-muted-foreground">
                {report.description}
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
