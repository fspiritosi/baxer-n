'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { CalendarIcon, FileText } from 'lucide-react';
import moment from 'moment';
import { cn } from '@/shared/lib/utils';

type ReportType = 'period' | 'customer' | 'product' | 'vat';

const REPORT_TYPES = {
  period: 'Ventas por Período',
  customer: 'Ventas por Cliente',
  product: 'Ventas por Producto',
  vat: 'Libro IVA Ventas',
};

interface Props {
  onGenerate: (type: ReportType, startDate: Date, endDate: Date) => void;
  loading: boolean;
}

export function _ReportSelector({ onGenerate, loading }: Props) {
  const [reportType, setReportType] = useState<ReportType>('period');
  const [startDate, setStartDate] = useState<Date>(
    moment().startOf('month').toDate()
  );
  const [endDate, setEndDate] = useState<Date>(moment().endOf('month').toDate());

  const handleGenerate = () => {
    onGenerate(reportType, startDate, endDate);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar Reporte</CardTitle>
        <CardDescription>Selecciona el tipo de reporte y el período</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          {/* Tipo de Reporte */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Reporte</label>
            <Select
              value={reportType}
              onValueChange={(value) => setReportType(value as ReportType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REPORT_TYPES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha Desde */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Desde</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? moment(startDate).format('DD/MM/YYYY') : 'Seleccionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha Hasta */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hasta</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? moment(endDate).format('DD/MM/YYYY') : 'Seleccionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Botón Generar */}
          <div className="space-y-2">
            <label className="text-sm font-medium">&nbsp;</label>
            <Button
              onClick={handleGenerate}
              disabled={loading || !startDate || !endDate}
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              {loading ? 'Generando...' : 'Generar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
