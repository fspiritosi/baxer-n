'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/shared/components/ui/chart';
import { formatCurrency } from '@/shared/utils/formatters';
import type { CashflowRow } from '../actions.server';

interface Props {
  data: CashflowRow[];
}

const chartConfig = {
  inflows: {
    label: 'Ingresos',
    color: 'hsl(142, 71%, 45%)',
  },
  outflows: {
    label: 'Egresos',
    color: 'hsl(0, 84%, 60%)',
  },
  projectedBalance: {
    label: 'Saldo Proyectado',
    color: 'hsl(221, 83%, 53%)',
  },
} satisfies ChartConfig;

export function _CashflowChart({ data }: Props) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Proyección de Flujo de Caja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Sin datos para el período seleccionado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Proyección de Flujo de Caja</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="periodLabel" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(value) => {
                if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
                if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
                return `$${value}`;
              }}
              width={60}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(Number(value))}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="inflows" fill="var(--color-inflows)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflows" fill="var(--color-outflows)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>

        {/* Línea de saldo proyectado */}
        <ChartContainer config={chartConfig} className="h-[150px] w-full mt-4">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-projectedBalance)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-projectedBalance)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="periodLabel" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(value) => {
                if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
                if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
                return `$${value}`;
              }}
              width={60}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(Number(value))}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="projectedBalance"
              stroke="var(--color-projectedBalance)"
              fill="url(#fillBalance)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
