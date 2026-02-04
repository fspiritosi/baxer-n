'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Download, Eye, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
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
import type { EmployeeDocumentListItem } from '../actions.server';
import { getEmployeeDocumentDownloadUrl } from '../actions.server';

async function handleViewDocument(documentId: string) {
  const result = await getEmployeeDocumentDownloadUrl(documentId);
  if (result.success && result.url) {
    window.open(result.url, '_blank');
  } else {
    toast.error(result.error || 'Error al obtener documento');
  }
}

async function handleDownloadDocument(documentId: string, fileName?: string | null) {
  const result = await getEmployeeDocumentDownloadUrl(documentId);
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

export function getEmployeeDocumentsColumns(): ColumnDef<EmployeeDocumentListItem>[] {
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

    // Empleado
    {
      id: 'employee',
      accessorFn: (row) => row.employee ? `${row.employee.lastName}, ${row.employee.firstName}` : 'General',
      meta: { title: 'Empleado' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Empleado" />,
      cell: ({ row }) => {
        const employee = row.original.employee;
        if (!employee) {
          return <span className="text-muted-foreground">General (Multirrecurso)</span>;
        }
        return (
          <div>
            <Link
              href={`/dashboard/employees/${employee.id}`}
              className="font-medium hover:underline"
            >
              {employee.lastName}, {employee.firstName}
            </Link>
            <p className="text-xs text-muted-foreground">
              Leg. {employee.employeeNumber}
            </p>
          </div>
        );
      },
    },

    // Tipo de Documento
    {
      id: 'documentType',
      accessorFn: (row) => row.documentType.name,
      meta: { title: 'Tipo de Documento' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo de Documento" />,
      cell: ({ row }) => (
        <div>
          <span className="font-medium">{row.original.documentType.name}</span>
          {row.original.documentType.isMandatory && (
            <Badge variant="outline" className="ml-2 text-xs">
              Obligatorio
            </Badge>
          )}
        </div>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.original.documentType.id);
      },
    },

    // Período (solo para mensuales)
    {
      accessorKey: 'period',
      meta: { title: 'Período' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Período" />,
      cell: ({ row }) => row.original.period || '-',
    },

    // Estado
    {
      accessorKey: 'state',
      meta: { title: 'Estado' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => {
        const hasExpiration = row.original.documentType.hasExpiration;
        const badge = getDocumentStateBadge(row.original.state, hasExpiration);
        return <Badge variant={badge.variant}>{badge.label}</Badge>;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },

    // Fecha de Vencimiento
    {
      accessorKey: 'expirationDate',
      meta: { title: 'Vencimiento' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vencimiento" />,
      cell: ({ row }) => {
        if (!row.original.expirationDate) return '-';
        const date = new Date(row.original.expirationDate);
        const isExpired = date < new Date();
        return (
          <span className={isExpired ? 'text-destructive font-medium' : ''}>
            {formatDate(row.original.expirationDate)}
          </span>
        );
      },
    },

    // Acciones
    {
      id: 'actions',
      cell: ({ row }) => {
        const doc = row.original;
        const hasDocument = doc.documentKey;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {hasDocument && (
                <>
                  <DropdownMenuItem onClick={() => handleViewDocument(doc.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver documento
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadDocument(doc.id, doc.fileName)}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {doc.employee && (
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/employees/${doc.employee.id}?tab=documents`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver empleado
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
