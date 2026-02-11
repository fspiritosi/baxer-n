'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Pencil, Trash2, Star } from 'lucide-react';
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
import { deletePriceList, setDefaultPriceList } from '../actions.server';
import type { PriceList } from '../../../../shared/types';
import { logger } from '@/shared/lib/logger';

interface PriceListsTableProps {
  priceLists: PriceList[];
}

export function _PriceListsTable({ priceLists }: PriceListsTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar la lista de precios "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deletePriceList(id);
      toast.success('Lista de precios eliminada correctamente');
      router.refresh();
    } catch (error) {
      logger.error('Error al eliminar lista de precios', { data: { error } });
      toast.error(error instanceof Error ? error.message : 'Error al eliminar lista de precios');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string, name: string) => {
    setSettingDefaultId(id);
    try {
      await setDefaultPriceList(id);
      toast.success(`"${name}" marcada como lista predeterminada`);
      router.refresh();
    } catch (error) {
      logger.error('Error al marcar como predeterminada', { data: { error } });
      toast.error(error instanceof Error ? error.message : 'Error al marcar como predeterminada');
    } finally {
      setSettingDefaultId(null);
    }
  };

  const columns = useMemo<ColumnDef<PriceList>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nombre',
        meta: { title: 'Nombre' },
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.isDefault && (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            )}
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Descripción',
        meta: { title: 'Descripción' },
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.description || 'Sin descripción'}
          </span>
        ),
      },
      {
        accessorKey: '_count.items',
        header: 'Productos',
        meta: { title: 'Productos' },
        cell: ({ row }) => {
          const count = row.original._count?.items || 0;
          return (
            <Badge variant="outline">
              {count} {count === 1 ? 'producto' : 'productos'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'isDefault',
        header: 'Predeterminada',
        meta: { title: 'Predeterminada' },
        cell: ({ row }) => (
          <Badge variant={row.original.isDefault ? 'default' : 'outline'}>
            {row.original.isDefault ? 'Sí' : 'No'}
          </Badge>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Estado',
        meta: { title: 'Estado' },
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
            {row.original.isActive ? 'Activa' : 'Inactiva'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        meta: { title: 'Acciones' },
        cell: ({ row }) => {
          const priceList = row.original;

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
                  <Link href={`/dashboard/commercial/price-lists/${priceList.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver precios
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/commercial/price-lists/${priceList.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                {!priceList.isDefault && (
                  <DropdownMenuItem
                    onClick={() => handleSetDefault(priceList.id, priceList.name)}
                    disabled={settingDefaultId === priceList.id}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Marcar como predeterminada
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(priceList.id, priceList.name)}
                  disabled={deletingId === priceList.id}
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
    [deletingId, settingDefaultId, router]
  );

  return (
    <DataTable
      columns={columns as ColumnDef<Record<string, unknown>, unknown>[]}
      data={priceLists as unknown as Record<string, unknown>[]}
      totalRows={priceLists.length}
      toolbarActions={
        <Link href="/dashboard/commercial/price-lists/new">
          <Button>Nueva Lista de Precios</Button>
        </Link>
      }
    />
  );
}
