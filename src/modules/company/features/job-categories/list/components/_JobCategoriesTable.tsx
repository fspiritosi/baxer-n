'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

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
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

import { deleteJobCategory, getAllJobCategories, type JobCategoryListItem } from '../actions.server';
import { _JobCategoryFormModal } from './_JobCategoryFormModal';

interface Props {
  initialData: JobCategoryListItem[];
}

export function _JobCategoriesTable({ initialData }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJobCategory, setSelectedJobCategory] = useState<JobCategoryListItem | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['jobCategories'],
    queryFn: getAllJobCategories,
    initialData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJobCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobCategories'] });
      toast.success('Categoría laboral eliminada');
      setDeleteDialogOpen(false);
      setSelectedJobCategory(null);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar');
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedJobCategory(null);
    setFormModalOpen(true);
  };

  const handleEdit = (jobCategory: JobCategoryListItem) => {
    setSelectedJobCategory(jobCategory);
    setFormModalOpen(true);
  };

  const handleDelete = (jobCategory: JobCategoryListItem) => {
    setSelectedJobCategory(jobCategory);
    setDeleteDialogOpen(true);
  };

  const handleFormModalClose = (open: boolean) => {
    setFormModalOpen(open);
    if (!open) setSelectedJobCategory(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <Button onClick={handleCreate} data-testid="new-job-category-button">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría Laboral
        </Button>
      </div>

      {/* Table or Empty State */}
      {categories.length === 0 ? (
        <div
          data-testid="job-categories-empty-state"
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <p className="text-muted-foreground mb-4">No hay categorías laborales registradas</p>
          <Button onClick={handleCreate}>Crear primera categoría laboral</Button>
        </div>
      ) : (
        <Table data-testid="job-categories-table">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Convenio</TableHead>
              <TableHead>Sindicato</TableHead>
              <TableHead>Empleados</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id} data-testid={`job-category-row-${category.id}`}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.agreement.name}</TableCell>
                <TableCell>{category.agreement.union.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {category._count.employees} empleado
                    {category._count.employees !== 1 ? 's' : ''}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`job-category-actions-${category.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(category)}
                        className="text-destructive"
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
      )}

      {/* Form Modal */}
      <_JobCategoryFormModal
        open={formModalOpen}
        onOpenChange={handleFormModalClose}
        jobCategory={selectedJobCategory}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría laboral?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La categoría laboral &quot;{selectedJobCategory?.name}&quot; será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedJobCategory && deleteMutation.mutate(selectedJobCategory.id)}
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
