# Plan de Implementación: Módulo de Contabilidad

Este plan detalla la implementación de un módulo de contabilidad completo para el sistema, siguiendo las normas contables argentinas y las reglas del proyecto.

## 1. Estructura del Módulo
```
src/modules/accounting/
├── features/
│   ├── accounts/           # Plan de cuentas
│   ├── entries/           # Asientos contables
│   ├── reports/          # Informes contables
│   └── settings/         # Configuración contable
└── shared/
    ├── types/           # Tipos y enums
    ├── utils/           # Utilidades contables
    └── validators/      # Validadores de asientos
```

## 2. Modelos de Base de Datos (Prisma)

### 2.1 Plan de Cuentas
```prisma
enum AccountType {
  ASSET          // Activo
  LIABILITY      // Pasivo
  EQUITY         // Patrimonio Neto
  REVENUE        // Ingresos
  EXPENSE        // Gastos
}

enum AccountNature {
  DEBIT          // Saldo Deudor
  CREDIT         // Saldo Acreedor
}

model Account {
  id          String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId   String      @db.Uuid
  code        String      // Código contable (ej: 1.1.1)
  name        String      // Nombre de la cuenta
  type        AccountType
  nature      AccountNature
  parent      Account?    @relation("AccountHierarchy")
  children    Account[]   @relation("AccountHierarchy")
  isActive    Boolean     @default(true)
  company     Company     @relation(fields: [companyId], references: [id])
  entries     JournalEntryLine[]
  
  @@unique([companyId, code])
}
```

### 2.2 Asientos Contables
```prisma
model JournalEntry {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId   String    @db.Uuid
  number      Int       // Número de asiento
  date        DateTime
  description String
  isPosted    Boolean   @default(false)
  postDate    DateTime?
  company     Company   @relation(fields: [companyId], references: [id])
  lines       JournalEntryLine[]
  createdBy   String    // userId
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@unique([companyId, number])
}

model JournalEntryLine {
  id            String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  entryId       String      @db.Uuid
  accountId     String      @db.Uuid
  description   String?
  debit         Decimal     @default(0)
  credit        Decimal     @default(0)
  entry         JournalEntry @relation(fields: [entryId], references: [id])
  account       Account     @relation(fields: [accountId], references: [id])
}
```

## 3. Funcionalidades Principales

### 3.1 Plan de Cuentas
- CRUD de cuentas contables
- Importación/Exportación del plan de cuentas
- Validación de jerarquía y unicidad de códigos
- Gestión de estados (activo/inactivo)

### 3.2 Asientos Contables
- Creación y edición de asientos
- Validación de partida doble
- Numeración automática
- Posteo/desposteo de asientos
- Validación de IVA según tipo de contribuyente

### 3.3 Informes
- Balance de sumas y saldos
- Libro Diario
- Libro Mayor
- Balance General
- Estado de Resultados

### 3.4 Configuración
- Ejercicio contable
- Numeración de asientos
- Cuentas predeterminadas
- Configuración de IVA

## 4. Validaciones y Reglas de Negocio

### 4.1 Validaciones Generales
- Verificar partida doble (Debe = Haber)
- Validar naturaleza de las cuentas
- Controlar fechas dentro del ejercicio
- Verificar permisos del usuario

### 4.2 Validaciones Impositivas
- Validar IVA según tipo de contribuyente
- Calcular retenciones automáticamente
- Validar alícuotas según tipo de operación

## 5. Integración con Módulos Existentes

### 5.1 Empresas (Company)
- Integrar con tipo de contribuyente
- Configuración contable por empresa
- Validaciones según régimen fiscal

### 5.2 Documentos
- Integración con comprobantes
- Generación automática de asientos
- Trazabilidad documento-asiento

### 5.3 Empleados
- Asientos automáticos de sueldos
- Provisiones sociales
- Cargas fiscales

## 6. Fases de Implementación

1. **Fase 1: Estructura Base**
   - Modelos de base de datos
   - CRUD básico de cuentas
   - Estructura de asientos

2. **Fase 2: Lógica Contable**
   - Validaciones de partida doble
   - Posteo de asientos
   - Cálculos de IVA

3. **Fase 3: Informes**
   - Libro diario y mayor
   - Balances
   - Exportaciones

4. **Fase 4: Integraciones**
   - Documentos comerciales
   - Liquidación de sueldos
   - Automatizaciones

## 7. Consideraciones Técnicas

### 7.1 Arquitectura
- Seguir estructura de módulos existente
- Usar Server Components para informes
- Client Components para formularios
- Zod para validaciones

### 7.2 Performance
- Indexar campos críticos
- Paginar resultados grandes
- Cachear informes pesados

### 7.3 Seguridad
- Validar permisos por acción
- Auditar modificaciones
- Restringir acceso por empresa

---

## ESTADO DE IMPLEMENTACIÓN (Actualizado)

### ✅ Fase 1: Estructura Base - COMPLETADA
- [x] Modelos de base de datos (Account, JournalEntry, JournalEntryLine, AccountingSettings)
- [x] CRUD completo de cuentas con validaciones
- [x] Estructura de asientos con status (DRAFT, POSTED, REVERSED)
- [x] Numeración automática de asientos
- [x] Jerarquía de cuentas con código estructurado

### ✅ Fase 2: Lógica Contable - COMPLETADA
- [x] Revalidación de rutas para todas las mutaciones
- [x] Limpieza arquitectónica: Eliminación de campos VAT (el IVA va en facturas)
- [x] Audit Trail completo (reversedBy, reversedAt, relaciones entre asientos)
- [x] Validaciones reforzadas:
  - Partida doble con mensajes detallados
  - Naturaleza de cuentas con warnings
  - Fecha fiscal mejorada
  - Mínimo 2 líneas por asiento
- [x] Cálculo de saldos (calculateAccountBalance, calculateAllAccountBalances, verifyAccountingEquation)
- [x] Posteo y reversión de asientos con trazabilidad completa

### ✅ Fase 3: Informes - COMPLETADA
- [x] Balance de Sumas y Saldos con exportación a Excel
- [x] Libro Diario ordenado por fecha y número
- [x] Libro Mayor con movimientos por cuenta
- [x] Balance General (Estado de Situación Patrimonial)
- [x] Estado de Resultados (Ingresos - Gastos)
- [x] Selector de informes con 5 reportes disponibles
- [x] Todas las exportaciones incluyen formato Excel

### ⏳ Fase 4: Integraciones - PENDIENTE

Esta fase conecta el módulo de contabilidad con otros módulos del sistema para automatizar la generación de asientos contables desde operaciones comerciales y de RRHH.

#### 4.1 Integración con Documentos Comerciales (Alta Prioridad)

**Objetivo**: Generar asientos contables automáticamente desde facturas de compra/venta

**Funcionalidades**:
1. **Facturas de Venta**
   - Crear asiento automático al confirmar factura
   - Líneas generadas:
     - Debe: Cuentas por Cobrar (total con IVA)
     - Haber: Ventas (neto)
     - Haber: IVA Débito Fiscal (IVA)
   - Vincular factura con asiento generado
   - Revertir asiento si se anula factura

2. **Facturas de Compra**
   - Crear asiento automático al registrar factura de proveedor
   - Líneas generadas:
     - Debe: Compras (neto)
     - Debe: IVA Crédito Fiscal (IVA)
     - Haber: Cuentas por Pagar (total con IVA)
   - Vincular factura con asiento generado
   - Revertir asiento si se anula factura

3. **Recibos y Pagos**
   - Asiento de cobro (Debe: Caja/Banco, Haber: Cuentas por Cobrar)
   - Asiento de pago (Debe: Cuentas por Pagar, Haber: Caja/Banco)
   - Soporte para múltiples formas de pago (efectivo, cheque, transferencia)

4. **Configuración**
   - Mapeo de cuentas predeterminadas:
     - Cuenta de Ventas
     - Cuenta de Compras
     - Cuenta de IVA Débito Fiscal
     - Cuenta de IVA Crédito Fiscal
     - Cuenta de Cuentas por Cobrar
     - Cuenta de Cuentas por Pagar
     - Cuenta de Caja
     - Cuentas de Bancos
   - Opción de generación manual o automática
   - Vista previa del asiento antes de confirmar

**Archivos a crear/modificar**:
- `src/modules/accounting/features/integrations/documents/`
  - `generateInvoiceEntry.ts` - Generador de asientos desde facturas
  - `generatePaymentEntry.ts` - Generador de asientos de cobros/pagos
  - `actions.server.ts` - Server actions de integración
- `src/modules/accounting/features/settings/`
  - Agregar sección "Cuentas Predeterminadas" en configuración
  - Formulario de mapeo de cuentas

**Tiempo estimado**: 8-10 horas

#### 4.2 Integración con Liquidación de Sueldos (Media Prioridad)

**Objetivo**: Generar asientos contables de nómina automáticamente

**Funcionalidades**:
1. **Asiento de Sueldos y Jornales**
   - Debe: Sueldos y Jornales (total bruto)
   - Haber: Cargas Sociales a Pagar (contribuciones patronales)
   - Haber: Retenciones a Pagar (jubilación, obra social, etc.)
   - Haber: Sueldos a Pagar (neto a pagar)

2. **Asiento de Pago de Sueldos**
   - Debe: Sueldos a Pagar
   - Haber: Banco

3. **Asiento de Pago de Cargas Sociales**
   - Debe: Cargas Sociales a Pagar
   - Haber: Banco

4. **Configuración**
   - Mapeo de cuentas para conceptos de liquidación
   - Cuentas de provisiones y pasivos laborales

**Archivos a crear/modificar**:
- `src/modules/accounting/features/integrations/payroll/`
  - `generatePayrollEntry.ts`
  - `actions.server.ts`
- Agregar cuentas predeterminadas para RRHH en settings

**Tiempo estimado**: 6-8 horas

#### 4.3 Automatizaciones (Baja Prioridad)

**Objetivo**: Asientos recurrentes y procesos automáticos

**Funcionalidades**:
1. **Asientos Recurrentes**
   - Configurar asientos que se repiten periódicamente (alquileres, servicios)
   - Frecuencia: mensual, bimestral, anual
   - Generación automática o con aprobación

2. **Provisiones Automáticas**
   - Provisión mensual de aguinaldo (8.33% de sueldos)
   - Provisión de vacaciones
   - Depreciaciones automáticas de bienes de uso

3. **Cierre de Ejercicio**
   - Asientos de ajuste de resultados
   - Cierre de cuentas de resultado (Ingresos/Gastos → Resultado del Ejercicio)
   - Apertura del nuevo ejercicio

4. **Asientos de Ajuste**
   - Ajuste por inflación
   - Diferencias de cambio
   - Conciliaciones bancarias automáticas

**Archivos a crear/modificar**:
- `src/modules/accounting/features/automation/`
  - `recurring/` - Asientos recurrentes
  - `provisions/` - Provisiones automáticas
  - `closing/` - Cierre de ejercicio
  - `adjustments/` - Ajustes contables

**Tiempo estimado**: 10-12 horas

#### 4.4 Trazabilidad y Auditoría (Baja Prioridad)

**Funcionalidades**:
1. **Trazabilidad Documento → Asiento**
   - Ver origen de cada asiento (manual, factura, nómina, automático)
   - Navegación bidireccional (de documento a asiento y viceversa)
   - Campo `sourceType` y `sourceId` en JournalEntry

2. **Auditoría de Cambios**
   - Log de modificaciones de asientos
   - Historial de posteos/reversiones
   - Registro de usuarios y timestamps

3. **Reportes de Auditoría**
   - Asientos sin documentos de respaldo
   - Modificaciones fuera de período
   - Diferencias detectadas en conciliaciones

**Archivos a crear/modificar**:
- `src/modules/accounting/features/audit/`
  - `trail/` - Trazabilidad
  - `reports/` - Reportes de auditoría

**Tiempo estimado**: 6-8 horas

---

## Resumen Fase 4: Integraciones

| Componente | Prioridad | Tiempo | Complejidad |
|------------|-----------|--------|-------------|
| 4.1 Documentos Comerciales | Alta | 8-10h | Media-Alta |
| 4.2 Liquidación de Sueldos | Media | 6-8h | Media |
| 4.3 Automatizaciones | Baja | 10-12h | Alta |
| 4.4 Auditoría | Baja | 6-8h | Media |

**Tiempo total estimado: 30-38 horas**

**Recomendación**: Comenzar con 4.1 (Documentos Comerciales) ya que es la integración más crítica y de mayor impacto para el negocio. Permite automatizar el 80% de los asientos contables que se generan en una empresa típica.

---

## Posibles Mejoras Futuras

### Mejoras de UI/UX
1. **Filtros Avanzados en Reportes**
   - Filtrar por tipo de cuenta en todos los informes
   - Filtro por cuentas específicas o rangos de códigos
   - Filtro por subcuentas (con opción de incluir/excluir)
   - Búsqueda por texto en descripciones

2. **Visualizaciones Gráficas**
   - Gráficos de balance (barras: Activo vs Pasivo+Patrimonio)
   - Evolución de resultados (línea temporal de Ingresos vs Gastos)
   - Composición de activos (pie chart por tipo de activo)
   - Dashboard de indicadores (liquidez, solvencia, rentabilidad)

3. **Comparativas entre Períodos**
   - Balance General comparativo (año actual vs año anterior)
   - Estado de Resultados comparativo (mes actual vs mes anterior)
   - Variaciones porcentuales y absolutas
   - Análisis de tendencias

### Mejoras de Funcionalidad
4. **Notas Explicativas en Reportes**
   - Campo de notas en cuentas principales
   - Notas al pie en Balance General
   - Explicaciones de variaciones significativas
   - Referencias cruzadas entre estados

5. **Formatos de Impresión (PDF)**
   - Exportar informes a PDF con membrete de empresa
   - Formato profesional con firmas digitales
   - Opción de imprimir solo resumen o detallado
   - Incluir gráficos en PDFs

6. **Presupuestos y Proyecciones**
   - Cargar presupuesto anual por cuenta
   - Comparar real vs presupuestado
   - Alertas de desvíos significativos
   - Proyecciones basadas en datos históricos

7. **Múltiples Ejercicios**
   - Gestión de varios ejercicios contables
   - Consulta de ejercicios cerrados (solo lectura)
   - Migración de saldos entre ejercicios
   - Reapertura de ejercicios (con permisos especiales)

8. **Libro IVA Digital**
   - Libro IVA Ventas
   - Libro IVA Compras
   - Validación con AFIP
   - Exportación en formato exigido por AFIP

### Mejoras de Performance
9. **Optimización de Cálculos**
   - Cache de saldos calculados (invalidar al postear asientos)
   - Materialización de vistas para reportes pesados
   - Cálculo incremental de balances
   - Background jobs para informes largos

10. **Paginación y Lazy Loading**
    - Paginación de libro mayor para cuentas con muchos movimientos
    - Lazy loading de líneas de asiento en listados
    - Infinite scroll en reportes grandes

### Mejoras de Seguridad y Auditoría
11. **Permisos Granulares**
    - Permisos separados por feature (ver/crear/editar/eliminar/postear/reversar)
    - Restricción por tipo de cuenta
    - Límites de monto para aprobaciones
    - Workflow de aprobación multi-nivel

12. **Backup y Exportación Completa**
    - Exportar plan de cuentas completo
    - Exportar todos los asientos del ejercicio
    - Importar asientos desde archivo (con validaciones)
    - Backup automático antes de operaciones críticas

### Integraciones Adicionales
13. **Integración con Bancos**
    - Importar extractos bancarios
    - Conciliación automática de movimientos
    - Generación de asientos desde extracto

14. **Integración con AFIP**
    - Validación de CUIT/CUIL
    - Consulta de situación fiscal
    - Exportación de libros digitales
    - Declaraciones juradas (F.931, F.649)

15. **API para Sistemas Externos**
    - Endpoints REST para crear asientos desde otros sistemas
    - Webhooks para notificar cambios
    - Autenticación con API keys

---

## Documentación Complementaria

- **Separación Contabilidad vs Facturación**: `/docs/contabilidad_vs_facturacion.md`
- **Cuentas Contables Estándar**: `/docs/cuentas_contables.md` (si existe)
- **Reglas del Proyecto**: `/CLAUDE.md` y `/.claude/rules/`

