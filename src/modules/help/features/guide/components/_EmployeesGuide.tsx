'use client';

import { FileText, Info, Plus, UserCheck, Users } from 'lucide-react';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';

export function _EmployeesGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Empleados</h2>
        <p className="text-muted-foreground">
          Gestión completa del personal de tu empresa
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Dar de Alta un Empleado
          </CardTitle>
          <CardDescription>
            Cómo registrar un nuevo empleado en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Ve a <strong>Empleados</strong> en el menú lateral
            </li>
            <li>
              Haz clic en el botón <strong>Nuevo Empleado</strong>
            </li>
            <li>
              Completa los datos personales:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Nombre y apellido (obligatorio)</li>
                <li>Número de legajo</li>
                <li>CUIL / Documento</li>
                <li>Fecha de nacimiento</li>
                <li>Género</li>
                <li>Email y teléfono</li>
                <li>Dirección</li>
              </ul>
            </li>
            <li>
              Completa los datos laborales:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Puesto de trabajo</li>
                <li>Categoría laboral</li>
                <li>Tipo de contrato</li>
                <li>Fecha de ingreso</li>
                <li>Sindicato y convenio colectivo</li>
                <li>Centro de costo</li>
                <li>Sector</li>
              </ul>
            </li>
            <li>
              Haz clic en <strong>Guardar</strong>
            </li>
          </ol>
          <p className="text-sm text-muted-foreground">
            Los campos de puesto, categoría, contrato, sindicato, etc. se
            configuran previamente en <strong>Empresa → Catálogos</strong>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Empleados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>En la lista de empleados puedes:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Buscar</strong> por nombre, apellido o legajo
            </li>
            <li>
              <strong>Filtrar</strong> por estado (activo, licencia, baja, etc.)
            </li>
            <li>
              <strong>Ordenar</strong> por cualquier columna
            </li>
            <li>
              <strong>Exportar a Excel</strong> la lista completa
            </li>
            <li>
              Hacer clic en un empleado para ver su <strong>detalle</strong>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Estados del Empleado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>Cada empleado tiene un estado que refleja su situación actual:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Activo</strong>: trabajando normalmente
            </li>
            <li>
              <strong>Licencia</strong>: ausencia temporal autorizada
            </li>
            <li>
              <strong>Suspendido</strong>: suspensión disciplinaria
            </li>
            <li>
              <strong>Baja</strong>: relación laboral finalizada
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Puedes cambiar el estado desde el detalle del empleado.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos del Empleado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            En la pestaña <strong>Documentos</strong> del detalle del empleado
            puedes:
          </p>
          <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
            <li>Ver los documentos requeridos según su puesto y tipo de contrato</li>
            <li>
              Cargar archivos (PDF, imágenes) para cada tipo de documento
            </li>
            <li>Ver el estado de cada documento (pendiente, aprobado, rechazado)</li>
            <li>Ver historial de versiones</li>
          </ol>
        </CardContent>
      </Card>

      <Separator />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Relación con otros módulos:</strong>
          <ul className="list-disc pl-6 mt-1 space-y-1">
            <li>
              <strong>Documentos</strong>: los tipos de documento se definen en
              el módulo Documentos y se asignan automáticamente según el puesto
              y tipo de contrato del empleado
            </li>
            <li>
              <strong>Empresa → Catálogos</strong>: los puestos, categorías,
              sindicatos y demás opciones se configuran en los catálogos
            </li>
            <li>
              <strong>Comercial → Clientes</strong>: los empleados pueden
              asignarse a clientes específicos
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
