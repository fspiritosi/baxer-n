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
