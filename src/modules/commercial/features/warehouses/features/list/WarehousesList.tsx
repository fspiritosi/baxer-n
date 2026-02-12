import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getWarehouses } from './actions.server';
import { WarehousesTable } from './components/_WarehousesTable';

interface WarehousesListProps {
  searchParams?: {
    page?: string;
    pageSize?: string;
    search?: string;
    isActive?: string;
  };
}

export async function WarehousesList({ searchParams }: WarehousesListProps) {
  const page = Number(searchParams?.page) || 1;
  const pageSize = Number(searchParams?.pageSize) || 10;
  const search = searchParams?.search || '';
  const isActive = searchParams?.isActive === 'true' ? true : searchParams?.isActive === 'false' ? false : undefined;

  const result = await getWarehouses({
    page,
    pageSize,
    search,
    isActive,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Almacenes</h1>
          <p className="text-muted-foreground">
            Gestiona los almacenes y depósitos de la empresa
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/commercial/warehouses/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Almacén
          </Link>
        </Button>
      </div>

      <WarehousesTable
        data={result.data}
        pagination={result.pagination}
      />
    </div>
  );
}
