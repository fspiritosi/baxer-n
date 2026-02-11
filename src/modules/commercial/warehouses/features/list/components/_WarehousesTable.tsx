'use client';

import { DataTable } from '@/shared/components/common/DataTable';
import type { WarehouseListItem } from '../actions.server';
import { warehousesColumns } from './_WarehousesColumns';

interface WarehousesTableProps {
  data: WarehouseListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function WarehousesTable({ data, pagination }: WarehousesTableProps) {
  return (
    <DataTable
      columns={warehousesColumns}
      data={data}
      totalRows={pagination.total}
      searchPlaceholder="Buscar almacenes..."
    />
  );
}
