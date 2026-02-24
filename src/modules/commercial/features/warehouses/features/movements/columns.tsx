'use client';

import type { ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import {
  ArrowDown,
  ArrowUp,
  ShoppingCart,
  Package,
  Settings,
  RotateCcw,
  Factory,
  AlertTriangle,
} from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { DataTableColumnHeader } from '@/shared/components/common/DataTable';
import type { StockMovement } from '../../shared/types';
import { STOCK_MOVEMENT_TYPE_LABELS } from '../../shared/types';
import { cn } from '@/shared/lib/utils';

const MOVEMENT_TYPE_CONFIG: Record<string, {
  icon: typeof ShoppingCart;
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  color: string;
  sign: string;
}> = {
  PURCHASE: { icon: ShoppingCart, variant: 'default', color: 'text-green-600', sign: '+' },
  SALE: { icon: Package, variant: 'secondary', color: 'text-blue-600', sign: '-' },
  ADJUSTMENT: { icon: Settings, variant: 'outline', color: 'text-purple-600', sign: '±' },
  TRANSFER_OUT: { icon: ArrowUp, variant: 'destructive', color: 'text-red-600', sign: '-' },
  TRANSFER_IN: { icon: ArrowDown, variant: 'default', color: 'text-green-600', sign: '+' },
  RETURN: { icon: RotateCcw, variant: 'secondary', color: 'text-orange-600', sign: '+' },
  PRODUCTION: { icon: Factory, variant: 'default', color: 'text-cyan-600', sign: '+' },
  LOSS: { icon: AlertTriangle, variant: 'destructive', color: 'text-red-600', sign: '-' },
};

export function getColumns(): ColumnDef<StockMovement>[] {
  return [
    {
      accessorKey: 'date',
      meta: { title: 'Fecha' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {moment(row.original.date).format('DD/MM/YYYY HH:mm')}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      meta: { title: 'Tipo' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
      cell: ({ row }) => {
        const config = MOVEMENT_TYPE_CONFIG[row.original.type];
        if (!config) return <Badge variant="outline">{row.original.type}</Badge>;
        const Icon = config.icon;
        return (
          <Badge variant={config.variant} className="gap-1">
            <Icon className="h-3 w-3" />
            {STOCK_MOVEMENT_TYPE_LABELS[row.original.type]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'product.name',
      meta: { title: 'Producto' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Producto" />,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.product?.name || '-'}</div>
          <div className="text-xs text-muted-foreground">{row.original.product?.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'warehouse.name',
      meta: { title: 'Almacén' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Almacén" />,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.warehouse?.name || '-'}</div>
          <div className="text-xs text-muted-foreground">{row.original.warehouse?.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      meta: { title: 'Cantidad' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Cantidad" />,
      cell: ({ row }) => {
        const config = MOVEMENT_TYPE_CONFIG[row.original.type];
        const isPositive = config?.sign === '+';
        const isNegative = config?.sign === '-';

        return (
          <div className="text-right">
            <span
              className={cn(
                'font-mono font-semibold',
                isPositive && 'text-green-600',
                isNegative && 'text-red-600'
              )}
            >
              {config?.sign}
              {row.original.quantity.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              {row.original.product?.unitOfMeasure}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'referenceType',
      meta: { title: 'Referencia' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Referencia" />,
      cell: ({ row }) =>
        row.original.referenceType ? (
          <div className="text-sm">
            <div className="font-medium">{row.original.referenceType}</div>
            {row.original.referenceId && (
              <div className="text-xs text-muted-foreground font-mono">
                {(row.original.referenceId as string).slice(0, 8)}
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: 'notes',
      meta: { title: 'Notas' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Notas" />,
      cell: ({ row }) =>
        row.original.notes ? (
          <span className="text-sm max-w-xs truncate block">{row.original.notes}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
  ];
}
