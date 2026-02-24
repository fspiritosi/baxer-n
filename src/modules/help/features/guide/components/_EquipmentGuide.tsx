'use client';

import { FileText, Info, Plus, QrCode, Truck } from 'lucide-react';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';

export function _EquipmentGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Equipamiento</h2>
        <p className="text-muted-foreground">
          Gestión de vehículos y equipos de la empresa
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Registrar un Equipo o Vehículo
          </CardTitle>
          <CardDescription>
            Cómo dar de alta un nuevo equipo en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Ve a <strong>Equipamiento</strong> en el menú lateral
            </li>
            <li>
              Haz clic en <strong>Nuevo Equipo</strong>
            </li>
            <li>
              Completa los datos:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Código interno (obligatorio, único)</li>
                <li>Marca y modelo</li>
                <li>Tipo de vehículo/equipo</li>
                <li>Dominio/patente</li>
                <li>Número interno</li>
                <li>Año de fabricación</li>
                <li>Número de serie / chasis</li>
                <li>Propietario del equipo</li>
                <li>Contratista (si aplica)</li>
              </ul>
            </li>
            <li>
              Haz clic en <strong>Guardar</strong>
            </li>
          </ol>
          <p className="text-sm text-muted-foreground">
            Las marcas, tipos de vehículo, propietarios y contratistas se
            configuran en <strong>Empresa → Catálogos</strong>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Lista y Detalle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>En la lista de equipos puedes:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Buscar por código, marca, modelo o dominio</li>
            <li>Filtrar por estado y tipo</li>
            <li>Exportar a Excel</li>
          </ul>
          <p className="mt-2">
            El detalle del equipo muestra toda su información en pestañas:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>General</strong>: datos técnicos y administrativos
            </li>
            <li>
              <strong>Documentos</strong>: documentación requerida del equipo
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos del Equipo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Similar a los empleados, cada equipo tiene documentos asociados:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>VTV (Verificación Técnica Vehicular)</li>
            <li>Seguro</li>
            <li>Habilitación</li>
            <li>Otros documentos según el tipo de equipo</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Los tipos de documento se configuran en el módulo{' '}
            <strong>Documentos</strong> con la opción &quot;Aplica a:
            Equipamiento&quot;.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Código QR Público
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Cada equipo tiene un código QR único que permite acceder a su
            información pública:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>El QR se genera automáticamente al crear el equipo</li>
            <li>
              Cualquier persona puede escanear el QR para ver datos básicos del
              equipo
            </li>
            <li>
              La página pública está en <code>/eq/[id]</code> y no requiere
              autenticación
            </li>
            <li>Ideal para identificación en campo</li>
          </ul>
        </CardContent>
      </Card>

      <Separator />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Relación con otros módulos:</strong>
          <ul className="list-disc pl-6 mt-1 space-y-1">
            <li>
              <strong>Documentos</strong>: los tipos de documento para equipos
              se definen en el módulo Documentos
            </li>
            <li>
              <strong>Empresa → Catálogos</strong>: marcas, tipos de vehículo,
              propietarios y contratistas
            </li>
            <li>
              <strong>Comercial → Clientes</strong>: los equipos pueden
              asignarse a clientes específicos
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
