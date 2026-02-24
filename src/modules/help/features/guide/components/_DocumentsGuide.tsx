'use client';

import {
  CheckCircle2,
  FileText,
  Filter,
  Info,
  Plus,
  Settings,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';

export function _DocumentsGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Documentos</h2>
        <p className="text-muted-foreground">
          Control y seguimiento de documentación de empleados, equipos y empresa
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurar Tipos de Documento
          </CardTitle>
          <CardDescription>
            Define qué documentos necesitas controlar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Ve a la pestaña <strong>Tipos de Documento</strong>
            </li>
            <li>
              Haz clic en <strong>Nuevo Tipo</strong>
            </li>
            <li>
              Completa:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>
                  <strong>Nombre</strong>: ej. &quot;DNI&quot;, &quot;VTV&quot;, &quot;Seguro&quot;
                </li>
                <li>
                  <strong>Aplica a</strong>: Empleados, Equipamiento o Empresa
                </li>
                <li>
                  <strong>¿Tiene vencimiento?</strong>: si el documento expira
                </li>
                <li>
                  <strong>¿Es obligatorio?</strong>: si es requerido
                </li>
              </ul>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Condiciones de Aplicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Puedes definir condiciones para que un tipo de documento solo se
            aplique a ciertos empleados o equipos:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Por puesto de trabajo</strong>: ej. &quot;Carnet de
              conducir&quot; solo para choferes
            </li>
            <li>
              <strong>Por tipo de contrato</strong>: ej. &quot;Contrato
              eventual&quot; solo para temporales
            </li>
            <li>
              <strong>Por tipo de equipo</strong>: ej. &quot;VTV&quot; solo para
              vehículos
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Si no se asignan condiciones, el tipo de documento aplica a todos.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Cargar un Documento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Ve al detalle del empleado o equipo, pestaña{' '}
              <strong>Documentos</strong>
            </li>
            <li>
              Busca el tipo de documento en la lista
            </li>
            <li>
              Haz clic en <strong>Cargar</strong>
            </li>
            <li>Selecciona el archivo (PDF o imagen, máximo 10MB)</li>
            <li>Si tiene vencimiento, indica la fecha de expiración</li>
            <li>El documento queda en estado <strong>Pendiente</strong></li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Flujo de Revisión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>Cada documento cargado pasa por un flujo de revisión:</p>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Pendiente</strong>: recién cargado, esperando revisión
            </li>
            <li>
              <strong>Aprobado</strong>: un revisor verifica y aprueba el
              documento
            </li>
            <li>
              <strong>Rechazado</strong>: el documento no es válido, se debe
              cargar uno nuevo
            </li>
          </ol>
          <p className="text-sm text-muted-foreground">
            Se mantiene un historial de versiones: si se carga un documento
            nuevo, el anterior queda como versión histórica.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Vista General por Pestañas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            La página principal de Documentos tiene pestañas para ver el estado
            de la documentación:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Empleados</strong>: estado de documentos de todos los
              empleados
            </li>
            <li>
              <strong>Equipamiento</strong>: estado de documentos de todos los
              equipos
            </li>
            <li>
              <strong>Empresa</strong>: documentos generales de la empresa
            </li>
            <li>
              <strong>Tipos</strong>: configuración de tipos de documento
            </li>
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
              <strong>Empleados</strong>: los documentos se cargan desde el
              detalle de cada empleado
            </li>
            <li>
              <strong>Equipamiento</strong>: los documentos se cargan desde el
              detalle de cada equipo
            </li>
            <li>
              <strong>Empresa → Catálogos</strong>: las condiciones de aplicación
              usan los catálogos (puestos, tipos de contrato, tipos de equipo)
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
