import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getStockMovements } from '../list/actions.server';
import { MovementsTable } from './components/_MovementsTable';
import { MovementFilters } from './components/_MovementFilters';
import { MovementsSummary } from './components/_MovementsSummary';

interface StockMovementsProps {
  searchParams?: {
    page?: string;
    pageSize?: string;
    warehouseId?: string;
    productId?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export async function StockMovements({ searchParams }: StockMovementsProps) {
  const page = Number(searchParams?.page) || 1;
  const pageSize = Number(searchParams?.pageSize) || 20;

  const filters = {
    warehouseId: searchParams?.warehouseId,
    productId: searchParams?.productId,
    type: searchParams?.type as any,
    dateFrom: searchParams?.dateFrom ? new Date(searchParams.dateFrom) : undefined,
    dateTo: searchParams?.dateTo ? new Date(searchParams.dateTo) : undefined,
  };

  const movements = await getStockMovements(filters);

  // Paginate in memory (for now, can be optimized with DB pagination later)
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMovements = movements.slice(startIndex, endIndex);

  const pagination = {
    page,
    pageSize,
    total: movements.length,
    totalPages: Math.ceil(movements.length / pageSize),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Movimientos de Stock</h1>
        <p className="text-muted-foreground">
          Historial completo de todos los movimientos de inventario
        </p>
      </div>

      {/* Summary Statistics */}
      {movements.length > 0 && <MovementsSummary movements={movements} />}

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtra los movimientos por almacén, producto, tipo y fechas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MovementFilters />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
          <CardDescription>
            Total: {movements.length} movimientos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MovementsTable movements={paginatedMovements} pagination={pagination} />
        </CardContent>
      </Card>
    </div>
  );
}
