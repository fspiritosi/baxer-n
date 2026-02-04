'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

import type { DocumentState } from '@/generated/prisma/enums';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

import { DataTableColumnHeader } from '@/shared/components/common/DataTable';
import { getDocumentStateBadge } from '@/shared/utils/mappers';
import { formatDate } from '@/shared/utils/formatters';
import type { EquipmentDocumentListItem } from './actions.server';

// ============================================
// HELPERS
// ============================================

const stateIcons: Record<DocumentState, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  APPROVED: <CheckCircle2 className="h-4 w-4" />,
  EXPIRED: <AlertCircle className="h-4 w-4" />,
};

// ============================================
// PERMISSIONS
// ============================================

export interface EquipmentDocumentsColumnsPermissions {
  canUpdate: boolean;
  canDelete: boolean;
}

// ============================================
// COLUMNAS
// ============================================

interface ColumnsOptions {
  vehicleId: string;
  onView: (doc: EquipmentDocumentListItem) => void;
  onDownload: (doc: EquipmentDocumentListItem) => void;
  onDelete: (doc: EquipmentDocumentListItem) => void;
  permissions: EquipmentDocumentsColumnsPermissions;
}

export function getEquipmentDocumentsColumns({
  vehicleId,
  onView,
  onDownload,
  onDelete,
  permissions,
}: ColumnsOptions): ColumnDef<EquipmentDocumentListItem>[] {
  const { canDelete } = permissions;
  return [
    // Tipo de documento
    {
      accessorKey: 'documentType.name',
      meta: { title: 'Tipo de Documento' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo de Documento" />,
      cell: ({ row }) => (
        <Link
          href={`/dashboard/equipment/${vehicleId}/documents/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.documentType.name}
        </Link>
      ),
    },

    // Periodo (solo para mensuales)
    {
      accessorKey: 'period',
      meta: { title: 'Periodo' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Periodo" />,
      cell: ({ row }) => {
        const period = row.original.period;
        if (!period) return <span className="text-muted-foreground">-</span>;

        // Formatear YYYY-MM a nombre de mes y año
        const [year, month] = period.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return (
          <span className="capitalize">
            {date.toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        const period = row.original.period;
        if (!period) return false;
        // Filtrar por año
        return period.startsWith(value);
      },
    },

    // Estado
    {
      accessorKey: 'state',
      meta: { title: 'Estado' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => {
        const state = row.original.state;
        const hasExpiration = row.original.documentType.hasExpiration;
        const badgeConfig = getDocumentStateBadge(state, hasExpiration);
        return (
          <div className="flex items-center gap-2">
            {stateIcons[state]}
            <Badge variant={badgeConfig.variant}>{badgeConfig.label}</Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },

    // Fecha de vencimiento
    {
      accessorKey: 'expirationDate',
      meta: { title: 'Vencimiento' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vencimiento" />,
      cell: ({ row }) => {
        const date = row.original.expirationDate;
        if (!date) return <span className="text-muted-foreground">-</span>;
        return formatDate(date);
      },
    },

    // Archivo
    {
      accessorKey: 'fileName',
      meta: { title: 'Archivo' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Archivo" />,
      cell: ({ row }) => {
        const fileName = row.original.fileName;
        if (!fileName) return <span className="text-muted-foreground">Sin archivo</span>;
        return <span className="truncate max-w-[200px] block">{fileName}</span>;
      },
    },

    // Acciones
    {
      id: 'actions',
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => {
        const doc = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                data-testid={`equipment-document-actions-${doc.id}`}
              >
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/equipment/${vehicleId}/documents/${doc.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalle
                </Link>
              </DropdownMenuItem>
              {doc.documentKey && (
                <>
                  <DropdownMenuItem onClick={() => onView(doc)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Abrir documento
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownload(doc)}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </DropdownMenuItem>
                </>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDelete(doc)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
