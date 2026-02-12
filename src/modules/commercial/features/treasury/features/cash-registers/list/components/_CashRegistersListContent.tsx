'use client';

import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

import { getCashRegisters } from '../actions.server';
import type { CashRegisterWithActiveSession } from '../../../../shared/types';
import { _CashRegistersTable } from './_CashRegistersTable';
import { _CashRegisterFormModal } from './_CashRegisterFormModal';

interface Props {
  initialData: CashRegisterWithActiveSession[];
}

export function _CashRegistersListContent({ initialData }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: cashRegisters = initialData, refetch, isRefetching } = useQuery({
    queryKey: ['cash-registers'],
    queryFn: () => getCashRegisters(),
    initialData,
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cajas Registradoras</CardTitle>
              <CardDescription>Gestión de cajas y control de efectivo</CardDescription>
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
                Nueva Caja
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {cashRegisters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No hay cajas registradoras creadas</p>
              <Button className="mt-4" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Caja
              </Button>
            </div>
          ) : (
            <_CashRegistersTable cashRegisters={cashRegisters} onRefresh={handleRefresh} />
          )}
        </CardContent>
      </Card>

      <_CashRegisterFormModal
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
