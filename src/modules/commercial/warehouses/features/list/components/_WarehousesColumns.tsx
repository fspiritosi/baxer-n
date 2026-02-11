'use client';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, Eye, MoreHorizontal, Power, PowerOff, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { deleteWarehouse, toggleWarehouseActive, type WarehouseListItem } from '../actions.server';
import { WAREHOUSE_TYPE_LABELS } from '../../../shared/types';

export const warehousesColumns: ColumnDef<WarehouseListItem>[] = [
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Código
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    meta: { title: 'Código' },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    meta: { title: 'Nombre' },
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    meta: { title: 'Tipo' },
    cell: ({ row }) => {
      const warehouse = row.original;
      return (
        <Badge variant="outline">
          {WAREHOUSE_TYPE_LABELS[warehouse.type]}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'location',
    header: 'Ubicación',
    meta: { title: 'Ubicación' },
    cell: ({ row }) => {
      const { city, state } = row.original;
      if (!city && !state) return <span className="text-muted-foreground">-</span>;
      const parts = [city, state].filter(Boolean);
      return <span>{parts.join(', ')}</span>;
    },
  },
  {
    accessorKey: 'stockCount',
    header: 'Productos',
    meta: { title: 'Productos' },
    cell: ({ row }) => {
      const count = row.original._count?.stocks || 0;
      return (
        <Badge variant="secondary">
          {count}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'movementsCount',
    header: 'Movimientos',
    meta: { title: 'Movimientos' },
    cell: ({ row }) => {
      const count = row.original._count?.movements || 0;
      return (
        <Badge variant="secondary">
          {count}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Estado',
    meta: { title: 'Estado' },
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    meta: { title: 'Acciones' },
    cell: ({ row }) => {
      const warehouse = row.original;

      const handleToggleActive = async () => {
        try {
          await toggleWarehouseActive(warehouse.id);
          toast.success(
            warehouse.isActive
              ? 'Almacén desactivado correctamente'
              : 'Almacén activado correctamente'
          );
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Error al cambiar el estado');
        }
      };

      const handleDelete = async () => {
        if (!confirm('¿Estás seguro de eliminar este almacén?')) return;

        try {
          await deleteWarehouse(warehouse.id);
          toast.success('Almacén eliminado correctamente');
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Error al eliminar');
        }
      };

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
              <Link href={`/dashboard/commercial/warehouses/${warehouse.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/commercial/warehouses/${warehouse.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleToggleActive}>
              {warehouse.isActive ? (
                <>
                  <PowerOff className="mr-2 h-4 w-4" />
                  Desactivar
                </>
              ) : (
                <>
                  <Power className="mr-2 h-4 w-4" />
                  Activar
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
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
];
