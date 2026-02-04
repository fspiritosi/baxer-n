'use client';

import { Loader2, Trash2 } from 'lucide-react';
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
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';

import { deleteCompany } from '../actions.server';

interface DeleteCompanyButtonProps {
  companyId: string;
  companyName: string;
}

export function _DeleteCompanyButton({ companyId, companyName }: DeleteCompanyButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      await deleteCompany(companyId);
      toast.success('Empresa eliminada correctamente');
      router.push('/dashboard/companies');
      router.refresh();
    } catch (error) {
      toast.error('Error al eliminar la empresa');
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button data-testid="company-delete-button" variant="destructive">
          <Trash2 className="mr-2 size-4" />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent data-testid="company-delete-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="company-delete-dialog-title">
            ¿Eliminar empresa?
          </AlertDialogTitle>
          <AlertDialogDescription data-testid="company-delete-dialog-description">
            Estás a punto de eliminar{' '}
            <strong data-testid="company-delete-dialog-name">{companyName}</strong>. Esta acción no
            se puede deshacer. Todos los datos asociados serán desactivados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="company-delete-cancel" disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            data-testid="company-delete-confirm"
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
