'use client';

import { useState } from 'react';
import { FileText, ExternalLink, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
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
import { _FileDropzone } from '@/shared/components/common/_FileDropzone';
import {
  uploadDocumentAttachment,
  deleteDocumentAttachment,
} from '../actions/document-attachment.server';

type DocumentType = 'sales-invoice' | 'purchase-invoice' | 'receipt' | 'payment-order';

interface DocumentAttachmentProps {
  documentType: DocumentType;
  documentId: string;
  companyId: string;
  companyName: string;
  documentNumber: string;
  hasDocument: boolean;
  documentUrl?: string | null;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export function _DocumentAttachment({
  documentType,
  documentId,
  companyId,
  companyName,
  documentNumber,
  hasDocument,
  documentUrl,
}: DocumentAttachmentProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const fileArray = Array.from(new Uint8Array(arrayBuffer));

      await uploadDocumentAttachment({
        documentType,
        documentId,
        companyId,
        companyName,
        documentNumber,
        fileName: file.name,
        file: fileArray,
      });

      toast.success('Documento adjunto subido correctamente');
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al subir el documento');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDocumentAttachment({
        documentType,
        documentId,
        companyId,
      });

      toast.success('Documento eliminado');
      setShowDeleteConfirm(false);
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al eliminar el documento');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documento Adjunto</CardTitle>
        </CardHeader>
        <CardContent>
          {hasDocument && documentUrl ? (
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Archivo adjunto</p>
                <p className="text-xs text-muted-foreground">PDF / Imagen</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  title="Ver documento"
                >
                  <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Eliminar documento"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subiendo...
                  </div>
                </div>
              )}
              <_FileDropzone
                onFileSelect={handleFileSelect}
                allowedTypes={ALLOWED_TYPES}
                helpText="PDF, JPG, PNG o WebP (max. 10MB)"
                disabled={isUploading}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar documento adjunto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar el documento adjunto? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
