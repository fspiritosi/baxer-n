'use client';

import { Check, FileText, Lock } from 'lucide-react';

import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';

import type { DocumentTypeForUpload } from '../actions.server';

// ============================================
// TIPOS
// ============================================

interface Props {
  documentTypes: DocumentTypeForUpload[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function _DocumentTypeSelector({
  documentTypes,
  selectedId,
  onSelect,
  disabled,
  isLoading,
}: Props) {
  // Separar tipos disponibles y ya subidos
  const availableTypes = documentTypes.filter((dt) => !dt.isAlreadyUploaded || dt.isMonthly);
  const uploadedTypes = documentTypes.filter((dt) => dt.isAlreadyUploaded && !dt.isMonthly);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Tipo de documento</Label>
        <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
          Cargando tipos de documento...
        </div>
      </div>
    );
  }

  if (documentTypes.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Tipo de documento</Label>
        <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
          Selecciona una entidad primero
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Tipo de documento</Label>
      <ScrollArea className="h-[250px] rounded-md border">
        <div className="p-2 space-y-1">
          {/* Tipos disponibles */}
          {availableTypes.map((dt) => (
            <button
              key={dt.id}
              type="button"
              onClick={() => onSelect(dt.id)}
              disabled={disabled}
              className={cn(
                'flex items-center gap-3 w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                selectedId === dt.id && 'bg-primary/10 text-primary',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{dt.name}</p>
                <div className="flex gap-1 mt-1">
                  {dt.isMandatory && (
                    <Badge variant="outline" className="text-xs">
                      Obligatorio
                    </Badge>
                  )}
                  {dt.isMonthly && (
                    <Badge variant="secondary" className="text-xs">
                      Mensual
                    </Badge>
                  )}
                  {dt.hasExpiration && (
                    <Badge variant="secondary" className="text-xs">
                      Con vencimiento
                    </Badge>
                  )}
                </div>
              </div>
              {selectedId === dt.id && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </button>
          ))}

          {/* Separador si hay tipos ya subidos */}
          {uploadedTypes.length > 0 && (
            <>
              <div className="my-2 px-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>Ya subidos</span>
                </div>
              </div>

              {uploadedTypes.map((dt) => (
                <div
                  key={dt.id}
                  className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm opacity-50"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{dt.name}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Ya subido
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
      {!selectedId && (
        <p className="text-xs text-muted-foreground">
          Selecciona un tipo de documento para continuar
        </p>
      )}
    </div>
  );
}
