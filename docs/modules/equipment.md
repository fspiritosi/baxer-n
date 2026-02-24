# Modulo Equipamiento

**Rutas:** `/dashboard/equipment`, `/dashboard/equipment/new`, `/dashboard/equipment/[id]`, `/dashboard/equipment/[id]/edit`
**Archivos:** `src/modules/equipment/`

El modelo Prisma subyacente es `Vehicle`. El modulo distingue entre "Vehiculos" y "Otros equipos" via `TypeOfVehicle`.

---

## Features

### Lista (`features/list/`)

- Tabs: Todos, Vehiculos, Otros
- Tabla paginada server-side con busqueda (numero interno, dominio, chasis, motor)
- Filtros: estado, condicion, tipo, marca, activo/inactivo
- Exportacion a Excel
- Soft-delete (con motivo de baja)
- Reactivacion de equipos dados de baja

### Crear (`features/create/`)

- Creacion con campos completos
- Asociacion a contratistas (relacion N:M via `ContractorVehicle`)
- Estado inicial: `INCOMPLETE`, condicion: `OPERATIVE`

### Detalle (`features/detail/`)

- Informacion completa del vehiculo/equipo
- Estado de cumplimiento documental
- Codigo QR para acceso publico

### Editar (`features/edit/`)

- Actualiza vehiculo + re-crea relaciones de contratistas en transaccion

## Campos del Vehiculo/Equipo

**Identificacion:** numero interno, dominio/patente, chasis, motor, serie, ano, kilometraje
**Estado:** status (VehicleStatus), condicion (VehicleCondition)
**Titularidad:** tipo (propia/leasing/tercero), titular, contrato (fechas, moneda, precio)
**Relaciones:** marca, modelo, tipo de equipo, tipo de vehiculo, centro de costo, sector, tipo operativo, contratistas

## Estados y Condiciones

**VehicleStatus:** ACTIVE, INACTIVE, MAINTENANCE, RETIRED
**VehicleCondition:** EXCELLENT, GOOD, FAIR, POOR, OPERATIVE
**Motivos de baja:** SALE, TOTAL_LOSS, RETURN, OTHER

## QR Publico

Cada equipo tiene un codigo QR que apunta a `/eq/[id]` (ruta publica, sin autenticacion). Permite:
- Descargar como PNG (alta resolucion)
- Imprimir directamente
- Copiar URL al portapapeles

## Documentos del Equipo

Gestionados desde el modulo Documents. Rutas: `/dashboard/equipment/[id]/documents`

## Server Actions Principales

| Funcion | Descripcion |
|---------|-------------|
| `getEquipmentPaginated` | Lista paginada con tabs y filtros |
| `getEquipmentTabCounts` | Conteo para tabs (todos, vehiculos, otros) |
| `createVehicle` | Crear vehiculo + relaciones de contratistas |
| `getVehicleById` | Detalle con todas las relaciones |
| `updateVehicle` | Actualizar en transaccion |
| `softDeleteVehicle` | Baja con motivo |
| `reactivateVehicle` | Reactivar equipo dado de baja |
