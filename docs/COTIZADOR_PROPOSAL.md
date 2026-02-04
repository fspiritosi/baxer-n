# Propuesta: Módulo Cotizador

> **Fecha:** Febrero 2026
> **Estado:** Propuesta pendiente de implementación
> **Prioridad:** Por definir

---

## Contexto

La empresa ofrece servicios de saneamiento y tratamiento de efluentes en la zona de Vaca Muerta (Neuquén, Argentina). Necesitan un sistema para cotizar servicios a sus clientes (empresas petroleras como Pluspetrol, Tecpetrol, YPF, Vista, Geopark, etc.).

### Documentos de Referencia Analizados

- `COTIZACION (Autoguardado).xlsx` - Planilla de cálculo de costos
- `ENERO 2026 - ZONA Nº X COTIZACION TIPO.DOCX` - Cotizaciones por zona
- `PO 02 R 1 Control de alquileres.xlsx` - Control de alquileres
- `PO 10 R 7 Orden de trabajo de servicios.docx` - Órdenes de trabajo

---

## Análisis de los Datos

### Servicios que ofrece la empresa

| Categoría | Servicios |
|-----------|-----------|
| **PTECs** | OZ 06 (1-9 pers), OZ 10 (10-19 pers), OZ 23 (20-49 pers), OZ 70 (50-89 pers), OZ 150 (90-180 pers), OZ 300 (181-300 pers) |
| **Alquileres** | Cisternas, Baños químicos, Tanques de agua (10m³), Bombeo/Riego, Centrífugas |
| **Servicios** | Desagote, Movilización, Desmovilización, Conexión de trailers, Visita de mantenimiento |
| **Análisis** | Laboratorio Praxis (análisis de efluentes) |
| **Provisión** | Agua 10m³, Agua 20m³ |

### Variables de Cálculo Identificadas

1. **Distancia (km)** → Afecta combustible y horas de viaje
2. **Cantidad de personas** → Determina tamaño de PTEC
3. **Tipo de cliente (Grado 1/2/3)** → Porcentaje de ganancia diferenciado
   - Grado 1: 10% de ganancia
   - Grado 2: 20% de ganancia
   - Grado 3: 35% de ganancia
4. **Zona geográfica (1-5)** → Costos base diferentes por ubicación
5. **Duración (días/meses)** → Para servicios de alquiler

### Componentes de Costo (del Excel)

- **Mano de obra:** Sueldo básico, horas extras (50% y 100%), viáticos, EPP
- **Materiales:** Caños, mangueras, cables, bombas, aspersores
- **Combustible:** Consumo por km (vehículo liviano vs pesado)
- **Amortización:** Equipos, vehículos, PTECs
- **Otros:** Análisis de laboratorio, viandas, seguros

---

## Estructura Propuesta

### 1. Modelos de Prisma (nuevos)

```prisma
// Catálogo de servicios configurables
model Service {
  id          String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String          // "PTEC OZ 70", "Alquiler Cisterna"
  code        String          // "PTEC-70", "ALQ-CIS"
  category    ServiceCategory
  unit        ServiceUnit     // DIA, MES, SERVICIO, M3, KM
  basePrice   Decimal         @db.Decimal(12, 2) // Precio base
  description String?
  isActive    Boolean         @default(true)

  // Configuración de cálculo específica del servicio
  config      Json?           @db.JsonB

  companyId   String          @map("company_id") @db.Uuid
  company     Company         @relation(fields: [companyId], references: [id], onDelete: Cascade)
  quoteItems  QuoteItem[]

  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")

  @@map("services")
}

enum ServiceCategory {
  PTEC        // Plantas de tratamiento
  ALQUILER    // Alquiler de equipos
  SERVICIO    // Servicios puntuales
  ANALISIS    // Análisis de laboratorio
  PROVISION   // Provisión de agua/insumos

  @@map("service_category")
}

enum ServiceUnit {
  DIA
  MES
  SERVICIO
  M3
  KM
  UNIDAD

  @@map("service_unit")
}

// Items individuales del presupuesto (reemplaza el campo JSON)
model QuoteItem {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  quantity    Decimal  @db.Decimal(10, 2)
  duration    Int?     // Días o meses según unidad
  unitPrice   Decimal  @db.Decimal(12, 2)
  subtotal    Decimal  @db.Decimal(12, 2)
  description String?

  quoteId     String   @map("quote_id") @db.Uuid
  quote       Quote    @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  serviceId   String?  @map("service_id") @db.Uuid
  service     Service? @relation(fields: [serviceId], references: [id])

  @@map("quote_items")
}

// Zonas geográficas con costos asociados
model Zone {
  id                  String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name                String  // "Zona 1 - Añelo"
  description         String?
  kmFromBase          Int     @map("km_from_base") // Distancia desde la base
  fuelCostMultiplier  Decimal @default(1) @map("fuel_cost_multiplier") @db.Decimal(4, 2)
  isActive            Boolean @default(true) @map("is_active")

  companyId           String  @map("company_id") @db.Uuid
  company             Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@map("zones")
}

// Tipos/Grados de cliente con % de ganancia
model ClientTier {
  id              String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name            String  // "Grado 1", "Grado 2", "Grado 3"
  profitMargin    Decimal @map("profit_margin") @db.Decimal(4, 2) // 0.10, 0.20, 0.35
  description     String?
  isDefault       Boolean @default(false) @map("is_default")

  companyId       String  @map("company_id") @db.Uuid
  company         Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@map("client_tiers")
}
```

### 2. Flujo del Cotizador (UI)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREAR PRESUPUESTO                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. DATOS GENERALES                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Cliente: [Select cliente o lead]                         │   │
│  │ Zona/Ubicación: [Select zona]  Km: [auto-calculado]     │   │
│  │ Tipo de Cliente: [Grado 1/2/3] → Margen: 10%/20%/35%    │   │
│  │ Fecha de emisión: [date]  Validez: [30 días]            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  2. SERVICIOS                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [+ Agregar servicio]                                     │   │
│  │                                                          │   │
│  │ ┌────────────────────────────────────────────────────┐  │   │
│  │ │ Servicio: PTEC OZ 70           Cant: 1   Días: 30  │  │   │
│  │ │ Precio unitario: $XXX    Subtotal: $XXX        [X] │  │   │
│  │ └────────────────────────────────────────────────────┘  │   │
│  │ ┌────────────────────────────────────────────────────┐  │   │
│  │ │ Servicio: Movilización PTEC    Cant: 1             │  │   │
│  │ │ Precio unitario: $XXX    Subtotal: $XXX        [X] │  │   │
│  │ └────────────────────────────────────────────────────┘  │   │
│  │ ┌────────────────────────────────────────────────────┐  │   │
│  │ │ Servicio: Desmovilización      Cant: 1             │  │   │
│  │ │ Precio unitario: $XXX    Subtotal: $XXX        [X] │  │   │
│  │ └────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  3. RESUMEN                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                              Subtotal:    $XXX,XXX      │   │
│  │                              Margen (20%): $XX,XXX      │   │
│  │                              IVA (21%):    $XX,XXX      │   │
│  │                              ─────────────────────      │   │
│  │                              TOTAL:       $XXX,XXX      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  4. OBSERVACIONES                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Textarea para notas adicionales]                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Guardar Borrador]  [Generar PDF]  [Enviar al Cliente]        │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Estructura de Features

```
modules/commercial/features/
├── quotes/
│   ├── list/                      # Lista de presupuestos
│   │   ├── QuotesList.tsx         # Server Component
│   │   ├── actions.server.ts      # getAllQuotes, deleteQuote
│   │   ├── columns.tsx
│   │   └── components/
│   │       └── _QuotesDataTable.tsx
│   │
│   ├── create/                    # Crear presupuesto (el cotizador)
│   │   ├── QuoteCreate.tsx        # Server Component
│   │   ├── actions.server.ts      # createQuote, calculatePrice
│   │   └── components/
│   │       ├── _QuoteForm.tsx         # Formulario principal
│   │       ├── _ServiceSelector.tsx   # Modal/Combobox de servicios
│   │       ├── _QuoteItemRow.tsx      # Fila de item editable
│   │       └── _QuoteSummary.tsx      # Resumen de totales
│   │
│   ├── detail/                    # Ver presupuesto
│   │   ├── QuoteDetail.tsx
│   │   ├── actions.server.ts      # getQuoteById
│   │   └── components/
│   │       ├── _QuoteView.tsx
│   │       └── _QuotePDF.tsx          # Generación de PDF
│   │
│   └── edit/                      # Editar presupuesto (solo borradores)
│       ├── QuoteEdit.tsx
│       ├── actions.server.ts
│       └── components/
│           └── _QuoteEditForm.tsx
│
├── services/                      # ABM de servicios (configuración)
│   └── list/
│       ├── ServicesList.tsx
│       ├── actions.server.ts
│       ├── columns.tsx
│       └── components/
│           ├── _ServicesDataTable.tsx
│           └── _ServiceFormModal.tsx
│
├── zones/                         # ABM de zonas (configuración)
│   └── list/
│       ├── ZonesList.tsx
│       ├── actions.server.ts
│       └── components/
│           └── _ZoneFormModal.tsx
│
└── client-tiers/                  # ABM de tipos de cliente
    └── list/
        ├── ClientTiersList.tsx
        ├── actions.server.ts
        └── components/
            └── _ClientTierFormModal.tsx
```

### 4. Calculadora de Precios (Lógica del Servidor)

```typescript
// modules/commercial/features/quotes/create/actions.server.ts

interface CalculatePriceParams {
  serviceId: string;
  quantity: number;
  duration?: number;      // días o meses según unidad del servicio
  zoneId?: string;        // para calcular km y costo de movilización
  clientTierId: string;   // para determinar % de ganancia
}

interface PriceCalculation {
  basePrice: Decimal;
  fuelCost: Decimal;
  subtotal: Decimal;
  marginPercent: Decimal;
  marginAmount: Decimal;
  total: Decimal;
}

export async function calculateServicePrice(
  params: CalculatePriceParams
): Promise<PriceCalculation> {
  const service = await getServiceById(params.serviceId);
  const zone = params.zoneId ? await getZoneById(params.zoneId) : null;
  const clientTier = await getClientTierById(params.clientTierId);

  // Precio base del servicio
  let basePrice = service.basePrice;

  // Calcular costo de combustible si hay zona
  let fuelCost = new Decimal(0);
  if (zone) {
    // Fórmula: km * consumo_por_km * precio_combustible * multiplicador_zona
    fuelCost = calculateFuelCost(zone.kmFromBase, zone.fuelCostMultiplier);
  }

  // Calcular subtotal (base + fuel) * cantidad * duración
  const duration = params.duration || 1;
  const subtotal = basePrice
    .plus(fuelCost)
    .times(params.quantity)
    .times(duration);

  // Aplicar margen de ganancia según tipo de cliente
  const marginPercent = clientTier.profitMargin;
  const marginAmount = subtotal.times(marginPercent);

  // Total final
  const total = subtotal.plus(marginAmount);

  return {
    basePrice,
    fuelCost,
    subtotal,
    marginPercent,
    marginAmount,
    total,
  };
}

// Calcular totales del presupuesto completo
export async function calculateQuoteTotals(
  items: QuoteItemInput[],
  clientTierId: string,
  zoneId?: string
): Promise<QuoteTotals> {
  let subtotal = new Decimal(0);

  for (const item of items) {
    const price = await calculateServicePrice({
      serviceId: item.serviceId,
      quantity: item.quantity,
      duration: item.duration,
      zoneId,
      clientTierId,
    });
    subtotal = subtotal.plus(price.subtotal);
  }

  const clientTier = await getClientTierById(clientTierId);
  const margin = subtotal.times(clientTier.profitMargin);
  const subtotalWithMargin = subtotal.plus(margin);
  const tax = subtotalWithMargin.times(0.21); // IVA 21%
  const total = subtotalWithMargin.plus(tax);

  return { subtotal, margin, tax, total };
}
```

---

## Plan de Implementación por Fases

### Fase 1 - Base (MVP)

**Objetivo:** Poder crear presupuestos básicos seleccionando servicios de un catálogo.

- [ ] Migración Prisma: Agregar modelos Service, QuoteItem, Zone, ClientTier
- [ ] Datos semilla: Cargar servicios base desde los Excel
- [ ] ABM de Servicios (catálogo configurable)
- [ ] ABM de Zonas geográficas
- [ ] ABM de Tipos de Cliente (Grados)
- [ ] Crear presupuesto: formulario básico con selección de servicios
- [ ] Lista de presupuestos con filtros por estado
- [ ] Ver detalle de presupuesto

**Entregables:**
- Catálogo de servicios configurable
- Crear presupuesto seleccionando servicios y cantidades
- Lista de presupuestos con estados (Borrador, Enviado, Aceptado, etc.)

### Fase 2 - Cálculos Automáticos

**Objetivo:** Implementar la lógica de cálculo de precios según zona y tipo de cliente.

- [ ] Calculadora de precios por zona (combustible, distancia)
- [ ] Aplicar márgenes automáticos por tipo de cliente
- [ ] Cálculo automático de movilización/desmovilización según km
- [ ] Recálculo en tiempo real al modificar items
- [ ] Configuración de parámetros (precio combustible, consumo por km, etc.)

**Entregables:**
- Precios calculados automáticamente según zona y cliente
- Actualización en tiempo real del total

### Fase 3 - Documentos y Comunicación

**Objetivo:** Generar documentos profesionales y enviarlos a clientes.

- [ ] Generar PDF del presupuesto (usando react-pdf o similar)
- [ ] Template de PDF personalizable con logo de empresa
- [ ] Enviar presupuesto por email al cliente (integrar con Resend)
- [ ] Historial de versiones del presupuesto
- [ ] Duplicar presupuesto existente

**Entregables:**
- PDF profesional del presupuesto
- Envío por email con tracking

### Fase 4 - Funcionalidades Avanzadas

**Objetivo:** Integrar el cotizador con el resto del sistema.

- [ ] Convertir presupuesto aceptado en Orden de Trabajo
- [ ] Dashboard de presupuestos (métricas: emitidos, aceptados, rechazados, vencidos)
- [ ] Alertas de presupuestos por vencer
- [ ] Comparativa de presupuestos por período
- [ ] Reportes de conversión (lead → cliente → presupuesto → OT)

**Entregables:**
- Flujo completo desde cotización hasta orden de trabajo
- Dashboard con métricas comerciales

---

## Datos Semilla (Servicios Iniciales)

```typescript
const serviciosSemilla = [
  // PTECs
  { code: 'PTEC-06', name: 'PTEC OZ 06', category: 'PTEC', unit: 'DIA', description: 'De 1 a 9 personas' },
  { code: 'PTEC-10', name: 'PTEC OZ 10', category: 'PTEC', unit: 'DIA', description: 'De 10 a 19 personas' },
  { code: 'PTEC-23', name: 'PTEC OZ 23', category: 'PTEC', unit: 'DIA', description: 'De 20 a 49 personas' },
  { code: 'PTEC-70', name: 'PTEC OZ 70', category: 'PTEC', unit: 'DIA', description: 'De 50 a 89 personas' },
  { code: 'PTEC-150', name: 'PTEC OZ 150', category: 'PTEC', unit: 'DIA', description: 'De 90 a 180 personas' },
  { code: 'PTEC-300', name: 'PTEC OZ 300', category: 'PTEC', unit: 'DIA', description: 'De 181 a 300 personas' },

  // Alquileres
  { code: 'ALQ-CIS', name: 'Alquiler Cisterna', category: 'ALQUILER', unit: 'DIA' },
  { code: 'ALQ-BANO', name: 'Alquiler Baño', category: 'ALQUILER', unit: 'DIA' },
  { code: 'ALQ-TK10', name: 'Tanque Agua 10m³', category: 'ALQUILER', unit: 'DIA' },
  { code: 'ALQ-BOMB', name: 'Alquiler Bombeo', category: 'ALQUILER', unit: 'DIA' },
  { code: 'ALQ-RIEGO', name: 'Alquiler Riego', category: 'ALQUILER', unit: 'DIA' },

  // Servicios
  { code: 'SRV-DESAG', name: 'Desagote', category: 'SERVICIO', unit: 'SERVICIO' },
  { code: 'SRV-MOV-PTEC', name: 'Movilización PTEC', category: 'SERVICIO', unit: 'SERVICIO' },
  { code: 'SRV-DESMOV-PTEC', name: 'Desmovilización PTEC', category: 'SERVICIO', unit: 'SERVICIO' },
  { code: 'SRV-MOV-CIS', name: 'Movilización Cisterna', category: 'SERVICIO', unit: 'SERVICIO' },
  { code: 'SRV-MOV-BANO', name: 'Movilización Baño', category: 'SERVICIO', unit: 'SERVICIO' },
  { code: 'SRV-CONEX', name: 'Conexión de Trailers', category: 'SERVICIO', unit: 'UNIDAD' },
  { code: 'SRV-MTTO', name: 'Visita de Mantenimiento', category: 'SERVICIO', unit: 'SERVICIO' },

  // Análisis
  { code: 'ANA-LAB', name: 'Análisis Laboratorio', category: 'ANALISIS', unit: 'UNIDAD' },

  // Provisión
  { code: 'PROV-AGUA10', name: 'Provisión Agua 10m³', category: 'PROVISION', unit: 'M3' },
  { code: 'PROV-AGUA20', name: 'Provisión Agua 20m³', category: 'PROVISION', unit: 'M3' },
];

const zonasSemilla = [
  { name: 'Zona 1 - Añelo', kmFromBase: 50 },
  { name: 'Zona 2 - Rincón de los Sauces', kmFromBase: 120 },
  { name: 'Zona 3 - Catriel', kmFromBase: 180 },
  { name: 'Zona 4 - Plaza Huincul', kmFromBase: 80 },
  { name: 'Zona 5 - Neuquén Capital', kmFromBase: 100 },
];

const tiposClienteSemilla = [
  { name: 'Grado 1', profitMargin: 0.10, description: '10% de ganancia' },
  { name: 'Grado 2', profitMargin: 0.20, description: '20% de ganancia', isDefault: true },
  { name: 'Grado 3', profitMargin: 0.35, description: '35% de ganancia' },
];
```

---

## Consideraciones Técnicas

### Dependencias Sugeridas

- **react-pdf** o **@react-pdf/renderer**: Para generar PDFs
- **Decimal.js**: Para cálculos precisos con decimales (ya está en Prisma)
- **Resend**: Para envío de emails (ya configurado)

### Integraciones

- **Clientes/Leads**: El presupuesto se vincula a un cliente existente o lead
- **Contactos**: Enviar el presupuesto al contacto del cliente
- **Órdenes de Trabajo**: Convertir presupuesto aceptado en OT (Fase 4)

### Permisos Sugeridos

```typescript
const quotePermissions = [
  'quotes.view',      // Ver lista de presupuestos
  'quotes.create',    // Crear presupuesto
  'quotes.edit',      // Editar presupuesto (solo borradores)
  'quotes.delete',    // Eliminar presupuesto
  'quotes.send',      // Enviar presupuesto al cliente
  'quotes.approve',   // Marcar como aceptado/rechazado
  'services.manage',  // Administrar catálogo de servicios
  'zones.manage',     // Administrar zonas
];
```

---

## Referencias

- Archivos analizados: `C:\Users\Yorda\Downloads\Fwd_ Minuta desarrollo 27_01_26\`
- Modelo Quote existente: `prisma/schema.prisma` línea 719
- Módulo commercial existente: `src/modules/commercial/`
- Notas del proyecto: `notas.md`
