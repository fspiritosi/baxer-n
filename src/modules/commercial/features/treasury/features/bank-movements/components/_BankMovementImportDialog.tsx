'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { importBankMovementsFromExcel } from '../lib/import-export.server';

interface BankMovementImportDialogProps {
  bankAccountId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function _BankMovementImportDialog({
  bankAccountId,
  open,
  onOpenChange,
}: BankMovementImportDialogProps) {
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    errors: Array<{ row: number; errors: string[] }>;
    message: string;
  } | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Por favor selecciona un archivo Excel (.xlsx o .xls)');
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const buffer = Array.from(new Uint8Array(arrayBuffer));

      const result = await importBankMovementsFromExcel(bankAccountId, buffer);

      setImportResult(result);

      if (result.success) {
        toast.success(result.message);

        if (result.errors.length === 0) {
          setTimeout(() => {
            handleClose();
            router.refresh();
          }, 2000);
        } else {
          router.refresh();
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al importar movimientos'
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedFile(null);
    setImportResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Movimientos Bancarios</DialogTitle>
          <DialogDescription>
            Selecciona un archivo Excel con los movimientos bancarios. Descarga primero la
            plantilla vacía si no tienes un archivo preparado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank-movement-file">Archivo Excel</Label>
            <Input
              id="bank-movement-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              disabled={isImporting}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Archivo seleccionado: {selectedFile.name}
              </p>
            )}
          </div>

          {importResult && (
            <div className="space-y-3">
              <Alert variant={importResult.success ? 'default' : 'destructive'}>
                <AlertDescription>
                  <strong>{importResult.message}</strong>
                  {importResult.success && (
                    <div className="mt-2 text-sm">
                      <p>Movimientos importados: {importResult.imported}</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <Label>Errores encontrados:</Label>
                  <div className="max-h-40 overflow-y-auto rounded-md border p-3 text-sm">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="mb-2">
                        <strong>{error.row > 0 ? `Fila ${error.row}:` : 'General:'}</strong>
                        <ul className="ml-4 list-disc">
                          {error.errors.map((msg, i) => (
                            <li key={i}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isImporting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
            >
              {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Importar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
