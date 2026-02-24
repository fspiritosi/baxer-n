'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import moment from 'moment';
import { useCallback, useMemo } from 'react';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

interface PeriodSelectorProps {
  currentPeriod: string; // "YYYY-MM"
}

export function _PeriodSelector({ currentPeriod }: PeriodSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ref = useMemo(() => moment(currentPeriod, 'YYYY-MM'), [currentPeriod]);
  const currentMonth = ref.month(); // 0-11
  const currentYear = ref.year();
  const isCurrentMonth = ref.isSame(moment(), 'month');

  // Generar años disponibles (últimos 5 años hasta el actual)
  const thisYear = moment().year();
  const years = useMemo(() => {
    const result: number[] = [];
    for (let y = thisYear; y >= thisYear - 4; y--) {
      result.push(y);
    }
    return result;
  }, [thisYear]);

  const navigate = useCallback(
    (period: string) => {
      const params = new URLSearchParams(searchParams.toString());
      // Si es mes actual, quitar el parámetro
      if (moment(period, 'YYYY-MM').isSame(moment(), 'month')) {
        params.delete('month');
      } else {
        params.set('month', period);
      }
      const query = params.toString();
      router.push(`/dashboard${query ? `?${query}` : ''}`);
    },
    [router, searchParams],
  );

  const goToPrevMonth = useCallback(() => {
    const prev = ref.clone().subtract(1, 'month').format('YYYY-MM');
    navigate(prev);
  }, [ref, navigate]);

  const goToNextMonth = useCallback(() => {
    if (isCurrentMonth) return;
    const next = ref.clone().add(1, 'month').format('YYYY-MM');
    navigate(next);
  }, [ref, isCurrentMonth, navigate]);

  const goToCurrentMonth = useCallback(() => {
    navigate(moment().format('YYYY-MM'));
  }, [navigate]);

  const onMonthChange = useCallback(
    (month: string) => {
      const newPeriod = moment({ year: currentYear, month: parseInt(month) }).format('YYYY-MM');
      navigate(newPeriod);
    },
    [currentYear, navigate],
  );

  const onYearChange = useCallback(
    (year: string) => {
      const newPeriod = moment({ year: parseInt(year), month: currentMonth }).format('YYYY-MM');
      navigate(newPeriod);
    },
    [currentMonth, navigate],
  );

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToPrevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Select value={String(currentMonth)} onValueChange={onMonthChange}>
        <SelectTrigger className="h-8 w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((name, idx) => (
            <SelectItem key={idx} value={String(idx)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(currentYear)} onValueChange={onYearChange}>
        <SelectTrigger className="h-8 w-[90px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={goToNextMonth}
        disabled={isCurrentMonth}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {!isCurrentMonth && (
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={goToCurrentMonth}>
          <RotateCcw className="mr-1 h-3 w-3" />
          Hoy
        </Button>
      )}
    </div>
  );
}
