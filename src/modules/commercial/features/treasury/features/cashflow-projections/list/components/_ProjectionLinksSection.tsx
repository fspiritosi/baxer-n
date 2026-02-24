'use client';

import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, Trash2, AlertCircle } from 'lucide-react';
import moment from 'moment';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
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

import { formatCurrency } from '@/shared/utils/formatters';
import { cn } from '@/shared/lib/utils';
import type { ProjectionListItem, ProjectionDocumentLinkItem } from '../../../../shared/types';
import type { ProjectionStatus } from '@/generated/prisma/enums';
import {
  PROJECTION_TYPE_LABELS,
  PROJECTION_CATEGORY_LABELS,
  PROJECTION_STATUS_LABELS,
} from '../../../../shared/validators';

const PROJECTION_STATUS_STYLE: Record<
  ProjectionStatus,
  { variant: 'secondary' | 'default' | 'destructive' | 'outline'; className?: string }
> = {
  PENDING: { variant: 'secondary' },
  PARTIAL: { variant: 'outline', className: 'border-yellow-500 text-yellow-700 bg-yellow-50' },
  CONFIRMED: { variant: 'outline', className: 'border-green-600 text-green-700 bg-green-50' },
};
import { getProjectionLinks, unlinkDocumentFromProjection } from '../../actions.server';

const DOC_TYPE_LABELS: Record<ProjectionDocumentLinkItem['documentType'], string> = {
  SALES_INVOICE: 'Factura de Venta',
  PURCHASE_INVOICE: 'Factura de Compra',
  EXPENSE: 'Gasto',
};

const DOC_TYPE_BADGES: Record<
  ProjectionDocumentLinkItem['documentType'],
  'default' | 'secondary' | 'destructive'
> = {
  SALES_INVOICE: 'default',
  PURCHASE_INVOICE: 'secondary',
  EXPENSE: 'destructive',
};

interface Props {
  projection: ProjectionListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function _ProjectionLinksSection({ projection, open, onOpenChange, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const [unlinkTarget, setUnlinkTarget] = useState<ProjectionDocumentLinkItem | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const fetchLinks = useCallback(
    () => getProjectionLinks(projection?.id ?? ''),
    [projection?.id]
  );

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['projection-links', projection?.id],
    queryFn: fetchLinks,
    enabled: open && Boolean(projection?.id),
  });

  const handleUnlink = async () => {
    if (!unlinkTarget || !projection) return;

    setIsUnlinking(true);
    try {
      await unlinkDocumentFromProjection(unlinkTarget.id);
      toast.success('Documento desvinculado correctamente');
      void queryClient.invalidateQueries({ queryKey: ['projection-links', projection.id] });
      void queryClient.invalidateQueries({ queryKey: ['projection-link-search'] });
      setUnlinkTarget(null);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al desvincular el documento');
    } finally {
      setIsUnlinking(false);
    }
  };

  if (!projection) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos Vinculados
            </DialogTitle>
          </DialogHeader>

          {/* Resumen de la proyección */}
          <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Proyección</span>
              <Badge
                variant={PROJECTION_STATUS_STYLE[projection.status].variant}
                className={cn(PROJECTION_STATUS_STYLE[projection.status].className)}
              >
                {PROJECTION_STATUS_LABELS[projection.status]}
              </Badge>
            </div>
            <p className="text-sm font-semibold">{projection.description}</p>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="block font-medium text-foreground">Tipo</span>
                {PROJECTION_TYPE_LABELS[projection.type]} ·{' '}
                {PROJECTION_CATEGORY_LABELS[projection.category]}
              </div>
              <div>
                <span className="block font-medium text-foreground">Monto total</span>
                {formatCurrency(projection.amount)}
              </div>
              <div>
                <span className="block font-medium text-foreground">Confirmado</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(projection.confirmedAmount)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Lista de vínculos */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Documentos vinculados{' '}
              {!isLoading && (
                <span className="text-muted-foreground font-normal">({links.length})</span>
              )}
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                Cargando vínculos...
              </div>
            ) : links.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <AlertCircle className="h-8 w-8 opacity-40" />
                <p className="text-sm">No hay documentos vinculados a esta proyección</p>
              </div>
            ) : (
              <ul className="divide-y rounded-md border">
                {links.map((link) => (
                  <li
                    key={link.id}
                    className="flex items-start justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={DOC_TYPE_BADGES[link.documentType]}
                          className="text-xs shrink-0"
                        >
                          {DOC_TYPE_LABELS[link.documentType]}
                        </Badge>
                        <span className="text-sm font-medium">{link.documentFullNumber}</span>
                        {link.documentEntityName && (
                          <span className="text-xs text-muted-foreground">
                            · {link.documentEntityName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Fecha doc.: {moment(link.documentDate).format('DD/MM/YYYY')}</span>
                        <span>Total doc.: {formatCurrency(link.documentTotal)}</span>
                      </div>
                      {link.notes && (
                        <p className="text-xs text-muted-foreground italic">{link.notes}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right space-y-1">
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(link.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Vinculado {moment(link.createdAt).format('DD/MM/YYYY')}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setUnlinkTarget(link)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Desvincular
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmación de desvinculación */}
      <AlertDialog open={Boolean(unlinkTarget)} onOpenChange={(v) => !v && setUnlinkTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desvincular documento?</AlertDialogTitle>
            <AlertDialogDescription>
              {unlinkTarget && (
                <>
                  Se desvinculará{' '}
                  <strong>
                    {DOC_TYPE_LABELS[unlinkTarget.documentType]} {unlinkTarget.documentFullNumber}
                  </strong>{' '}
                  por un monto de{' '}
                  <strong>{formatCurrency(unlinkTarget.amount)}</strong>.
                  El estado de la proyección se recalculará automáticamente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnlinking}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlink}
              disabled={isUnlinking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUnlinking ? 'Desvinculando...' : 'Desvincular'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
