'use client';

import {
  ClipboardList,
  Info,
  KeyRound,
  Shield,
  UserPlus,
  Users,
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

export function _CompanyGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Empresa</h2>
        <p className="text-muted-foreground">
          Usuarios, roles, permisos y catálogos del sistema
        </p>
      </div>

      {/* Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Gestión de Usuarios
          </CardTitle>
          <CardDescription>
            Invita y administra los miembros de tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            <strong>Invitar un nuevo usuario:</strong>
          </p>
          <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
            <li>
              Ve a <strong>Empresa → Usuarios</strong>
            </li>
            <li>
              Haz clic en <strong>Invitar Usuario</strong>
            </li>
            <li>Ingresa el email del colaborador</li>
            <li>Asígnale un rol</li>
            <li>Se envía un email de invitación automáticamente</li>
            <li>
              El usuario acepta la invitación y accede al sistema con los
              permisos de su rol
            </li>
          </ol>
          <p className="text-sm text-muted-foreground mt-2">
            Puedes <strong>cambiar el rol</strong> de un usuario o{' '}
            <strong>desactivarlo</strong> en cualquier momento.
          </p>
        </CardContent>
      </Card>

      {/* Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Roles y Permisos
          </CardTitle>
          <CardDescription>
            Define qué puede hacer cada tipo de usuario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            <strong>Crear un rol:</strong>
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Ve a <strong>Empresa → Roles</strong>
            </li>
            <li>
              Haz clic en <strong>Nuevo Rol</strong>
            </li>
            <li>Ingresa un nombre descriptivo (ej. &quot;Contador&quot;, &quot;Vendedor&quot;)</li>
            <li>
              Asigna permisos por módulo:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>
                  <strong>Ver</strong>: acceso de lectura
                </li>
                <li>
                  <strong>Crear</strong>: puede agregar registros nuevos
                </li>
                <li>
                  <strong>Editar</strong>: puede modificar registros existentes
                </li>
                <li>
                  <strong>Eliminar</strong>: puede dar de baja o eliminar
                </li>
              </ul>
            </li>
          </ol>

          <p className="mt-3">
            <strong>Permisos individuales:</strong>
          </p>
          <p className="text-muted-foreground">
            Además del rol base, puedes otorgar o quitar permisos específicos a
            cada usuario. Los permisos individuales tienen prioridad sobre los
            del rol.
          </p>

          <p className="mt-3">
            <strong>Roles del sistema:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Propietario</strong>: acceso total, no se puede modificar
            </li>
            <li>
              <strong>Administrador</strong>: acceso completo configurable
            </li>
            <li>
              Roles personalizados con permisos granulares
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Módulos de permisos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Módulos con Permisos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Los permisos se organizan por grupos de módulos:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>
              <strong>Recursos Humanos</strong>: Empleados
            </li>
            <li>
              <strong>Equipamiento</strong>: Equipos/Vehículos
            </li>
            <li>
              <strong>Documentos</strong>: Documentación general, de empleados,
              de equipos, tipos de documento
            </li>
            <li>
              <strong>Comercial</strong>: Clientes, Proveedores, Productos,
              Categorías, Puntos de venta, Facturas de venta, Facturas de
              compra, Gastos, Reportes
            </li>
            <li>
              <strong>Tesorería</strong>: Cuentas bancarias, Movimientos, Recibos,
              Órdenes de pago, Cajas
            </li>
            <li>
              <strong>Almacenes</strong>: Almacenes, Stock, Movimientos de stock
            </li>
            <li>
              <strong>Contabilidad</strong>: Plan de cuentas, Asientos, Reportes,
              Configuración, Cierre de ejercicio, Asientos recurrentes
            </li>
            <li>
              <strong>Empresa</strong>: Configuración, Usuarios, Roles, Catálogos
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Auditoría */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Auditoría de Permisos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            El sistema registra un log de todos los cambios realizados en
            permisos y roles:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Quién cambió el permiso</li>
            <li>Cuándo se realizó el cambio</li>
            <li>Qué permiso se modificó</li>
            <li>Valor anterior y nuevo</li>
          </ul>
        </CardContent>
      </Card>

      {/* Catálogos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Catálogos
          </CardTitle>
          <CardDescription>
            Datos maestros que se usan en todo el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Los catálogos son listas de opciones que se reutilizan en distintos
            módulos. Se gestionan desde{' '}
            <strong>Empresa → Catálogos</strong>:
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="font-medium text-sm">Para Empleados:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                <li>Puestos de trabajo</li>
                <li>Categorías laborales</li>
                <li>Tipos de contrato</li>
                <li>Sindicatos</li>
                <li>Convenios colectivos</li>
                <li>Centros de costo</li>
                <li>Sectores</li>
                <li>Tipos operativos</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">Para Equipamiento:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                <li>Marcas de vehículos</li>
                <li>Tipos de vehículos</li>
                <li>Propietarios de equipos</li>
                <li>Contratistas</li>
              </ul>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            Cada catálogo tiene la misma operación: crear, editar, activar y
            desactivar opciones. Se recomienda cargar los catálogos antes de
            empezar a usar los módulos que los necesitan.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Relación con otros módulos:</strong>
          <ul className="list-disc pl-6 mt-1 space-y-1">
            <li>
              <strong>Todos los módulos</strong>: los permisos definidos aquí
              controlan qué puede ver y hacer cada usuario en todo el sistema
            </li>
            <li>
              <strong>Empleados</strong>: usa catálogos de puestos, categorías,
              contratos, sindicatos, centros de costo y sectores
            </li>
            <li>
              <strong>Equipamiento</strong>: usa catálogos de marcas, tipos de
              vehículo, propietarios y contratistas
            </li>
            <li>
              <strong>Documentos</strong>: las condiciones de aplicación de
              documentos usan los catálogos
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
