'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import { saveAccountingSettings, getAccountingSettings } from '../actions.server';
import { useState } from 'react';

// Esquema de validación con transformación de "__clear__" a null
const commercialIntegrationSchema = z.object({
  salesAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
  purchasesAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
  receivablesAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
  payablesAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
  vatDebitAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
  vatCreditAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
  defaultCashAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
  defaultBankAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
});

type FormValues = z.infer<typeof commercialIntegrationSchema>;

interface CommercialIntegrationFormProps {
  companyId: string;
  accounts: Array<{
    id: string;
    code: string;
    name: string;
    type: string;
    nature: string;
  }>;
  defaultValues: FormValues;
}

export function _CommercialIntegrationForm({
  companyId,
  accounts,
  defaultValues,
}: CommercialIntegrationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(commercialIntegrationSchema),
    defaultValues,
  });

  const handleSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      // Obtener configuración actual para preservar las fechas del ejercicio
      const currentSettings = await getAccountingSettings(companyId);

      if (!currentSettings) {
        toast.error('Debes configurar primero el ejercicio fiscal');
        return;
      }

      await saveAccountingSettings(companyId, {
        fiscalYearStart: currentSettings.fiscalYearStart,
        fiscalYearEnd: currentSettings.fiscalYearEnd,
        ...data,
      });

      toast.success('Configuración de integración guardada correctamente');
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al guardar la configuración');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatAccountOption = (account: (typeof accounts)[0]) => {
    return `${account.code} - ${account.name}`;
  };

  // Helper para manejar el cambio de valor en los selects
  const handleSelectChange = (field: keyof FormValues, value: string) => {
    form.setValue(field, value === '__clear__' ? null : value);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Ventas y Compras */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Cuentas de Resultado</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="salesAccountId">Cuenta de Ventas</Label>
            <Select
              value={form.watch('salesAccountId') || undefined}
              onValueChange={(value) => handleSelectChange('salesAccountId', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="salesAccountId">
                <SelectValue placeholder="Seleccionar cuenta..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__clear__">Sin asignar</SelectItem>
                {accounts
                  .filter((acc) => acc.type === 'INCOME')
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {formatAccountOption(account)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Se usa al confirmar facturas de venta (Haber)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchasesAccountId">Cuenta de Compras</Label>
            <Select
              value={form.watch('purchasesAccountId') || undefined}
              onValueChange={(value) => handleSelectChange('purchasesAccountId', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="purchasesAccountId">
                <SelectValue placeholder="Seleccionar cuenta..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__clear__">Sin asignar</SelectItem>
                {accounts
                  .filter((acc) => acc.type === 'EXPENSE')
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {formatAccountOption(account)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Se usa al confirmar facturas de compra (Debe)
            </p>
          </div>
        </div>
      </div>

      {/* Cuentas por Cobrar y Pagar */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Cuentas de Crédito y Deuda</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="receivablesAccountId">Cuentas por Cobrar</Label>
            <Select
              value={form.watch('receivablesAccountId') || undefined}
              onValueChange={(value) => handleSelectChange('receivablesAccountId', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="receivablesAccountId">
                <SelectValue placeholder="Seleccionar cuenta..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__clear__">Sin asignar</SelectItem>
                {accounts
                  .filter((acc) => acc.type === 'ASSET')
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {formatAccountOption(account)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Se usa en facturas de venta (Debe) y recibos (Haber)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payablesAccountId">Cuentas por Pagar</Label>
            <Select
              value={form.watch('payablesAccountId') || undefined}
              onValueChange={(value) => handleSelectChange('payablesAccountId', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="payablesAccountId">
                <SelectValue placeholder="Seleccionar cuenta..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__clear__">Sin asignar</SelectItem>
                {accounts
                  .filter((acc) => acc.type === 'LIABILITY')
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {formatAccountOption(account)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Se usa en facturas de compra (Haber) y órdenes de pago (Debe)
            </p>
          </div>
        </div>
      </div>

      {/* IVA */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Cuentas de IVA</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vatDebitAccountId">IVA Débito Fiscal</Label>
            <Select
              value={form.watch('vatDebitAccountId') || undefined}
              onValueChange={(value) => handleSelectChange('vatDebitAccountId', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="vatDebitAccountId">
                <SelectValue placeholder="Seleccionar cuenta..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__clear__">Sin asignar</SelectItem>
                {accounts
                  .filter((acc) => acc.type === 'LIABILITY')
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {formatAccountOption(account)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              IVA de ventas (Haber)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vatCreditAccountId">IVA Crédito Fiscal</Label>
            <Select
              value={form.watch('vatCreditAccountId') || undefined}
              onValueChange={(value) => handleSelectChange('vatCreditAccountId', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="vatCreditAccountId">
                <SelectValue placeholder="Seleccionar cuenta..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__clear__">Sin asignar</SelectItem>
                {accounts
                  .filter((acc) => acc.type === 'ASSET')
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {formatAccountOption(account)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              IVA de compras (Debe)
            </p>
          </div>
        </div>
      </div>

      {/* Tesorería */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Cuentas de Tesorería (Opcional)</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="defaultCashAccountId">Caja por Defecto</Label>
            <Select
              value={form.watch('defaultCashAccountId') || undefined}
              onValueChange={(value) => handleSelectChange('defaultCashAccountId', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="defaultCashAccountId">
                <SelectValue placeholder="Seleccionar cuenta..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__clear__">Sin asignar</SelectItem>
                {accounts
                  .filter((acc) => acc.type === 'ASSET')
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {formatAccountOption(account)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Se usa si la caja no tiene cuenta específica asignada
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultBankAccountId">Banco por Defecto</Label>
            <Select
              value={form.watch('defaultBankAccountId') || undefined}
              onValueChange={(value) => handleSelectChange('defaultBankAccountId', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="defaultBankAccountId">
                <SelectValue placeholder="Seleccionar cuenta..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__clear__">Sin asignar</SelectItem>
                {accounts
                  .filter((acc) => acc.type === 'ASSET')
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {formatAccountOption(account)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Se usa si la cuenta bancaria no tiene cuenta específica asignada
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar Configuración
        </Button>
      </div>
    </form>
  );
}
