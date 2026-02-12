'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import {
  DataTable,
  type DataTableSearchParams,
} from '@/shared/components/common/DataTable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import type { ModulePermissions } from '@/shared/lib/permissions';
import { getColumns } from '../columns';
import type { Product } from '../../../shared/types';
import { deleteProduct } from '../actions.server';

interface ProductsTableProps {
  data: Product[];
  totalRows: number;
  searchParams: DataTableSearchParams;
  permissions: ModulePermissions;
}

export function _ProductsTable({ data, totalRows, searchParams, permissions }: ProductsTableProps) {
  const router = useRouter();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProduct(deletingProduct.id);
      toast.success('Producto eliminado correctamente');
      handleRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar producto';
      toast.error(message);
    } finally {
      setDeletingProduct(null);
    }
  };

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: setEditingProduct,
        onDelete: setDeletingProduct,
        permissions,
      }),
    [permissions]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        totalRows={totalRows}
        searchParams={searchParams}
        searchPlaceholder="Buscar productos..."
        toolbarActions={
          permissions.canCreate ? (
            <Button onClick={() => router.push('/dashboard/commercial/products/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          ) : null
        }
      />

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              El producto "{deletingProduct?.name}" será eliminado permanentemente.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
