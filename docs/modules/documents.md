# Modulo Documentos

**Rutas:** `/dashboard/documents`, `/dashboard/employees/[id]/documents`, `/dashboard/equipment/[id]/documents`
**Archivos:** `src/modules/documents/`

---

## Conceptos Clave

### Tipos de Documento (DocumentType)

Cada tipo define que documentacion se requiere. Propiedades:

| Campo | Descripcion |
|-------|-------------|
| `appliesTo` | EMPLOYEE, EQUIPMENT, o COMPANY |
| `isMandatory` | Documento obligatorio |
| `hasExpiration` | Requiere fecha de vencimiento |
| `isMonthly` | Documento periodico (formato YYYY-MM), siempre re-subible |
| `isPrivate` | Visibilidad restringida |
| `isTermination` | Relacionado a baja del empleado |
| `isMultiResource` | Aplica a todos los empleados/equipos (no a uno especifico) |
| `isConditional` | Solo aplica si la entidad cumple condiciones |

### Sistema de Condiciones

Los tipos condicionales solo aplican a entidades que matchean los filtros:

**Condiciones de empleado:** puesto, tipo de contrato, categoria laboral, sindicato, convenio, genero, tipo de costo
**Condiciones de equipo:** marca de vehiculo, tipo de vehiculo

### Estados de Documento

| Estado | Descripcion |
|--------|-------------|
| `PENDING` | Pendiente de revision |
| `APPROVED` | Aprobado (documentos suben directamente como aprobados) |
| `EXPIRED` | Vencido (para documentos con expiracion) |

---

## Features

### Overview (`features/overview/`)

Vista global de documentos de toda la empresa:

- Tabs: Empleados (permanentes/mensuales), Equipos (permanentes/mensuales), Multi-recurso, Empresa
- Estadisticas por tab: total, pendientes, aprobados, vencidos
- Modal de upload universal (buscar empleado/equipo + tipo de documento)
- Exportacion a Excel

### Tipos de Documento (`features/document-types/`)

- CRUD de tipos con condiciones
- Tabs por `appliesTo`: Todos, Empleados, Equipos, Empresa
- Creacion con condiciones condicionales (relaciones pivote)
- Validacion: nombre/slug unicos
- Eliminacion bloqueada si hay documentos asociados

### Documentos de Empleado (`features/employee-documents/`)

- **Lista:** Documentos de un empleado con resumen de cumplimiento
- **Upload:** Subida a MinIO/R2, crea o actualiza el registro
  - `RENEWED`: Mantiene archivo anterior en historial
  - `REPLACED`: Elimina archivo anterior
- **Detalle:** Historial de versiones, preview con URL presigned
- **Acciones:** Revertir a version anterior, eliminar (con limpieza de archivos)

### Documentos de Equipo (`features/equipment-documents/`)

Mismo patron que empleados, sobre el modelo `EquipmentDocument`.

### Documentos de Empresa (`features/company-documents/`)

Documentos a nivel empresa (sin entidad especifica).

---

## Flujo de Upload

```
1. Usuario selecciona tipo de documento
2. Sistema verifica que el tipo aplica a la entidad (condiciones)
3. Archivo se sube a MinIO/R2 via presigned URL
4. Se crea/actualiza EmployeeDocument/EquipmentDocument
5. Se registra en historial (accion: UPLOADED/RENEWED/REPLACED)
6. Se recalcula estado del empleado/equipo
```

## Cumplimiento Documental

Para cada empleado/equipo se calcula:
- Total de tipos obligatorios que le aplican (respetando condiciones)
- Cuantos estan aprobados
- Porcentaje de cumplimiento

## Server Actions Principales

| Funcion | Descripcion |
|---------|-------------|
| `getDocumentTypesPaginated` | Lista paginada de tipos |
| `createDocumentType` | Crear tipo con condiciones |
| `uploadEmployeeDocument` | Subir documento de empleado |
| `getEmployeeDocumentsSummary` | Resumen de cumplimiento |
| `getPendingDocumentTypes` | Tipos obligatorios sin documento |
| `getDocumentDetailById` | Detalle con historial y preview |
| `revertToVersionVersion` | Revertir a version anterior |
