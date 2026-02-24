'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, Download, Trash2, FileText, Paperclip } from 'lucide-react';
import moment from 'moment';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
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
import { Skeleton } from '@/shared/components/ui/skeleton';
import { logger } from '@/shared/lib/logger';
import {
  uploadExpenseAttachment,
  deleteExpenseAttachment,
  getExpenseAttachmentUrl,
} from '../attachment-actions.server';

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: Date;
}

interface ExpenseAttachmentsProps {
  expenseId: string;
  companyName: string;
  expenseNumber: string;
  attachments: Attachment[];
  onAttachmentsChange?: () => void;
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return 'Tamaño desconocido';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function _ExpenseAttachments({
  expenseId,
  companyName,
  expenseNumber,
  attachments,
  onAttachmentsChange,
}: ExpenseAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<Attachment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const fileBytes = Array.from(new Uint8Array(buffer));

      await uploadExpenseAttachment({
        expenseId,
        companyName,
        expenseNumber,
        fileName: file.name,
        file: fileBytes,
      });

      toast.success('Archivo adjuntado correctamente');
      onAttachmentsChange?.();
    } catch (error) {
      logger.error('Error al subir adjunto', { data: { error } });
      toast.error(error instanceof Error ? error.message : 'Error al subir el archivo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    setDownloadingId(attachment.id);
    try {
      const url = await getExpenseAttachmentUrl(attachment.id);
      if (!url) {
        toast.error('No se pudo obtener la URL del archivo');
        return;
      }
      window.open(url, '_blank');
    } catch (error) {
      logger.error('Error al descargar adjunto', { data: { error } });
      toast.error('Error al descargar el archivo');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!attachmentToDelete) return;

    setIsDeleting(true);
    try {
      await deleteExpenseAttachment(attachmentToDelete.id);
      toast.success('Archivo eliminado correctamente');
      onAttachmentsChange?.();
    } catch (error) {
      logger.error('Error al eliminar adjunto', { data: { error } });
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el archivo');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setAttachmentToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Documentos Adjuntos
              {attachments.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({attachments.length})
                </span>
              )}
            </CardTitle>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleUpload}
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? 'Subiendo...' : 'Adjuntar'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isUploading && (
            <div className="mb-3">
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {attachments.length === 0 && !isUploading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay documentos adjuntos
            </p>
          ) : (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.fileSize)} &middot;{' '}
                        {moment(attachment.createdAt).format('DD/MM/YYYY HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={downloadingId === attachment.id}
                      onClick={() => handleDownload(attachment)}
                      title="Descargar"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        setAttachmentToDelete(attachment);
                        setDeleteDialogOpen(true);
                      }}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar archivo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el archivo &quot;{attachmentToDelete?.fileName}&quot;?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
