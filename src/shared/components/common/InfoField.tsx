/**
 * InfoField - Componente reutilizable para mostrar un campo de información
 * Usado en páginas de detalle para mostrar etiqueta + valor
 */

import { cn } from '@/shared/lib/utils';

interface InfoFieldProps {
  /** Etiqueta del campo */
  label: string;
  /** Valor a mostrar */
  value: string | number | null | undefined;
  /** Texto a mostrar si el valor es nulo/vacío */
  fallback?: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Orientación del campo */
  orientation?: 'vertical' | 'horizontal';
}

export function InfoField({
  label,
  value,
  fallback = 'No especificado',
  className,
  orientation = 'vertical',
}: InfoFieldProps) {
  const displayValue = value === null || value === undefined || value === ''
    ? fallback
    : String(value);

  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex items-center justify-between gap-2', className)}>
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-medium text-right">{displayValue}</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{displayValue}</p>
    </div>
  );
}

/**
 * InfoFieldGroup - Agrupa varios InfoField en un grid
 */
interface InfoFieldGroupProps {
  children: React.ReactNode;
  /** Número de columnas en pantallas medianas */
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function InfoFieldGroup({
  children,
  columns = 2,
  className,
}: InfoFieldGroupProps) {
  const colsClass = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', colsClass[columns], className)}>
      {children}
    </div>
  );
}
