'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import moment from 'moment';

import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import type { Granularity } from '../actions.server';

const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
];

export function _GranularitySelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentGranularity = (searchParams.get('granularity') as Granularity) || 'weekly';
  const currentMonth = searchParams.get('month'); // YYYY-MM or null

  const displayMoment = currentMonth
    ? moment.utc(currentMonth, 'YYYY-MM')
    : moment();

  const isCurrentMonth = !currentMonth || moment().format('YYYY-MM') === currentMonth;

  const navigate = (params: { granularity?: string; month?: string | null }) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (params.granularity) sp.set('granularity', params.granularity);
    if (params.month === null) {
      sp.delete('month');
    } else if (params.month) {
      sp.set('month', params.month);
    }
    router.push(`?${sp.toString()}`);
  };

  const handleGranularityChange = (value: string) => {
    navigate({ granularity: value });
  };

  const handlePrevMonth = () => {
    const prev = displayMoment.clone().subtract(1, 'month').format('YYYY-MM');
    navigate({ month: prev });
  };

  const handleNextMonth = () => {
    const next = displayMoment.clone().add(1, 'month').format('YYYY-MM');
    navigate({ month: next });
  };

  const handleResetToToday = () => {
    navigate({ month: null });
  };

  return (
    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
      {/* Navegación por mes */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handlePrevMonth}
          title="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="min-w-[120px] text-center text-sm font-medium capitalize">
          {displayMoment.format('MMMM YYYY')}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleNextMonth}
          title="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {!isCurrentMonth && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleResetToToday}
            title="Volver a hoy"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Granularidad */}
      <Tabs value={currentGranularity} onValueChange={handleGranularityChange}>
        <TabsList>
          {GRANULARITY_OPTIONS.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
