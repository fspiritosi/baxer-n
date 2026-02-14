'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, CheckCircle2, Circle } from 'lucide-react';

import { DataTable } from '@/shared/components/common/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { BANK_MOVEMENT_TYPE_LABELS } from '../../../../shared/validators';
import {
  reconcileBankMovement,
  reconcileMultipleBankMovements,
} from '../../../bank-movements/actions.server';

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

interface Props {
  movements: BankMovement[];
  bankAccountId: string;
}

export function _BankMovementsTable({ movements }: Props) {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<BankMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleReconcile = async (movement: BankMovement) => {
    try {
      setIsLoading(true);
      await reconcileBankMovement(movement.id, !movement.reconciled);
      toast.success(
        movement.reconciled ? 'Movimiento desconciliado' : 'Movimiento conciliado'
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al conciliar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkReconcile = async (reconcile: boolean) => {
    const ids = selectedRows.map((r) => r.id);
    if (ids.length === 0) return;

    try {
      setIsLoading(true);
      const result = await reconcileMultipleBankMovements(ids, reconcile);
      toast.success(
        `${result.count} movimiento(s) ${reconcile ? 'conciliado(s)' : 'desconciliado(s)'}`
      );
      setSelectedRows([]);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al conciliar');
    } finally {
      setIsLoading(false);
    }
  };

  const pendingSelected = selectedRows.filter((r) => !r.reconciled);
  const reconciledSelected = selectedRows.filter((r) => r.reconciled);

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
        cell: ({ row }) => {
          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {moment(row.original.date).format('DD/MM/YYYY')}
              </span>
              <span className="text-xs text-muted-foreground">
                {moment(row.original.date).format('HH:mm')}
              </span>
            </div>
          );
        },
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
        cell: ({ row }) => {
          return (
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
          );
        },
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
      {
        accessorKey: 'reconciled',
        header: 'Conciliado',
        meta: { title: 'Conciliado' },
        cell: ({ row }) => {
          const reconciled = row.original.reconciled;
          const reconciledAt = row.original.reconciledAt;

          return (
            <button
              type="button"
              className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity disabled:opacity-50"
              onClick={() => handleToggleReconcile(row.original)}
              disabled={isLoading}
            >
              {reconciled ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <div className="flex flex-col">
                    <span className="text-sm">Conciliado</span>
                    {reconciledAt && (
                      <span className="text-xs text-muted-foreground">
                        {moment(reconciledAt).format('DD/MM/YYYY')}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Pendiente</span>
                </>
              )}
            </button>
          );
        },
      },
    ],
    [isLoading]
  );

  const toolbarActions = (
    <>
      {pendingSelected.length > 0 && (
        <Button
          size="sm"
          onClick={() => handleBulkReconcile(true)}
          disabled={isLoading}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Conciliar ({pendingSelected.length})
        </Button>
      )}
      {reconciledSelected.length > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleBulkReconcile(false)}
          disabled={isLoading}
        >
          <Circle className="mr-2 h-4 w-4" />
          Desconciliar ({reconciledSelected.length})
        </Button>
      )}
    </>
  );

  return (
    <DataTable<BankMovement>
      columns={columns}
      data={movements}
      totalRows={movements.length}
      searchPlaceholder="Buscar movimientos..."
      enableRowSelection
      showRowSelection
      onRowSelectionChange={setSelectedRows}
      toolbarActions={toolbarActions}
    />
  );
}
