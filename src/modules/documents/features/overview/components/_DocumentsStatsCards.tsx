'use client';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

import type { DocumentsStats } from '../actions.server';

interface Props {
  stats: DocumentsStats;
  showMissingMandatory?: boolean;
}

export function _DocumentsStatsCards({ stats, showMissingMandatory = false }: Props) {
  const showMissingCard = showMissingMandatory && stats.employeesWithMissingMandatory !== undefined;

  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${showMissingCard ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.expired}</div>
        </CardContent>
      </Card>

      {showMissingCard && (
        <Card className="border-destructive/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados Incompletos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.employeesWithMissingMandatory}
            </div>
            <p className="text-xs text-muted-foreground">con docs obligatorios faltantes</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
