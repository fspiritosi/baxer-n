'use client';

import { AlertCircle, Building2, User } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { InfoField, InfoFieldGroup } from '@/shared/components/common/InfoField';
import { formatDate } from '@/shared/utils/formatters';

import type { ClientDetail } from '../actions.server';

interface Props {
  client: ClientDetail;
}

export function _GeneralInfoTab({ client }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Información de la Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            Información de la Empresa
          </CardTitle>
          <CardDescription>Datos generales del cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <InfoFieldGroup>
            <InfoField label="Razón Social" value={client.name} />
            <InfoField label="CUIT" value={client.taxId} />
            <InfoField label="Email" value={client.email} />
            <InfoField label="Teléfono" value={client.phone} />
            <InfoField label="Dirección" value={client.address} />
          </InfoFieldGroup>
        </CardContent>
      </Card>

      {/* Contacto Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Contacto Principal
          </CardTitle>
          <CardDescription>Persona de contacto en la empresa</CardDescription>
        </CardHeader>
        <CardContent>
          {client.contact ? (
            <InfoFieldGroup>
              <InfoField
                label="Nombre Completo"
                value={`${client.contact.firstName} ${client.contact.lastName}`}
              />
              <InfoField label="Cargo" value={client.contact.position} />
              <InfoField label="Email" value={client.contact.email} />
              <InfoField label="Teléfono" value={client.contact.phone} />
            </InfoFieldGroup>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Sin contacto asignado</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de Baja (solo si está inactivo) */}
      {!client.isActive && (
        <Card className="border-destructive/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <AlertCircle className="h-5 w-5" />
              Información de Baja
            </CardTitle>
            <CardDescription>Este cliente se encuentra inactivo</CardDescription>
          </CardHeader>
          <CardContent>
            <InfoFieldGroup>
              <InfoField label="Fecha de Baja" value={formatDate(client.terminationDate)} />
              <InfoField
                label="Motivo"
                value={client.reasonForTermination || 'No especificado'}
              />
            </InfoFieldGroup>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
