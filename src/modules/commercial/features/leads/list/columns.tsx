'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Building2, Phone, Mail, ArrowRight } from 'lucide-react';
import moment from 'moment';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/shared/components/common/DataTable';
import type { ModulePermissions } from '@/shared/lib/permissions';
import type { LeadStatus } from '@/generated/prisma/enums';
import type { LeadListItem } from './actions.server';

// Mapeo de estados de lead
export const leadStatusLabels: Record<LeadStatus, string> = {
  NEW: 'Nuevo',
  CONTACTED: 'Contactado',
  NEGOTIATING: 'En negociación',
  CONVERTED: 'Convertido',
  REJECTED: 'Rechazado',
  INACTIVE: 'Inactivo',
};

export const leadStatusBadges: Record<LeadStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  NEW: { label: 'Nuevo', variant: 'secondary' },
  CONTACTED: { label: 'Contactado', variant: 'outline' },
  NEGOTIATING: { label: 'Negociando', variant: 'default' },
  CONVERTED: { label: 'Convertido', variant: 'default' },
  REJECTED: { label: 'Rechazado', variant: 'destructive' },
  INACTIVE: { label: 'Inactivo', variant: 'secondary' },
};

interface ColumnsProps {
  onEdit: (lead: LeadListItem) => void;
  onConvert: (lead: LeadListItem) => void;
  onUpdateStatus: (lead: LeadListItem, status: LeadStatus) => void;
  onDelete: (lead: LeadListItem) => void;
  permissions: ModulePermissions;
}

export function getColumns({ onEdit, onConvert, onUpdateStatus, onDelete, permissions }: ColumnsProps): ColumnDef<LeadListItem>[] {
  const { canUpdate, canDelete } = permissions;
  const hasAnyAction = canUpdate || canDelete;

  const baseColumns: ColumnDef<LeadListItem>[] = [
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
    {
      accessorKey: 'name',
      meta: { title: 'Nombre' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="font-medium">{lead.name}</span>
              {lead.contact && (
                <p className="text-xs text-muted-foreground">
                  {lead.contact.firstName} {lead.contact.lastName}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      meta: { title: 'Email' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => {
        const email = row.original.email;
        if (!email) return '-';
        return (
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="truncate max-w-[180px]">{email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'phone',
      meta: { title: 'Teléfono' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
      cell: ({ row }) => {
        const phone = row.original.phone;
        if (!phone) return '-';
        return (
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{phone}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      meta: { title: 'Estado' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => {
        const status = row.original.status;
        const config = leadStatusBadges[status];
        return (
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      meta: { title: 'Fecha de Creación' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Creado" />,
      cell: ({ row }) => moment(row.original.createdAt).format('DD/MM/YYYY'),
    },
    {
      id: 'convertedTo',
      meta: { title: 'Convertido a' },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Convertido a" />,
      cell: ({ row }) => {
        const lead = row.original;
        if (lead.status !== 'CONVERTED' || !lead.convertedToClient) return '-';
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <ArrowRight className="h-3 w-3" />
            <span>{lead.convertedToClient.name}</span>
          </div>
        );
      },
    },
  ];

  // Solo agregar columna de acciones si el usuario tiene al menos un permiso
  if (hasAnyAction) {
    baseColumns.push({
      id: 'actions',
      cell: ({ row }) => {
        const lead = row.original;
        const leadCanConvert = lead.status !== 'CONVERTED' && lead.status !== 'REJECTED';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              {canUpdate && (
                <DropdownMenuItem onClick={() => onEdit(lead)}>
                  Editar
                </DropdownMenuItem>
              )}
              {canUpdate && leadCanConvert && (
                <DropdownMenuItem onClick={() => onConvert(lead)}>
                  Convertir a Cliente
                </DropdownMenuItem>
              )}
              {canUpdate && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
                  {lead.status !== 'NEW' && (
                    <DropdownMenuItem onClick={() => onUpdateStatus(lead, 'NEW')}>
                      Marcar como Nuevo
                    </DropdownMenuItem>
                  )}
                  {lead.status !== 'CONTACTED' && (
                    <DropdownMenuItem onClick={() => onUpdateStatus(lead, 'CONTACTED')}>
                      Marcar como Contactado
                    </DropdownMenuItem>
                  )}
                  {lead.status !== 'NEGOTIATING' && (
                    <DropdownMenuItem onClick={() => onUpdateStatus(lead, 'NEGOTIATING')}>
                      Marcar como Negociando
                    </DropdownMenuItem>
                  )}
                  {lead.status !== 'REJECTED' && lead.status !== 'CONVERTED' && (
                    <DropdownMenuItem onClick={() => onUpdateStatus(lead, 'REJECTED')}>
                      Marcar como Rechazado
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(lead)}
                    className="text-destructive"
                  >
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return baseColumns;
}
