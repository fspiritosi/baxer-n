'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/shared/components/common/DataTable';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Badge } from '@/shared/components/ui/badge';
import { deleteProduct } from '../actions.server';
import type { Product } from '../../../shared/types';
import {
  PRODUCT_TYPE_LABELS,
  PRODUCT_STATUS_LABELS,
  UNIT_OF_MEASURE_LABELS,
} from '../../../shared/types';
import { logger } from '@/shared/lib/logger';

interface ProductsTableProps {
  products: Product[];
}

export function _ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteProduct(id);
      toast.success('Producto eliminado correctamente');
      router.refresh();
    } catch (error) {
      logger.error('Error al eliminar producto', { data: { error } });
      toast.error(error instanceof Error ? error.message : 'Error al eliminar producto');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Código',
        meta: { title: 'Código' },
      },
      {
        accessorKey: 'name',
        header: 'Nombre',
        meta: { title: 'Nombre' },
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            {row.original.description && (
              <span className="text-xs text-muted-foreground">
                {row.original.description.substring(0, 50)}
                {row.original.description.length > 50 ? '...' : ''}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Tipo',
        meta: { title: 'Tipo' },
        cell: ({ row }) => {
          const type = row.original.type;
          return (
            <Badge variant={type === 'PRODUCT' ? 'default' : 'secondary'}>
              {PRODUCT_TYPE_LABELS[type]}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'category',
        header: 'Categoría',
        meta: { title: 'Categoría' },
        cell: ({ row }) => {
          const category = row.original.category;
          return category ? (
            <span className="text-sm">{category.name}</span>
          ) : (
            <span className="text-sm text-muted-foreground">Sin categoría</span>
          );
        },
      },
      {
        accessorKey: 'costPrice',
        header: 'Precio Costo',
        meta: { title: 'Precio Costo' },
        cell: ({ row }) => `$${row.original.costPrice.toFixed(2)}`,
      },
      {
        accessorKey: 'salePrice',
        header: 'Precio Venta',
        meta: { title: 'Precio Venta' },
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">${row.original.salePrice.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">
              Con IVA: ${row.original.salePriceWithTax.toFixed(2)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'trackStock',
        header: 'Stock',
        meta: { title: 'Stock' },
        cell: ({ row }) => {
          const product = row.original;
          if (!product.trackStock) {
            return <span className="text-sm text-muted-foreground">No controlado</span>;
          }

          const minStock = product.minStock || 0;
          const maxStock = product.maxStock;

          return (
            <div className="flex flex-col text-xs">
              <span>Mín: {minStock}</span>
              {maxStock && <span>Máx: {maxStock}</span>}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        meta: { title: 'Estado' },
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>
              {PRODUCT_STATUS_LABELS[status]}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        meta: { title: 'Acciones' },
        cell: ({ row }) => {
          const product = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/commercial/products/${product.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalle
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/commercial/products/${product.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(product.id, product.name)}
                  disabled={deletingId === product.id}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [deletingId, router]
  );

  return (
    <DataTable
      columns={columns as ColumnDef<Record<string, unknown>, unknown>[]}
      data={products as unknown as Record<string, unknown>[]}
      totalRows={products.length}
      toolbarActions={
        <Link href="/dashboard/commercial/products/new">
          <Button>Nuevo Producto</Button>
        </Link>
      }
    />
  );
}
