'use client';

import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  Settings,
  ShoppingCart,
  Package,
  RotateCcw,
  Factory,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react';
import moment from 'moment';
import type { StockMovement } from '../../../shared/types';
import { STOCK_MOVEMENT_TYPE_LABELS } from '../../../shared/types';
import { Button } from '@/shared/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

interface MovementsTableProps {
  movements: StockMovement[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const MOVEMENT_TYPE_CONFIG = {
  PURCHASE: {
    icon: ShoppingCart,
    variant: 'default' as const,
    color: 'text-green-600',
    sign: '+',
  },
  SALE: {
    icon: Package,
    variant: 'secondary' as const,
    color: 'text-blue-600',
    sign: '-',
  },
  ADJUSTMENT: {
    icon: Settings,
    variant: 'outline' as const,
    color: 'text-purple-600',
    sign: '±',
  },
  TRANSFER_OUT: {
    icon: ArrowUp,
    variant: 'destructive' as const,
    color: 'text-red-600',
    sign: '-',
  },
  TRANSFER_IN: {
    icon: ArrowDown,
    variant: 'default' as const,
    color: 'text-green-600',
    sign: '+',
  },
  RETURN: {
    icon: RotateCcw,
    variant: 'secondary' as const,
    color: 'text-orange-600',
    sign: '+',
  },
  PRODUCTION: {
    icon: Factory,
    variant: 'default' as const,
    color: 'text-cyan-600',
    sign: '+',
  },
  LOSS: {
    icon: AlertTriangle,
    variant: 'destructive' as const,
    color: 'text-red-600',
    sign: '-',
  },
};

export function MovementsTable({ movements, pagination }: MovementsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard/commercial/movements?${params.toString()}`);
  };

  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md">
        <TrendingDown className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">No hay movimientos</p>
        <p className="text-sm text-muted-foreground">
          No se encontraron movimientos con los filtros aplicados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Almacén</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => {
              const config = MOVEMENT_TYPE_CONFIG[movement.type];
              const Icon = config.icon;
              const isPositive = ['+'].includes(config.sign);
              const isNegative = ['-'].includes(config.sign);

              return (
                <TableRow key={movement.id}>
                  <TableCell className="font-mono text-sm">
                    {moment(movement.date).format('DD/MM/YYYY HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.variant} className="gap-1">
                      <Icon className="h-3 w-3" />
                      {STOCK_MOVEMENT_TYPE_LABELS[movement.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{movement.product?.name || '-'}</div>
                      <div className="text-xs text-muted-foreground">
                        {movement.product?.code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{movement.warehouse?.name || '-'}</div>
                      <div className="text-xs text-muted-foreground">
                        {movement.warehouse?.code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'font-mono font-semibold',
                        isPositive && 'text-green-600',
                        isNegative && 'text-red-600'
                      )}
                    >
                      {config.sign}
                      {movement.quantity.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      {movement.product?.unitOfMeasure}
                    </span>
                  </TableCell>
                  <TableCell>
                    {movement.referenceType ? (
                      <div className="text-sm">
                        <div className="font-medium">{movement.referenceType}</div>
                        {movement.referenceId && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {movement.referenceId.slice(0, 8)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {movement.notes ? (
                      <span className="text-sm">{movement.notes}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {(pagination.page - 1) * pagination.pageSize + 1} a{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{' '}
            {pagination.total} movimientos
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - pagination.page) <= 1
                  );
                })
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && <span className="px-2">...</span>}
                      <Button
                        variant={page === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
