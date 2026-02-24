'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { X } from 'lucide-react';
import { BANK_MOVEMENT_TYPE_LABELS } from '../../../../shared/validators';

export function _BankMovementFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get('movementType') || '';
  const currentDateFrom = searchParams.get('dateFrom') || '';
  const currentDateTo = searchParams.get('dateTo') || '';

  // Estado local para los date inputs (evita re-render del server al tipear)
  const [dateFrom, setDateFrom] = useState(currentDateFrom);
  const [dateTo, setDateTo] = useState(currentDateTo);

  // Sincronizar estado local cuando cambian los searchParams (ej: al limpiar filtros)
  useEffect(() => {
    setDateFrom(currentDateFrom);
  }, [currentDateFrom]);

  useEffect(() => {
    setDateTo(currentDateTo);
  }, [currentDateTo]);

  const hasFilters = currentType || currentDateFrom || currentDateTo;

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleDateFromBlur = () => {
    if (dateFrom !== currentDateFrom) {
      pushParams({ dateFrom: dateFrom || null });
    }
  };

  const handleDateToBlur = () => {
    if (dateTo !== currentDateTo) {
      pushParams({ dateTo: dateTo || null });
    }
  };

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('movementType');
    params.delete('dateFrom');
    params.delete('dateTo');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Type Filter */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Tipo</label>
        <Select
          value={currentType || 'all'}
          onValueChange={(v) => pushParams({ movementType: v === 'all' ? null : v })}
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {Object.entries(BANK_MOVEMENT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date From */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Desde</label>
        <Input
          type="date"
          className="w-[160px] h-9"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          onBlur={handleDateFromBlur}
        />
      </div>

      {/* Date To */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Hasta</label>
        <Input
          type="date"
          className="w-[160px] h-9"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          onBlur={handleDateToBlur}
        />
      </div>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-9">
          <X className="mr-1 h-3.5 w-3.5" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
