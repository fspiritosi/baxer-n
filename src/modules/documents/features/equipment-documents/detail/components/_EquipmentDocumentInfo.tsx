'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  History,
  RefreshCw,
  Replace,
  Trash2,
  Truck,
} from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

import type { DocumentAction, DocumentState } from '@/generated/prisma/enums';
import { getDocumentStateBadge } from '@/shared/utils/mappers';
import { formatDate, formatFileSize } from '@/shared/utils/formatters';
import type { EquipmentDocumentDetailData } from '../actions.server';
import { getEquipmentHistoryVersionDownloadUrl } from '../actions.server';

// ============================================
// HELPERS
// ============================================

const stateIcons: Record<DocumentState, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4 text-muted-foreground" />,
  APPROVED: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  EXPIRED: <AlertCircle className="h-4 w-4 text-destructive" />,
};

const actionLabels: Record<DocumentAction, string> = {
  UPLOADED: 'Documento subido',
  REPLACED: 'Documento reemplazado',
  RENEWED: 'Documento renovado',
  DELETED: 'Documento eliminado',
  EXPIRED: 'Documento vencido',
};

const actionIcons: Record<DocumentAction, React.ReactNode> = {
  UPLOADED: <FileText className="h-4 w-4 text-green-600" />,
  REPLACED: <Replace className="h-4 w-4 text-blue-600" />,
  RENEWED: <RefreshCw className="h-4 w-4 text-purple-600" />,
  DELETED: <Trash2 className="h-4 w-4 text-destructive" />,
  EXPIRED: <AlertCircle className="h-4 w-4 text-yellow-600" />,
};

// ============================================
// COMPONENT
// ============================================

interface Props {
  data: EquipmentDocumentDetailData;
}

export function _EquipmentDocumentInfo({ data }: Props) {
  const { document, equipment, appliesCurrently } = data;
  const badgeConfig = getDocumentStateBadge(document.state, document.documentType.hasExpiration);
  const [loadingHistoryId, setLoadingHistoryId] = useState<string | null>(null);

  // Construir nombre del equipo para mostrar
  const equipmentName = equipment.domain
    ? equipment.domain
    : equipment.internNumber
      ? `N° ${equipment.internNumber}`
      : 'Sin identificación';

  const equipmentDescription = [equipment.brand?.name, equipment.model?.name, equipment.type?.name]
    .filter(Boolean)
    .join(' · ');

  const handleDownloadHistoryVersion = async (historyId: string) => {
    setLoadingHistoryId(historyId);
    try {
      const result = await getEquipmentHistoryVersionDownloadUrl(historyId, document.id, equipment.id);
      if (result.success && result.url) {
        // Abrir en nueva pestaña (mejor experiencia mobile)
        window.open(result.url, '_blank', 'noopener,noreferrer');
      } else {
        toast.error(result.error || 'Error al obtener el archivo');
      }
    } catch {
      toast.error('Error al obtener el archivo');
    } finally {
      setLoadingHistoryId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerta si el documento ya no aplica al equipo */}
      {appliesCurrently === false && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Este documento ya no aplica al equipo
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Las condiciones del tipo de documento han cambiado o el equipo ya no cumple con
                  los requisitos. El documento se mantiene por historial, pero ya no es obligatorio
                  para este equipo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado y Tipo */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{document.documentType.name}</CardTitle>
              <CardDescription>
                {document.period ? `Periodo: ${document.period}` : 'Documento del equipo'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {stateIcons[document.state]}
              <Badge variant={badgeConfig.variant}>{badgeConfig.label}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Equipment Info */}
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={equipment.pictureUrl || undefined} />
              <AvatarFallback>
                <Truck className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{equipmentName}</p>
              <p className="text-sm text-muted-foreground truncate">
                {equipmentDescription || 'Sin información adicional'}
              </p>
            </div>
            <Truck className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      {/* Información del Documento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Información del Documento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Tipo</p>
              <p className="font-medium">{document.documentType.name}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Estado</p>
              <div className="flex items-center gap-2">
                {stateIcons[document.state]}
                <span className="font-medium">{badgeConfig.label}</span>
              </div>
            </div>

            {document.documentType.isMandatory && (
              <div>
                <p className="text-muted-foreground">Obligatorio</p>
                <Badge variant="outline">Sí</Badge>
              </div>
            )}

            {document.documentType.isMonthly && (
              <div>
                <p className="text-muted-foreground">Periodicidad</p>
                <Badge variant="secondary">Mensual</Badge>
              </div>
            )}

            {document.expirationDate && (
              <div>
                <p className="text-muted-foreground">Fecha de Vencimiento</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatDate(document.expirationDate)}</span>
                </div>
              </div>
            )}

            {document.period && (
              <div>
                <p className="text-muted-foreground">Periodo</p>
                <p className="font-medium">{document.period}</p>
              </div>
            )}
          </div>

          {/* File Info */}
          {document.fileName && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Archivo</p>
                <p className="font-medium truncate">{document.fileName}</p>
                {document.fileSize && (
                  <p className="text-xs text-muted-foreground">{formatFileSize(document.fileSize)}</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Historial */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial de Cambios
          </CardTitle>
          <CardDescription>
            Las versiones anteriores (renovaciones) se pueden descargar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {document.history && document.history.length > 0 ? (
            <ScrollArea className="max-h-[300px] pr-4">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />

                <div className="space-y-4">
                  {document.history.map((entry, index) => {
                    const isCurrentVersion = index === 0;
                    const hasFile = !!entry.documentKey;
                    // Mostrar botón de descarga para versiones anteriores que tienen archivo
                    const isOldVersion = !isCurrentVersion && hasFile;
                    // Verificar que no sea el mismo archivo que el actual (evitar duplicados)
                    const isDifferentFromCurrent = entry.documentKey !== document.documentKey;
                    const canDownload = isOldVersion && isDifferentFromCurrent;

                    return (
                      <div key={entry.id} className="relative flex gap-3">
                        {/* Timeline dot */}
                        <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background flex-shrink-0">
                          {actionIcons[entry.action]}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{actionLabels[entry.action]}</span>
                            {isCurrentVersion && (
                              <Badge variant="secondary" className="text-xs">
                                Actual
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground mt-1">
                            {moment(entry.changedAt).format('DD/MM/YYYY HH:mm')}
                          </p>

                          {entry.fileName && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              Archivo: {entry.fileName}
                            </p>
                          )}

                          {entry.fileSize && (
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(entry.fileSize)}
                            </p>
                          )}

                          {entry.reason && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              &quot;{entry.reason}&quot;
                            </p>
                          )}

                          {/* Botón de descarga para versiones anteriores */}
                          {canDownload && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 h-7 text-xs"
                                    onClick={() => handleDownloadHistoryVersion(entry.id)}
                                    disabled={loadingHistoryId === entry.id}
                                  >
                                    {loadingHistoryId === entry.id ? (
                                      <>Cargando...</>
                                    ) : (
                                      <>
                                        <ExternalLink className="mr-1 h-3 w-3" />
                                        Ver versión
                                      </>
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Abrir esta versión del documento</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No hay historial de cambios registrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
