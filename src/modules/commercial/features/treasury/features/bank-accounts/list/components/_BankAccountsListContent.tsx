'use client';

import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

import { getBankAccounts } from '../actions.server';
import type { BankAccountWithBalance } from '../../../../shared/types';
import { _BankAccountsTable } from './_BankAccountsTable';
import { _BankAccountFormModal } from './_BankAccountFormModal';

interface Props {
  initialData: BankAccountWithBalance[];
}

export function _BankAccountsListContent({ initialData }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: bankAccounts = initialData, refetch, isRefetching } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => getBankAccounts(),
    initialData,
  });

  const handleRefresh = () => {
    refetch();
  };

  // Calcular saldo total
  const totalBalance = bankAccounts.reduce((acc, account) => {
    if (account.status === 'ACTIVE') {
      return acc + account.balance;
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total en Bancos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Cuentas activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bankAccounts.filter((a) => a.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              De {bankAccounts.length} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bankAccounts.reduce((acc, account) => acc + (account._count?.movements || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cuentas Bancarias</CardTitle>
              <CardDescription>Gestión de cuentas bancarias y movimientos</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefetching}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Cuenta
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bankAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No hay cuentas bancarias creadas</p>
              <Button className="mt-4" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Cuenta
              </Button>
            </div>
          ) : (
            <_BankAccountsTable bankAccounts={bankAccounts} onRefresh={handleRefresh} />
          )}
        </CardContent>
      </Card>

      <_BankAccountFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          handleRefresh();
        }}
      />
    </div>
  );
}
