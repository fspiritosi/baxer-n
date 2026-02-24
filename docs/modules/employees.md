# Modulo Empleados

**Rutas:** `/dashboard/employees`, `/dashboard/employees/new`, `/dashboard/employees/[id]`, `/dashboard/employees/[id]/edit`
**Archivos:** `src/modules/employees/`

---

## Features

### Lista (`features/list/`)

- Tabla paginada server-side con busqueda (nombre, legajo, DNI, CUIL)
- Filtros: estado, puesto de trabajo, tipo de contrato
- Exportacion a Excel
- Soft-delete de empleados

### Crear (`features/create/`)

- Numero de legajo auto-generado (siguiente secuencial)
- Validacion de unicidad: `employeeNumber` y `cuil` dentro de la empresa
- Estado inicial: `INCOMPLETE`
- Upload de foto con presigned URL

### Detalle (`features/detail/`)

- Tabs: informacion personal, datos laborales, contacto
- Foto con URL presigned (1 hora)
- Estado de cumplimiento documental (tooltip)

### Editar (`features/edit/`)

- Pre-populacion del formulario con datos actuales
- Re-validacion de unicidad solo si el campo cambio

## Campos del Empleado

**Identificacion:** legajo, tipo/numero de documento, CUIL
**Personal:** nombre, apellido, fecha de nacimiento, genero, estado civil, nivel educativo, nacionalidad, foto
**Contacto:** telefono, email, direccion (calle, numero, CP, provincia, ciudad, lugar de nacimiento)
**Laboral:** fecha de ingreso, horas de trabajo diarias, afiliacion sindical, tipo de costo
**Relaciones de catalogo:** puesto, tipo de contrato, categoria laboral, centro de costo

## Estados

| Estado | Descripcion |
|--------|-------------|
| `INCOMPLETE` | Datos incompletos (estado inicial) |
| `ACTIVE` | Empleado activo |
| `INACTIVE` | Inactivo temporalmente |
| `TERMINATED` | Baja definitiva |
| `ON_LEAVE` | En licencia |
| `SUSPENDED` | Suspendido |

## Documentos del Empleado

Los documentos se gestionan desde el modulo Documents. Ver [Modulo Documentos](documents.md).

Rutas: `/dashboard/employees/[id]/documents`, `/dashboard/employees/[id]/documents/[docId]`

## Server Actions Principales

| Funcion | Feature | Descripcion |
|---------|---------|-------------|
| `getEmployeesPaginated` | list | Lista paginada con filtros |
| `getEmployeesForSelect` | list | Lista ligera para dropdowns |
| `createEmployee` | create | Crear con validacion de unicidad |
| `getNextEmployeeNumber` | create | Siguiente legajo secuencial |
| `getEmployeeById` | detail | Detalle completo con relaciones |
| `updateEmployee` | edit | Actualizar con re-validacion |
| `deleteEmployee` | list | Eliminacion permanente |
| `getAllEmployeesForExport` | list | Para exportacion Excel |
