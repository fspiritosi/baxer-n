import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getStockMovements } from '../list/actions.server';
import { getWarehousesForSelect, getStockProductsForSelect } from './actions.server';
import { MovementsTable } from './components/_MovementsTable';
import { MovementFilters } from './components/_MovementFilters';
import { MovementsSummary } from './components/_MovementsSummary';
import { _MovementActions } from './components/_MovementActions';

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

  // Fetch data in parallel
  const [movements, warehouses, products] = await Promise.all([
    getStockMovements(filters),
    getWarehousesForSelect(),
    getStockProductsForSelect(),
  ]);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimientos de Stock</h1>
          <p className="text-muted-foreground">
            Historial completo de todos los movimientos de inventario
          </p>
        </div>
        <_MovementActions warehouses={warehouses} products={products} />
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
