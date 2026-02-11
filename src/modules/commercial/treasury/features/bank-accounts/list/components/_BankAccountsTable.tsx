'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Power, PowerOff, Lock, ArrowLeftRight } from 'lucide-react';
import moment from 'moment';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/shared/components/common/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

import {
  activateBankAccount,
  deactivateBankAccount,
  closeBankAccount,
} from '../../actions.server';
import type { BankAccountWithBalance } from '../../../../shared/types';
import {
  BANK_ACCOUNT_TYPE_LABELS,
  BANK_ACCOUNT_STATUS_LABELS,
  BANK_ACCOUNT_STATUS_BADGES,
} from '../../../../shared/validators';
import { _BankAccountFormModal } from './_BankAccountFormModal';

interface Props {
  bankAccounts: BankAccountWithBalance[];
  onRefresh: () => void;
}

export function _BankAccountsTable({ bankAccounts, onRefresh }: Props) {
  const [selectedAccount, setSelectedAccount] = useState<BankAccountWithBalance | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (account: BankAccountWithBalance) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = async (account: BankAccountWithBalance) => {
    try {
      setIsLoading(true);
      if (account.status === 'ACTIVE') {
        await deactivateBankAccount(account.id);
        toast.success('Cuenta desactivada correctamente');
      } else {
        await activateBankAccount(account.id);
        toast.success('Cuenta activada correctamente');
      }
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cambiar estado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async (account: BankAccountWithBalance) => {
    if (account.balance !== 0) {
      toast.error('La cuenta debe tener saldo $0.00 para poder cerrarse');
      return;
    }

    try {
      setIsLoading(true);
      await closeBankAccount(account.id);
      toast.success('Cuenta cerrada correctamente');
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cerrar cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<BankAccountWithBalance>[] = [
    {
      accessorKey: 'bankName',
      header: 'Banco',
      meta: { title: 'Banco' },
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.bankName}</p>
          <p className="text-sm text-muted-foreground">
            {BANK_ACCOUNT_TYPE_LABELS[row.original.accountType]}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'accountNumber',
      header: 'Número de Cuenta',
      meta: { title: 'Número de Cuenta' },
      cell: ({ row }) => (
        <div>
          <p className="font-mono">{row.original.accountNumber}</p>
          {row.original.alias && (
            <p className="text-sm text-muted-foreground">{row.original.alias}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'cbu',
      header: 'CBU',
      meta: { title: 'CBU' },
      cell: ({ row }) => {
        return row.original.cbu ? (
          <span className="font-mono text-sm">{row.original.cbu}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'balance',
      header: 'Saldo',
      meta: { title: 'Saldo' },
      cell: ({ row }) => {
        const balance = row.original.balance;
        const isNegative = balance < 0;
        return (
          <div className={`text-right font-semibold ${isNegative ? 'text-red-600' : ''}`}>
            ${balance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      meta: { title: 'Estado' },
      cell: ({ row }) => (
        <Badge variant={BANK_ACCOUNT_STATUS_BADGES[row.original.status]}>
          {BANK_ACCOUNT_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      meta: { title: 'Acciones' },
      cell: ({ row }) => {
        const account = row.original;
        const isActive = account.status === 'ACTIVE';
        const isClosed = account.status === 'CLOSED';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>

              {!isClosed && (
                <>
                  <DropdownMenuItem onClick={() => handleEdit(account)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>

                  <DropdownMenuItem disabled>
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    Ver Movimientos
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => handleToggleStatus(account)} disabled={isLoading}>
                    {isActive ? (
                      <>
                        <PowerOff className="mr-2 h-4 w-4" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <Power className="mr-2 h-4 w-4" />
                        Activar
                      </>
                    )}
                  </DropdownMenuItem>

                  {account.balance === 0 && (
                    <DropdownMenuItem onClick={() => handleClose(account)} disabled={isLoading}>
                      <Lock className="mr-2 h-4 w-4" />
                      Cerrar Cuenta
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable<BankAccountWithBalance>
        columns={columns}
        data={bankAccounts}
        totalRows={bankAccounts.length}
      />

      {selectedAccount && (
        <_BankAccountFormModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          bankAccount={selectedAccount}
          onSuccess={() => {
            setIsEditModalOpen(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
