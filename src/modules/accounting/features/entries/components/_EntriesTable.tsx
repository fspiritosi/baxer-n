'use client';

import * as React from 'react';
import { Button } from '@/shared/components/ui/button';
import { JournalEntryStatus } from '@/generated/prisma/enums';
import { type JournalEntryWithLines } from '../../../shared/types';
import { ChevronRight, ChevronDown, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useState } from 'react';
import { _PostEntryDialog } from './_PostEntryDialog';
import { _ReverseEntryDialog } from './_ReverseEntryDialog';
import { formatAmount } from '../../../shared/utils';

interface EntriesTableProps {
  entries: JournalEntryWithLines[];
}

export function _EntriesTable({ entries }: EntriesTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [postEntry, setPostEntry] = useState<JournalEntryWithLines | null>(null);
  const [reverseEntry, setReverseEntry] = useState<JournalEntryWithLines | null>(null);

  const toggleRow = (entryId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusLabel = (status: JournalEntryStatus) => {
    const labels = {
      [JournalEntryStatus.DRAFT]: 'Borrador',
      [JournalEntryStatus.POSTED]: 'Registrado',
      [JournalEntryStatus.REVERSED]: 'Anulado',
    };
    return labels[status];
  };

  const getStatusColor = (status: JournalEntryStatus) => {
    const colors = {
      [JournalEntryStatus.DRAFT]: 'text-yellow-600',
      [JournalEntryStatus.POSTED]: 'text-green-600',
      [JournalEntryStatus.REVERSED]: 'text-red-600',
    };
    return colors[status];
  };

  const renderEntryRow = (entry: JournalEntryWithLines) => {
    const isExpanded = expandedRows.has(entry.id);
    const totalDebit = entry.lines.reduce((sum, line) => sum + Number(line.debit), 0);
    const totalCredit = entry.lines.reduce((sum, line) => sum + Number(line.credit), 0);

    return (
      <>
        <tr key={entry.id} className={entry.status === JournalEntryStatus.REVERSED ? 'opacity-50' : undefined}>
          <td className="py-2">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleRow(entry.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              <span className="ml-2">{entry.number}</span>
            </div>
          </td>
          <td>{new Date(entry.date).toLocaleDateString()}</td>
          <td>{entry.description}</td>
          <td className={getStatusColor(entry.status)}>{getStatusLabel(entry.status)}</td>
          <td className="text-right">{formatAmount(totalDebit)}</td>
          <td className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {entry.status === JournalEntryStatus.DRAFT && (
                  <DropdownMenuItem onClick={() => setPostEntry(entry)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Registrar
                  </DropdownMenuItem>
                )}
                {entry.status === JournalEntryStatus.POSTED && (
                  <DropdownMenuItem
                    onClick={() => setReverseEntry(entry)}
                    className="text-destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Anular
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
        {isExpanded && (
          <>
            {entry.lines.map((line) => (
              <tr key={line.id} className="bg-muted/30">
                <td className="py-2" />
                <td colSpan={2}>
                  <div className="ml-8">
                    {line.account.code} - {line.account.name}
                    {line.description && (
                      <p className="text-sm text-muted-foreground">{line.description}</p>
                    )}
                  </div>
                </td>
                <td />
                <td className="text-right">{line.debit > 0 ? formatAmount(line.debit) : ''}</td>
                <td className="text-right">{line.credit > 0 ? formatAmount(line.credit) : ''}</td>
              </tr>
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="py-3 pl-4 text-left">Número</th>
              <th className="py-3 text-left">Fecha</th>
              <th className="py-3 text-left">Descripción</th>
              <th className="py-3 text-left">Estado</th>
              <th className="py-3 text-right">Importe</th>
              <th className="py-3 pr-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => renderEntryRow(entry))}
          </tbody>
        </table>
      </div>

      {postEntry && (
        <_PostEntryDialog
          entry={postEntry}
          onClose={() => setPostEntry(null)}
        />
      )}

      {reverseEntry && (
        <_ReverseEntryDialog
          entry={reverseEntry}
          onClose={() => setReverseEntry(null)}
        />
      )}
    </>
  );
}
