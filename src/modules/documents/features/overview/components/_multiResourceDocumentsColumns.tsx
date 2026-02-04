'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Clock, Download, Eye, MoreHorizontal, Upload } from 'lucide-react';
import moment from 'moment';
import { toast } from 'sonner';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

import { DataTableColumnHeader } from '@/shared/components/common/DataTable';
import { formatDate } from '@/shared/utils/formatters';
import type { MultiResourceDocumentTypeWithStatus } from '../actions.server';
import { getEmployeeDocumentDownloadUrl, getEquipmentDocumentDownloadUrl } from '../actions.server';

// ============================================
// HANDLERS
// ============================================

async function handleViewDocument(
  documentId: string,
  appliesTo: 'EMPLOYEE' | 'EQUIPMENT'
) {
  const result =
    appliesTo === 'EMPLOYEE'
      ? await getEmployeeDocumentDownloadUrl(documentId)
      : await getEquipmentDocumentDownloadUrl(documentId);

  if (result.success && result.url) {
    window.open(result.url, '_blank');
  } else {
    toast.error(result.error || 'Error al obtener documento');
  }
}

async function handleDownloadDocument(
  documentId: string,
  fileName: string | null | undefined,
  appliesTo: 'EMPLOYEE' | 'EQUIPMENT'
) {
  const result =
    appliesTo === 'EMPLOYEE'
      ? await getEmployeeDocumentDownloadUrl(documentId)
      : await getEquipmentDocumentDownloadUrl(documentId);

  if (result.success && result.url) {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = fileName || result.fileName || 'documento';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    toast.error(result.error || 'Error al descargar documento');
  }
}

// ============================================
// COLUMNS
// ============================================

interface ColumnsConfig {
  appliesTo: 'EMPLOYEE' | 'EQUIPMENT';
  onUploadClick: (docType: MultiResourceDocumentTypeWithStatus['documentType']) => void;
}

export function getMultiResourceDocumentsColumns(
  config: ColumnsConfig
): ColumnDef<MultiResourceDocumentTypeWithStatus>[] {
  const { appliesTo, onUploadClick } = config;

  return [
    // Columna de selección
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // Tipo de Documento
    {
      id: 'documentType',
      accessorFn: (row) => row.documentType.name,
      meta: { title: 'Tipo de Documento' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo de Documento" />,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{row.original.documentType.name}</span>
          <div className="flex gap-1">
            {row.original.documentType.isMandatory && (
              <Badge variant="destructive" className="text-xs">
                Obligatorio
              </Badge>
            )}
            {row.original.documentType.isMonthly && (
              <Badge variant="secondary" className="text-xs">
                Mensual
              </Badge>
            )}
          </div>
        </div>
      ),
    },

    // Estado
    {
      id: 'status',
      accessorFn: (row) => row.status,
      meta: { title: 'Estado' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => {
        if (row.original.status === 'uploaded') {
          return (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Subido
            </Badge>
          );
        }
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pendiente
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },

    // Vencimiento
    {
      id: 'expirationDate',
      accessorFn: (row) => row.document?.expirationDate,
      meta: { title: 'Vencimiento' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vencimiento" />,
      cell: ({ row }) => {
        const doc = row.original.document;
        const docType = row.original.documentType;

        if (doc?.expirationDate) {
          const isExpired = moment(doc.expirationDate).isBefore(moment());
          return (
            <span className={isExpired ? 'text-destructive font-medium' : ''}>
              {formatDate(doc.expirationDate)}
            </span>
          );
        }

        if (docType.hasExpiration) {
          return <span className="text-muted-foreground">-</span>;
        }

        return <span className="text-muted-foreground">No aplica</span>;
      },
    },

    // Fecha de Subida
    {
      id: 'createdAt',
      accessorFn: (row) => row.document?.createdAt,
      meta: { title: 'Subido' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Subido" />,
      cell: ({ row }) => {
        if (row.original.document?.createdAt) {
          return formatDate(row.original.document.createdAt);
        }
        return <span className="text-muted-foreground">-</span>;
      },
    },

    // Acciones
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;

        if (item.status === 'pending') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUploadClick(item.documentType)}
              className="gap-1"
            >
              <Upload className="h-3.5 w-3.5" />
              Subir
            </Button>
          );
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => item.document && handleViewDocument(item.document.id, appliesTo)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  item.document &&
                  handleDownloadDocument(item.document.id, item.document.fileName, appliesTo)
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUploadClick(item.documentType)}>
                <Upload className="mr-2 h-4 w-4" />
                Reemplazar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
