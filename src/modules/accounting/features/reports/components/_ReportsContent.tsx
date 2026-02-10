'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { _ReportsSelector } from './_ReportsSelector';
import { _TrialBalanceReport } from './_TrialBalanceReport';
import { _JournalBookReport } from './_JournalBookReport';
import { _GeneralLedgerReport } from './_GeneralLedgerReport';
import { useState } from 'react';

type ReportType = 'trial-balance' | 'journal-book' | 'general-ledger';

interface ReportsContentProps {
  companyId: string;
}

export function _ReportsContent({ companyId }: ReportsContentProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>('trial-balance');

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Informes Contables</h1>
        <p className="text-sm text-muted-foreground">
          Genera informes contables para tu empresa
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informes Disponibles</CardTitle>
          <CardDescription>
            Selecciona el tipo de informe que deseas generar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <_ReportsSelector
            selectedReport={selectedReport}
            onSelect={setSelectedReport}
          />
        </CardContent>
      </Card>

      {selectedReport === 'trial-balance' && (
        <_TrialBalanceReport companyId={companyId} />
      )}

      {selectedReport === 'journal-book' && (
        <_JournalBookReport companyId={companyId} />
      )}

      {selectedReport === 'general-ledger' && (
        <_GeneralLedgerReport companyId={companyId} />
      )}
    </div>
  );
}
