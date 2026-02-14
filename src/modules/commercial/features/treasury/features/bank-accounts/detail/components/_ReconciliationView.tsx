'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  Clock,
  ListChecks,
  BarChart3,
} from 'lucide-react';

import { DataTable } from '@/shared/components/common/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { BANK_MOVEMENT_TYPE_LABELS } from '../../../../shared/validators';
import { reconcileMultipleBankMovements } from '../../../bank-movements/actions.server';

interface BankMovement extends Record<string, unknown> {
  id: string;
  type: string;
  amount: number;
  date: Date;
  description: string;
  reference: string | null;
  statementNumber: string | null;
  reconciled: boolean;
  reconciledAt: Date | null;
  createdAt: Date;
}

interface ReconciliationStats {
  total: number;
  reconciled: number;
  pending: number;
  percentage: number;
}

interface Props {
  movements: BankMovement[];
  bankAccountId: string;
  stats: ReconciliationStats;
}

export function _ReconciliationView({ movements, stats }: Props) {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<BankMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pendingMovements = useMemo(
    () => movements.filter((m) => !m.reconciled),
    [movements]
  );

  const handleBulkReconcile = async () => {
    const ids = selectedRows.map((r) => r.id);
    if (ids.length === 0) return;

    try {
      setIsLoading(true);
      const result = await reconcileMultipleBankMovements(ids, true);
      toast.success(`${result.count} movimiento(s) conciliado(s)`);
      setSelectedRows([]);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al conciliar');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo<ColumnDef<BankMovement>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Seleccionar todos"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Seleccionar fila"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'date',
        header: 'Fecha',
        meta: { title: 'Fecha' },
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">
              {moment(row.original.date).format('DD/MM/YYYY')}
            </span>
            <span className="text-xs text-muted-foreground">
              {moment(row.original.date).format('HH:mm')}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Tipo',
        meta: { title: 'Tipo' },
        cell: ({ row }) => {
          const type = row.original.type;
          const isIncome = ['DEPOSIT', 'TRANSFER_IN', 'INTEREST'].includes(type);

          return (
            <div className="flex items-center gap-2">
              {isIncome ? (
                <ArrowDown className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowUp className="h-4 w-4 text-red-600" />
              )}
              <Badge variant="outline">
                {BANK_MOVEMENT_TYPE_LABELS[type as keyof typeof BANK_MOVEMENT_TYPE_LABELS] || type}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: 'description',
        header: 'Descripción',
        meta: { title: 'Descripción' },
        cell: ({ row }) => (
          <div className="max-w-[300px]">
            <p className="truncate">{row.original.description}</p>
            {row.original.reference && (
              <p className="text-xs text-muted-foreground">
                Ref: {row.original.reference}
              </p>
            )}
            {row.original.statementNumber && (
              <p className="text-xs text-muted-foreground">
                Extracto: {row.original.statementNumber}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Monto',
        meta: { title: 'Monto' },
        cell: ({ row }) => {
          const type = row.original.type;
          const amount = row.original.amount;
          const isIncome = ['DEPOSIT', 'TRANSFER_IN', 'INTEREST'].includes(type);

          return (
            <div className={`text-right font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
              {isIncome ? '+' : '-'}${Math.abs(amount).toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          );
        },
      },
    ],
    []
  );

  const toolbarActions = selectedRows.length > 0 ? (
    <Button
      size="sm"
      onClick={handleBulkReconcile}
      disabled={isLoading}
    >
      <CheckCircle2 className="mr-2 h-4 w-4" />
      Conciliar ({selectedRows.length})
    </Button>
  ) : null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Movimientos</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Conciliados</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.reconciled}</div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progreso</span>
                <span>{stats.percentage}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-600 transition-all duration-300"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-muted-foreground">Pendientes</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Movements Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Movimientos Pendientes</CardTitle>
              <CardDescription>
                Selecciona los movimientos que deseas conciliar
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pendingMovements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold">Todo conciliado</h3>
              <p className="text-muted-foreground mt-1">
                No hay movimientos pendientes de conciliación
              </p>
            </div>
          ) : (
            <DataTable<BankMovement>
              columns={columns}
              data={pendingMovements}
              totalRows={pendingMovements.length}
              searchPlaceholder="Buscar pendientes..."
              enableRowSelection
              showRowSelection
              onRowSelectionChange={setSelectedRows}
              toolbarActions={toolbarActions}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
