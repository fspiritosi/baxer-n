'use client';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Edit, FolderTree, MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { ProductCategory } from '../../shared/types';
import { deleteCategory } from '../actions.server';

interface CategoriesTableProps {
  categories: ProductCategory[];
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) return;

    try {
      await deleteCategory(id);
      toast.success('Categoría eliminada correctamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar');
    }
  };

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md">
        <FolderTree className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">No hay categorías</p>
        <p className="text-sm text-muted-foreground">
          Crea tu primera categoría para organizar tus productos
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría Padre</TableHead>
            <TableHead>Productos</TableHead>
            <TableHead>Subcategorías</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {category.description || '-'}
              </TableCell>
              <TableCell>
                {category.parent ? (
                  <Badge variant="outline">{category.parent.name}</Badge>
                ) : (
                  <span className="text-muted-foreground">Raíz</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {category._count?.products || 0}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {category._count?.children || 0}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
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
                      <Link href={`/dashboard/commercial/categories/${category.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(category.id, category.name)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
