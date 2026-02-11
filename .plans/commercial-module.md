# Plan de Implementación: Módulo Comercial

Este plan detalla la implementación completa del módulo comercial del sistema, incluyendo gestión de productos, stock, facturación de ventas/compras, y tesorería (cajas y bancos). Sigue las normativas de AFIP y las reglas del proyecto.

## Objetivo

Crear un módulo comercial completo que permita:
- Gestionar catálogos de productos y servicios
- Controlar stock en múltiples almacenes
- Emitir facturas de venta con cálculo automático de impuestos
- Registrar facturas de compra de proveedores
- Administrar cobros y pagos (cajas y bancos)
- **Integrar con el módulo de Contabilidad** para generación automática de asientos

---

## 1. Arquitectura del Módulo

```
src/modules/
├── commercial/                    # Nuevo módulo padre
│   ├── products/                  # Artículos y servicios
│   ├── suppliers/                 # Proveedores
│   ├── warehouses/                # Almacenes y stock
│   ├── sales/                     # Facturación de ventas
│   ├── purchases/                 # Facturación de compras
│   ├── treasury/                  # Tesorería (cajas/bancos)
│   └── shared/                    # Compartido del módulo
│       ├── types/
│       ├── utils/
│       └── validators/
│
├── customers/                     # Módulo existente - mejoras
│   └── [mejoras fiscales]
│
└── accounting/                    # Módulo existente
    └── features/integrations/     # Nueva carpeta para integraciones
        └── commercial/
```

---

## 2. Modelos de Base de Datos (Prisma)

### 2.1 Proveedores (Suppliers)

```prisma
enum SupplierTaxCondition {
  RESPONSABLE_INSCRIPTO      // Responsable Inscripto
  MONOTRIBUTISTA             // Monotributista
  EXENTO                     // Exento
  NO_RESPONSABLE            // No Responsable
  CONSUMIDOR_FINAL          // Consumidor Final (raro en proveedores)
}

enum SupplierStatus {
  ACTIVE
  INACTIVE
  BLOCKED
}

model Supplier {
  id                String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId         String                @map("company_id") @db.Uuid
  code              String                // Código interno (auto-generado o manual)
  businessName      String                @map("business_name")  // Razón social
  tradeName         String?               @map("trade_name")     // Nombre de fantasía
  taxId             String                @map("tax_id")         // CUIT/CUIL
  taxCondition      SupplierTaxCondition  @map("tax_condition")

  // Contacto
  email             String?
  phone             String?
  website           String?

  // Dirección
  address           String?
  city              String?
  state             String?               // Provincia
  zipCode           String?               @map("zip_code")
  country           String                @default("Argentina")

  // Datos comerciales
  paymentTermDays   Int                   @default(0) @map("payment_term_days")  // Plazo de pago en días
  creditLimit       Decimal?              @map("credit_limit") @db.Decimal(12, 2)

  // Datos contables (para integración)
  defaultAccountId  String?               @map("default_account_id") @db.Uuid  // Cuenta contable predeterminada

  // Contactos
  contactName       String?               @map("contact_name")
  contactPhone      String?               @map("contact_phone")
  contactEmail      String?               @map("contact_email")

  // Estado
  status            SupplierStatus        @default(ACTIVE)
  notes             String?

  company           Company               @relation(fields: [companyId], references: [id])
  defaultAccount    Account?              @relation(fields: [defaultAccountId], references: [id])
  purchaseInvoices  PurchaseInvoice[]
  paymentOrders     PaymentOrder[]

  createdBy         String                @map("created_by")
  createdAt         DateTime              @default(now()) @map("created_at")
  updatedAt         DateTime              @updatedAt @map("updated_at")

  @@unique([companyId, code])
  @@unique([companyId, taxId])
  @@map("suppliers")
}
```

### 2.2 Mejoras en Customer

```prisma
// Agregar campos faltantes al modelo Customer existente:
model Customer {
  // ... campos existentes ...

  // AGREGAR:
  taxCondition      CustomerTaxCondition  @map("tax_condition") @default(CONSUMIDOR_FINAL)
  paymentTermDays   Int                   @default(0) @map("payment_term_days")
  creditLimit       Decimal?              @map("credit_limit") @db.Decimal(12, 2)
  priceListId       String?               @map("price_list_id") @db.Uuid
  defaultAccountId  String?               @map("default_account_id") @db.Uuid

  priceList         PriceList?            @relation(fields: [priceListId], references: [id])
  defaultAccount    Account?              @relation(fields: [defaultAccountId], references: [id])
  salesInvoices     SalesInvoice[]
  receipts          Receipt[]
}

enum CustomerTaxCondition {
  RESPONSABLE_INSCRIPTO
  MONOTRIBUTISTA
  EXENTO
  CONSUMIDOR_FINAL
}
```

### 2.3 Productos (Products)

```prisma
enum ProductType {
  PRODUCT              // Producto físico
  SERVICE              // Servicio
  COMBO                // Combo/paquete
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  DISCONTINUED
}

model ProductCategory {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId   String    @map("company_id") @db.Uuid
  name        String
  description String?
  parentId    String?   @map("parent_id") @db.Uuid

  company     Company           @relation(fields: [companyId], references: [id])
  parent      ProductCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    ProductCategory[] @relation("CategoryHierarchy")
  products    Product[]

  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("product_categories")
}

model Product {
  id                  String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId           String          @map("company_id") @db.Uuid
  code                String          // SKU
  name                String
  description         String?
  type                ProductType     @default(PRODUCT)

  // Categorización
  categoryId          String?         @map("category_id") @db.Uuid

  // Unidad de medida
  unitOfMeasure       String          @map("unit_of_measure") @default("UN")  // UN, KG, M, L, etc.

  // Precios
  costPrice           Decimal         @default(0) @map("cost_price") @db.Decimal(12, 2)
  salePrice           Decimal         @default(0) @map("sale_price") @db.Decimal(12, 2)
  salePriceWithTax    Decimal         @default(0) @map("sale_price_with_tax") @db.Decimal(12, 2)

  // Impuestos
  vatRate             Decimal         @default(21) @map("vat_rate") @db.Decimal(5, 2)  // Alícuota de IVA

  // Control de stock
  trackStock          Boolean         @default(true) @map("track_stock")
  minStock            Decimal?        @default(0) @map("min_stock") @db.Decimal(12, 3)
  maxStock            Decimal?        @map("max_stock") @db.Decimal(12, 3)

  // Datos adicionales
  barcode             String?         @unique
  internalCode        String?         @map("internal_code")
  brand               String?
  model               String?

  // Estado
  status              ProductStatus   @default(ACTIVE)

  // Relaciones
  company             Company                 @relation(fields: [companyId], references: [id])
  category            ProductCategory?        @relation(fields: [categoryId], references: [id])
  stockMovements      StockMovement[]
  warehouseStocks     WarehouseStock[]
  salesInvoiceLines   SalesInvoiceLine[]
  purchaseInvoiceLines PurchaseInvoiceLine[]
  priceListItems      PriceListItem[]

  createdBy           String          @map("created_by")
  createdAt           DateTime        @default(now()) @map("created_at")
  updatedAt           DateTime        @updatedAt @map("updated_at")

  @@unique([companyId, code])
  @@map("products")
}
```

### 2.4 Listas de Precios (Price Lists)

```prisma
model PriceList {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId   String    @map("company_id") @db.Uuid
  name        String
  description String?
  isDefault   Boolean   @default(false) @map("is_default")
  isActive    Boolean   @default(true) @map("is_active")

  company     Company           @relation(fields: [companyId], references: [id])
  items       PriceListItem[]
  customers   Customer[]

  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("price_lists")
}

model PriceListItem {
  id              String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  priceListId     String     @map("price_list_id") @db.Uuid
  productId       String     @map("product_id") @db.Uuid
  price           Decimal    @db.Decimal(12, 2)
  priceWithTax    Decimal    @map("price_with_tax") @db.Decimal(12, 2)

  priceList       PriceList  @relation(fields: [priceListId], references: [id], onDelete: Cascade)
  product         Product    @relation(fields: [productId], references: [id])

  @@unique([priceListId, productId])
  @@map("price_list_items")
}
```

### 2.5 Almacenes y Stock (Warehouses)

```prisma
enum WarehouseType {
  MAIN              // Principal
  BRANCH            // Sucursal
  TRANSIT           // En tránsito
  VIRTUAL           // Virtual (servicios)
}

model Warehouse {
  id          String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId   String          @map("company_id") @db.Uuid
  code        String
  name        String
  type        WarehouseType   @default(MAIN)

  // Ubicación
  address     String?
  city        String?
  state       String?

  isActive    Boolean         @default(true) @map("is_active")

  company     Company         @relation(fields: [companyId], references: [id])
  stocks      WarehouseStock[]
  movements   StockMovement[]

  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")

  @@unique([companyId, code])
  @@map("warehouses")
}

model WarehouseStock {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  warehouseId     String      @map("warehouse_id") @db.Uuid
  productId       String      @map("product_id") @db.Uuid
  quantity        Decimal     @default(0) @db.Decimal(12, 3)
  reservedQty     Decimal     @default(0) @map("reserved_qty") @db.Decimal(12, 3)  // Reservado en pedidos
  availableQty    Decimal     @default(0) @map("available_qty") @db.Decimal(12, 3) // Disponible = quantity - reservedQty

  warehouse       Warehouse   @relation(fields: [warehouseId], references: [id])
  product         Product     @relation(fields: [productId], references: [id])

  updatedAt       DateTime    @updatedAt @map("updated_at")

  @@unique([warehouseId, productId])
  @@map("warehouse_stocks")
}

enum StockMovementType {
  PURCHASE          // Compra
  SALE              // Venta
  ADJUSTMENT        // Ajuste de inventario
  TRANSFER_OUT      // Transferencia salida
  TRANSFER_IN       // Transferencia entrada
  RETURN            // Devolución
  PRODUCTION        // Producción
  LOSS              // Pérdida/merma
}

model StockMovement {
  id              String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId       String              @map("company_id") @db.Uuid
  warehouseId     String              @map("warehouse_id") @db.Uuid
  productId       String              @map("product_id") @db.Uuid

  type            StockMovementType
  quantity        Decimal             @db.Decimal(12, 3)  // + entrada, - salida

  // Referencia al documento origen
  referenceType   String?             @map("reference_type")  // 'sales_invoice', 'purchase_invoice', 'transfer', etc.
  referenceId     String?             @map("reference_id") @db.Uuid

  notes           String?
  date            DateTime            @default(now())

  company         Company             @relation(fields: [companyId], references: [id])
  warehouse       Warehouse           @relation(fields: [warehouseId], references: [id])
  product         Product             @relation(fields: [productId], references: [id])

  createdBy       String              @map("created_by")
  createdAt       DateTime            @default(now()) @map("created_at")

  @@map("stock_movements")
}
```

### 2.6 Facturación de Ventas (Sales)

```prisma
enum VoucherType {
  FACTURA_A         // Factura A
  FACTURA_B         // Factura B
  FACTURA_C         // Factura C
  NOTA_CREDITO_A    // Nota de Crédito A
  NOTA_CREDITO_B    // Nota de Crédito B
  NOTA_CREDITO_C    // Nota de Crédito C
  NOTA_DEBITO_A     // Nota de Débito A
  NOTA_DEBITO_B     // Nota de Débito B
  NOTA_DEBITO_C     // Nota de Débito C
  RECIBO            // Recibo
}

enum SalesInvoiceStatus {
  DRAFT             // Borrador
  CONFIRMED         // Confirmada
  PAID              // Cobrada
  PARTIAL_PAID      // Parcialmente cobrada
  CANCELLED         // Anulada
}

model SalesPointOfSale {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId       String    @map("company_id") @db.Uuid
  number          Int       // Número de punto de venta (0001, 0002, etc.)
  name            String
  isActive        Boolean   @default(true) @map("is_active")

  // Configuración AFIP
  afipEnabled     Boolean   @default(false) @map("afip_enabled")

  company         Company           @relation(fields: [companyId], references: [id])
  salesInvoices   SalesInvoice[]

  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  @@unique([companyId, number])
  @@map("sales_points_of_sale")
}

model SalesInvoice {
  id                String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId         String                @map("company_id") @db.Uuid
  customerId        String                @map("customer_id") @db.Uuid
  pointOfSaleId     String                @map("point_of_sale_id") @db.Uuid

  // Numeración
  voucherType       VoucherType           @map("voucher_type")
  number            Int                   // Número de comprobante
  fullNumber        String                @map("full_number")  // 0001-00000123

  // Fechas
  issueDate         DateTime              @map("issue_date")
  dueDate           DateTime?             @map("due_date")

  // AFIP
  cae               String?               // Código de Autorización Electrónico
  caeExpiryDate     DateTime?             @map("cae_expiry_date")

  // Importes
  subtotal          Decimal               @default(0) @db.Decimal(12, 2)  // Base imponible
  vatAmount         Decimal               @default(0) @map("vat_amount") @db.Decimal(12, 2)
  otherTaxes        Decimal               @default(0) @map("other_taxes") @db.Decimal(12, 2)
  total             Decimal               @default(0) @db.Decimal(12, 2)

  // Observaciones
  notes             String?
  internalNotes     String?               @map("internal_notes")

  // Estado
  status            SalesInvoiceStatus    @default(DRAFT)

  // Relación con contabilidad
  journalEntryId    String?               @map("journal_entry_id") @db.Uuid

  // Relaciones
  company           Company               @relation(fields: [companyId], references: [id])
  customer          Customer              @relation(fields: [customerId], references: [id])
  pointOfSale       SalesPointOfSale      @relation(fields: [pointOfSaleId], references: [id])
  lines             SalesInvoiceLine[]
  journalEntry      JournalEntry?         @relation(fields: [journalEntryId], references: [id])
  receipts          ReceiptItem[]

  createdBy         String                @map("created_by")
  createdAt         DateTime              @default(now()) @map("created_at")
  updatedAt         DateTime              @updatedAt @map("updated_at")

  @@unique([pointOfSaleId, voucherType, number])
  @@map("sales_invoices")
}

model SalesInvoiceLine {
  id              String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  invoiceId       String          @map("invoice_id") @db.Uuid
  productId       String          @map("product_id") @db.Uuid

  description     String
  quantity        Decimal         @db.Decimal(12, 3)
  unitPrice       Decimal         @map("unit_price") @db.Decimal(12, 2)

  // Impuestos
  vatRate         Decimal         @map("vat_rate") @db.Decimal(5, 2)
  vatAmount       Decimal         @map("vat_amount") @db.Decimal(12, 2)

  subtotal        Decimal         @db.Decimal(12, 2)  // quantity * unitPrice
  total           Decimal         @db.Decimal(12, 2)  // subtotal + vatAmount

  invoice         SalesInvoice    @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  product         Product         @relation(fields: [productId], references: [id])

  @@map("sales_invoice_lines")
}
```

### 2.7 Facturación de Compras (Purchases)

```prisma
enum PurchaseInvoiceStatus {
  DRAFT             // Borrador
  CONFIRMED         // Confirmada
  PAID              // Pagada
  PARTIAL_PAID      // Parcialmente pagada
  CANCELLED         // Anulada
}

model PurchaseInvoice {
  id                String                  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId         String                  @map("company_id") @db.Uuid
  supplierId        String                  @map("supplier_id") @db.Uuid

  // Datos del comprobante del proveedor
  voucherType       VoucherType             @map("voucher_type")
  pointOfSale       String                  @map("point_of_sale")  // Punto de venta del proveedor
  number            String                  // Número del comprobante
  fullNumber        String                  @map("full_number")    // 0001-00000123

  // Fechas
  issueDate         DateTime                @map("issue_date")
  dueDate           DateTime?               @map("due_date")

  // Validación AFIP
  cae               String?
  validated         Boolean                 @default(false)

  // Importes
  subtotal          Decimal                 @default(0) @db.Decimal(12, 2)
  vatAmount         Decimal                 @default(0) @map("vat_amount") @db.Decimal(12, 2)
  otherTaxes        Decimal                 @default(0) @map("other_taxes") @db.Decimal(12, 2)
  total             Decimal                 @default(0) @db.Decimal(12, 2)

  // Observaciones
  notes             String?

  // Estado
  status            PurchaseInvoiceStatus   @default(DRAFT)

  // Relación con contabilidad
  journalEntryId    String?                 @map("journal_entry_id") @db.Uuid

  // Relaciones
  company           Company                 @relation(fields: [companyId], references: [id])
  supplier          Supplier                @relation(fields: [supplierId], references: [id])
  lines             PurchaseInvoiceLine[]
  journalEntry      JournalEntry?           @relation(fields: [journalEntryId], references: [id])
  paymentOrders     PaymentOrderItem[]

  createdBy         String                  @map("created_by")
  createdAt         DateTime                @default(now()) @map("created_at")
  updatedAt         DateTime                @updatedAt @map("updated_at")

  @@unique([companyId, supplierId, fullNumber])
  @@map("purchase_invoices")
}

model PurchaseInvoiceLine {
  id              String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  invoiceId       String            @map("invoice_id") @db.Uuid
  productId       String?           @map("product_id") @db.Uuid  // Opcional si es un gasto no inventariable

  description     String
  quantity        Decimal           @db.Decimal(12, 3)
  unitCost        Decimal           @map("unit_cost") @db.Decimal(12, 2)

  // Impuestos
  vatRate         Decimal           @map("vat_rate") @db.Decimal(5, 2)
  vatAmount       Decimal           @map("vat_amount") @db.Decimal(12, 2)

  subtotal        Decimal           @db.Decimal(12, 2)
  total           Decimal           @db.Decimal(12, 2)

  invoice         PurchaseInvoice   @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  product         Product?          @relation(fields: [productId], references: [id])

  @@map("purchase_invoice_lines")
}
```

### 2.8 Tesorería - Cajas (Cash Registers)

```prisma
enum CashRegisterStatus {
  OPEN
  CLOSED
}

model CashRegister {
  id          String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId   String              @map("company_id") @db.Uuid
  code        String
  name        String
  description String?
  isActive    Boolean             @default(true) @map("is_active")

  // Relación con contabilidad
  accountId   String?             @map("account_id") @db.Uuid

  company     Company             @relation(fields: [companyId], references: [id])
  account     Account?            @relation(fields: [accountId], references: [id])
  sessions    CashRegisterSession[]
  movements   CashMovement[]

  createdAt   DateTime            @default(now()) @map("created_at")
  updatedAt   DateTime            @updatedAt @map("updated_at")

  @@unique([companyId, code])
  @@map("cash_registers")
}

model CashRegisterSession {
  id              String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  cashRegisterId  String              @map("cash_register_id") @db.Uuid

  openingDate     DateTime            @map("opening_date")
  closingDate     DateTime?           @map("closing_date")

  openingBalance  Decimal             @map("opening_balance") @db.Decimal(12, 2)
  closingBalance  Decimal?            @map("closing_balance") @db.Decimal(12, 2)
  expectedBalance Decimal?            @map("expected_balance") @db.Decimal(12, 2)
  difference      Decimal?            @db.Decimal(12, 2)

  status          CashRegisterStatus  @default(OPEN)
  notes           String?

  cashRegister    CashRegister        @relation(fields: [cashRegisterId], references: [id])
  movements       CashMovement[]

  openedBy        String              @map("opened_by")
  closedBy        String?             @map("closed_by")
  createdAt       DateTime            @default(now()) @map("created_at")
  updatedAt       DateTime            @updatedAt @map("updated_at")

  @@map("cash_register_sessions")
}

enum CashMovementType {
  INCOME            // Ingreso
  EXPENSE           // Egreso
  OPENING           // Apertura
  CLOSING           // Cierre
}

model CashMovement {
  id              String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  cashRegisterId  String                @map("cash_register_id") @db.Uuid
  sessionId       String                @map("session_id") @db.Uuid

  type            CashMovementType
  amount          Decimal               @db.Decimal(12, 2)
  date            DateTime              @default(now())
  description     String

  // Referencia
  referenceType   String?               @map("reference_type")  // 'receipt', 'payment', etc.
  referenceId     String?               @map("reference_id") @db.Uuid

  cashRegister    CashRegister          @relation(fields: [cashRegisterId], references: [id])
  session         CashRegisterSession   @relation(fields: [sessionId], references: [id])

  createdBy       String                @map("created_by")
  createdAt       DateTime              @default(now()) @map("created_at")

  @@map("cash_movements")
}
```

### 2.9 Tesorería - Bancos (Banks)

```prisma
enum BankAccountType {
  CHECKING          // Cuenta corriente
  SAVINGS           // Caja de ahorro
  CREDIT            // Cuenta de crédito
}

enum BankAccountStatus {
  ACTIVE
  INACTIVE
  CLOSED
}

model BankAccount {
  id              String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId       String              @map("company_id") @db.Uuid

  bankName        String              @map("bank_name")
  accountNumber   String              @map("account_number")
  accountType     BankAccountType     @map("account_type")
  cbu             String?             // Clave Bancaria Uniforme
  alias           String?             // Alias para transferencias

  currency        String              @default("ARS")
  balance         Decimal             @default(0) @db.Decimal(12, 2)

  status          BankAccountStatus   @default(ACTIVE)

  // Relación con contabilidad
  accountId       String?             @map("account_id") @db.Uuid

  company         Company             @relation(fields: [companyId], references: [id])
  account         Account?            @relation(fields: [accountId], references: [id])
  movements       BankMovement[]

  createdAt       DateTime            @default(now()) @map("created_at")
  updatedAt       DateTime            @updatedAt @map("updated_at")

  @@unique([companyId, accountNumber])
  @@map("bank_accounts")
}

enum BankMovementType {
  DEPOSIT           // Depósito
  WITHDRAWAL        // Extracción
  TRANSFER_IN       // Transferencia recibida
  TRANSFER_OUT      // Transferencia enviada
  CHECK             // Cheque
  DEBIT             // Débito automático
  FEE               // Comisión bancaria
  INTEREST          // Interés
}

model BankMovement {
  id              String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  bankAccountId   String            @map("bank_account_id") @db.Uuid

  type            BankMovementType
  amount          Decimal           @db.Decimal(12, 2)
  date            DateTime
  description     String

  // Referencia al extracto bancario
  statementNumber String?           @map("statement_number")

  // Referencia a documento origen
  referenceType   String?           @map("reference_type")
  referenceId     String?           @map("reference_id") @db.Uuid

  // Conciliación
  reconciled      Boolean           @default(false)
  reconciledAt    DateTime?         @map("reconciled_at")

  bankAccount     BankAccount       @relation(fields: [bankAccountId], references: [id])

  createdBy       String            @map("created_by")
  createdAt       DateTime          @default(now()) @map("created_at")

  @@map("bank_movements")
}
```

### 2.10 Cobros y Pagos (Receipts & Payments)

```prisma
enum PaymentMethod {
  CASH              // Efectivo
  CHECK             // Cheque
  TRANSFER          // Transferencia
  DEBIT_CARD        // Tarjeta de débito
  CREDIT_CARD       // Tarjeta de crédito
  ACCOUNT           // Cuenta corriente
}

enum ReceiptStatus {
  DRAFT
  CONFIRMED
  CANCELLED
}

model Receipt {
  id              String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId       String          @map("company_id") @db.Uuid
  customerId      String          @map("customer_id") @db.Uuid

  number          Int
  fullNumber      String          @map("full_number")  // R-0001-00000123
  date            DateTime

  totalAmount     Decimal         @map("total_amount") @db.Decimal(12, 2)
  notes           String?

  status          ReceiptStatus   @default(DRAFT)

  // Relación con contabilidad
  journalEntryId  String?         @map("journal_entry_id") @db.Uuid

  company         Company         @relation(fields: [companyId], references: [id])
  customer        Customer        @relation(fields: [customerId], references: [id])
  items           ReceiptItem[]
  payments        ReceiptPayment[]
  journalEntry    JournalEntry?   @relation(fields: [journalEntryId], references: [id])

  createdBy       String          @map("created_by")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  @@unique([companyId, number])
  @@map("receipts")
}

model ReceiptItem {
  id              String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  receiptId       String        @map("receipt_id") @db.Uuid
  invoiceId       String        @map("invoice_id") @db.Uuid
  amount          Decimal       @db.Decimal(12, 2)

  receipt         Receipt       @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  invoice         SalesInvoice  @relation(fields: [invoiceId], references: [id])

  @@map("receipt_items")
}

model ReceiptPayment {
  id              String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  receiptId       String          @map("receipt_id") @db.Uuid

  paymentMethod   PaymentMethod   @map("payment_method")
  amount          Decimal         @db.Decimal(12, 2)

  // Datos específicos según método
  cashRegisterId  String?         @map("cash_register_id") @db.Uuid
  bankAccountId   String?         @map("bank_account_id") @db.Uuid
  checkNumber     String?         @map("check_number")
  cardLast4       String?         @map("card_last4")

  receipt         Receipt         @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  cashRegister    CashRegister?   @relation(fields: [cashRegisterId], references: [id])
  bankAccount     BankAccount?    @relation(fields: [bankAccountId], references: [id])

  @@map("receipt_payments")
}

enum PaymentOrderStatus {
  DRAFT
  APPROVED
  PAID
  CANCELLED
}

model PaymentOrder {
  id              String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId       String              @map("company_id") @db.Uuid
  supplierId      String              @map("supplier_id") @db.Uuid

  number          Int
  fullNumber      String              @map("full_number")  // OP-0001-00000123
  date            DateTime
  paymentDate     DateTime?           @map("payment_date")

  totalAmount     Decimal             @map("total_amount") @db.Decimal(12, 2)
  notes           String?

  status          PaymentOrderStatus  @default(DRAFT)

  // Método de pago
  paymentMethod   PaymentMethod       @map("payment_method")
  cashRegisterId  String?             @map("cash_register_id") @db.Uuid
  bankAccountId   String?             @map("bank_account_id") @db.Uuid

  // Relación con contabilidad
  journalEntryId  String?             @map("journal_entry_id") @db.Uuid

  company         Company             @relation(fields: [companyId], references: [id])
  supplier        Supplier            @relation(fields: [supplierId], references: [id])
  items           PaymentOrderItem[]
  cashRegister    CashRegister?       @relation(fields: [cashRegisterId], references: [id])
  bankAccount     BankAccount?        @relation(fields: [bankAccountId], references: [id])
  journalEntry    JournalEntry?       @relation(fields: [journalEntryId], references: [id])

  createdBy       String              @map("created_by")
  approvedBy      String?             @map("approved_by")
  paidBy          String?             @map("paid_by")
  createdAt       DateTime            @default(now()) @map("created_at")
  updatedAt       DateTime            @updatedAt @map("updated_at")

  @@unique([companyId, number])
  @@map("payment_orders")
}

model PaymentOrderItem {
  id              String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  paymentOrderId  String            @map("payment_order_id") @db.Uuid
  invoiceId       String            @map("invoice_id") @db.Uuid
  amount          Decimal           @db.Decimal(12, 2)

  paymentOrder    PaymentOrder      @relation(fields: [paymentOrderId], references: [id], onDelete: Cascade)
  invoice         PurchaseInvoice   @relation(fields: [invoiceId], references: [id])

  @@map("payment_order_items")
}
```

### 2.11 Agregar relaciones a JournalEntry (Accounting)

```prisma
// En el modelo JournalEntry existente, AGREGAR:
model JournalEntry {
  // ... campos existentes ...

  // AGREGAR relaciones con módulo comercial:
  salesInvoices     SalesInvoice[]
  purchaseInvoices  PurchaseInvoice[]
  receipts          Receipt[]
  paymentOrders     PaymentOrder[]
}
```

---

## 3. Fases de Implementación

### Fase Comercial 1: Catálogos Base (10-12 horas)

**Objetivo**: Crear las entidades maestras necesarias para el resto del módulo

#### 3.1.1 Proveedores (4h)
- Modelo Supplier en Prisma
- CRUD completo con validaciones
- Búsqueda y filtros
- Estados (activo/inactivo/bloqueado)
- Validación de CUIT duplicado
- Importación desde Excel (opcional)

**Archivos**:
- `src/modules/commercial/suppliers/`
  - `features/list/` - Listado con DataTable
  - `features/create/` - Formulario de creación
  - `features/edit/` - Formulario de edición
  - `features/detail/` - Vista de detalle
  - `shared/types.ts` - Tipos e interfaces
  - `shared/validators.ts` - Esquemas Zod

#### 3.1.2 Productos y Categorías (5h)
- Modelo Product y ProductCategory
- CRUD de categorías con jerarquía
- CRUD de productos con todos los campos
- Búsqueda por código, nombre, categoría
- Importación masiva de productos (opcional)
- Gestión de unidades de medida

**Archivos**:
- `src/modules/commercial/products/`
  - `features/categories/` - Gestión de categorías
  - `features/list/` - Listado de productos
  - `features/create/` - Crear producto
  - `features/edit/` - Editar producto
  - `features/detail/` - Detalle de producto

#### 3.1.3 Listas de Precios (2h)
- Modelo PriceList y PriceListItem
- CRUD de listas de precios
- Asignación de precios por producto
- Lista predeterminada
- Cálculo automático de precio con IVA

**Archivos**:
- `src/modules/commercial/products/features/price-lists/`

#### 3.1.4 Mejoras en Customers (1h)
- Agregar campos fiscales faltantes
- Condición frente a IVA
- Plazo de pago
- Límite de crédito
- Migración de base de datos

---

### Fase Comercial 2: Almacenes y Stock (12-15 horas)

**Objetivo**: Controlar inventario en múltiples ubicaciones

#### 3.2.1 Almacenes (3h)
- Modelo Warehouse
- CRUD de almacenes
- Tipos de almacén
- Vista de stock por almacén

**Archivos**:
- `src/modules/commercial/warehouses/`
  - `features/list/`
  - `features/create/`
  - `features/edit/`

#### 3.2.2 Control de Stock (5h)
- Modelo WarehouseStock
- Función para obtener stock disponible por producto/almacén
- Alertas de stock mínimo
- Reportes de stock:
  - Stock actual por almacén
  - Productos bajo stock mínimo
  - Valorización de inventario

**Archivos**:
- `src/modules/commercial/warehouses/features/stock/`
  - `StockDashboard.tsx` - Dashboard de stock
  - `StockByWarehouse.tsx` - Stock por almacén
  - `LowStockAlert.tsx` - Alertas de bajo stock

#### 3.2.3 Movimientos de Stock (4h)
- Modelo StockMovement
- Funciones de utilidad:
  - `adjustStock()` - Ajuste manual
  - `transferStock()` - Transferencia entre almacenes
  - `registerStockMovement()` - Registro genérico
- Historial de movimientos
- Reportes de movimientos

**Archivos**:
- `src/modules/commercial/warehouses/features/movements/`
  - `MovementsList.tsx` - Historial
  - `StockAdjustment.tsx` - Ajustes
  - `StockTransfer.tsx` - Transferencias
- `src/modules/commercial/warehouses/shared/utils/stock.ts`

---

### Fase Comercial 3: Facturación de Ventas (15-18 horas)

**Objetivo**: Emitir facturas de venta con integración a stock

#### 3.3.1 Puntos de Venta (2h)
- Modelo SalesPointOfSale
- CRUD de puntos de venta
- Configuración de numeración

**Archivos**:
- `src/modules/commercial/sales/features/points-of-sale/`

#### 3.3.2 Facturación (10h)
- Modelos SalesInvoice y SalesInvoiceLine
- Formulario de creación de factura:
  - Selección de cliente
  - Tipo de comprobante automático según condición IVA
  - Agregar líneas de productos
  - Cálculo automático de IVA
  - Totales en tiempo real
- Estados: borrador → confirmada → cobrada
- Confirmación de factura:
  - Validar stock disponible
  - Descontar stock automáticamente
  - Generar movimiento de stock
  - Cambiar estado a CONFIRMED
- Anulación de factura:
  - Devolver stock
  - Cambiar estado a CANCELLED
- Listado con filtros (cliente, fecha, estado, tipo)
- Vista de detalle con opción de PDF

**Archivos**:
- `src/modules/commercial/sales/features/invoices/`
  - `InvoicesList.tsx`
  - `CreateInvoice.tsx` - Formulario principal
  - `InvoiceDetail.tsx`
  - `_InvoiceForm.tsx` - Componente de formulario
  - `_InvoiceLineItem.tsx` - Línea de factura
  - `actions.server.ts`

#### 3.3.3 Generación de PDF (3h)
- Template de factura según tipo (A/B/C)
- Datos de empresa y cliente
- Detalle de productos
- Totales e IVA discriminado
- Código QR (para AFIP)

**Archivos**:
- `src/modules/commercial/sales/shared/utils/pdf.ts`
- Templates en `src/modules/commercial/sales/shared/templates/`

#### 3.3.4 Reportes de Ventas (3h)
- Ventas por período
- Ventas por cliente
- Ventas por producto
- IVA Ventas (Libro IVA)

**Archivos**:
- `src/modules/commercial/sales/features/reports/`

---

### Fase Comercial 4: Facturación de Compras (8-10 horas)

**Objetivo**: Registrar facturas de proveedores

#### 3.4.1 Registro de Facturas (6h)
- Modelos PurchaseInvoice y PurchaseInvoiceLine
- Formulario de carga:
  - Datos del comprobante del proveedor
  - Líneas de productos/gastos
  - Cálculo de IVA
- Confirmación:
  - Incrementar stock automáticamente
  - Generar movimiento de stock
- Listado y búsqueda
- Vista de detalle

**Archivos**:
- `src/modules/commercial/purchases/features/invoices/`
  - `InvoicesList.tsx`
  - `CreateInvoice.tsx`
  - `InvoiceDetail.tsx`
  - `actions.server.ts`

#### 3.4.2 Validación con AFIP (2h - opcional)
- Consulta de validez de comprobante
- Verificación de CUIT del proveedor

#### 3.4.3 Reportes de Compras (2h)
- Compras por período
- Compras por proveedor
- IVA Compras (Libro IVA)

**Archivos**:
- `src/modules/commercial/purchases/features/reports/`

---

### Fase Comercial 5: Tesorería (12-15 horas)

**Objetivo**: Gestionar cobros, pagos, cajas y bancos

#### 3.5.1 Cajas (5h)
- Modelos CashRegister, CashRegisterSession, CashMovement
- Apertura de caja:
  - Saldo inicial
  - Usuario responsable
- Movimientos de efectivo:
  - Ingresos
  - Egresos
  - Referencia a recibos/pagos
- Cierre de caja:
  - Arqueo
  - Diferencias
  - Confirmación
- Listado de sesiones
- Reportes de caja

**Archivos**:
- `src/modules/commercial/treasury/features/cash-registers/`
  - `RegistersList.tsx`
  - `OpenSession.tsx`
  - `CloseSession.tsx`
  - `SessionDetail.tsx`
  - `CashMovements.tsx`

#### 3.5.2 Bancos (4h)
- Modelos BankAccount y BankMovement
- CRUD de cuentas bancarias
- Registro de movimientos bancarios
- Conciliación bancaria (básica)
- Reportes de banco

**Archivos**:
- `src/modules/commercial/treasury/features/bank-accounts/`
  - `AccountsList.tsx`
  - `CreateAccount.tsx`
  - `MovementsList.tsx`
  - `Reconciliation.tsx`

#### 3.5.3 Recibos de Cobro (4h)
- Modelos Receipt, ReceiptItem, ReceiptPayment
- Formulario de recibo:
  - Selección de cliente
  - Facturas pendientes
  - Imputación a facturas
  - Múltiples formas de pago
  - Distribución en caja/banco
- Confirmación:
  - Actualizar estado de facturas (PAID/PARTIAL_PAID)
  - Registrar movimiento en caja/banco
- Impresión de recibo (PDF)

**Archivos**:
- `src/modules/commercial/treasury/features/receipts/`
  - `ReceiptsList.tsx`
  - `CreateReceipt.tsx`
  - `ReceiptDetail.tsx`
  - `actions.server.ts`

#### 3.5.4 Órdenes de Pago (4h)
- Modelos PaymentOrder y PaymentOrderItem
- Formulario de orden de pago:
  - Selección de proveedor
  - Facturas pendientes
  - Imputación
  - Forma de pago
- Workflow: borrador → aprobada → pagada
- Confirmación de pago:
  - Actualizar estado de facturas
  - Registrar movimiento en caja/banco
- Listado y reportes

**Archivos**:
- `src/modules/commercial/treasury/features/payment-orders/`
  - `PaymentOrdersList.tsx`
  - `CreatePaymentOrder.tsx`
  - `PaymentOrderDetail.tsx`
  - `actions.server.ts`

---

## 4. Validaciones y Reglas de Negocio

### 4.1 Productos
- Código único por empresa
- Precio de venta >= precio de costo (warning)
- Stock mínimo >= 0
- Si trackStock = false, no controlar existencia

### 4.2 Facturas de Venta
- Cliente con condición IVA válida
- Tipo de comprobante según condición cliente:
  - RI → Factura A
  - Monotributista/Exento → Factura B
  - Consumidor Final → Factura B o C
- Validar stock disponible antes de confirmar
- Total debe ser > 0
- Al menos una línea de producto
- Numeración correlativa por punto de venta y tipo

### 4.3 Facturas de Compra
- CUIT del proveedor válido
- Comprobante no duplicado (mismo proveedor + número)
- Validar formato de punto de venta y número

### 4.4 Stock
- No permitir stock negativo (salvo configuración especial)
- Transferencias: validar que origen tenga stock suficiente
- Ajustes: requerir autorización si es un ajuste grande

### 4.5 Tesorería
- Caja: no cerrar sesión con movimientos sin conciliar
- Recibos: total imputado = total del recibo
- Pagos: total imputado = total de la orden
- No permitir movimientos en caja cerrada
- Validar saldo disponible en banco antes de pago

---

## 5. Integraciones

### 5.1 Con Módulo de Contabilidad (Fase 4.1 del plan de Contabilidad)

Esta integración se implementará DESPUÉS de completar todas las fases del módulo comercial.

**Asientos automáticos a generar**:

1. **Factura de Venta** (al confirmar):
   ```
   Debe: Cuentas por Cobrar        $1,210
   Haber: Ventas                   $1,000
   Haber: IVA Débito Fiscal          $210
   ```

2. **Factura de Compra** (al confirmar):
   ```
   Debe: Compras                   $1,000
   Debe: IVA Crédito Fiscal          $210
   Haber: Cuentas por Pagar        $1,210
   ```

3. **Recibo de Cobro** (al confirmar):
   ```
   Debe: Caja / Banco              $1,210
   Haber: Cuentas por Cobrar       $1,210
   ```

4. **Orden de Pago** (al pagar):
   ```
   Debe: Cuentas por Pagar         $1,210
   Haber: Caja / Banco             $1,210
   ```

**Configuración necesaria**:
- Agregar sección "Cuentas Predeterminadas" en `src/modules/accounting/features/settings/`
- Mapear cuentas contables para cada tipo de operación
- Opción de generación automática vs manual
- Vista previa del asiento antes de confirmar documento

**Archivos a crear**:
- `src/modules/accounting/features/integrations/commercial/`
  - `generateSalesInvoiceEntry.ts`
  - `generatePurchaseInvoiceEntry.ts`
  - `generateReceiptEntry.ts`
  - `generatePaymentEntry.ts`
  - `actions.server.ts`

### 5.2 Con Módulo de Documentos (Opcional)
- Adjuntar archivos a facturas (escaneados)
- Adjuntar remitos
- Adjuntar comprobantes de pago

### 5.3 Con AFIP (Futuro)
- Facturación electrónica (CAE)
- Validación de comprobantes de compra
- Libro IVA digital

---

## 6. Consideraciones Técnicas

### 6.1 Performance
- Indexar campos críticos:
  - `code`, `taxId` en Supplier y Customer
  - `code`, `barcode` en Product
  - `fullNumber` en facturas
  - `date` en todos los documentos
- Paginar listados grandes
- Cachear stock actual (invalidar al confirmar documentos)

### 6.2 Seguridad
- Permisos granulares por módulo:
  - `commercial.products.view/create/edit/delete`
  - `commercial.sales.view/create/confirm/cancel`
  - `commercial.purchases.view/create/confirm`
  - `commercial.treasury.view/create/approve/pay`
- Auditoría de cambios críticos (confirmaciones, anulaciones)
- Validar permisos antes de modificar stock

### 6.3 UI/UX
- Formularios con autocompletado:
  - Búsqueda de clientes/proveedores por nombre o CUIT
  - Búsqueda de productos por código o nombre
- Cálculos en tiempo real:
  - Subtotales, IVA, totales
  - Stock disponible al seleccionar producto
- Feedback visual:
  - Confirmaciones antes de acciones destructivas
  - Indicadores de estado (draft/confirmed/paid)
  - Alertas de stock bajo

### 6.4 Reportes y Exportaciones
- Todos los listados exportables a Excel
- Reportes clave:
  - Ventas por período/cliente/producto
  - Compras por período/proveedor
  - Stock valorizado
  - Libro IVA Ventas/Compras
  - Cuentas corrientes de clientes/proveedores
  - Flujo de caja

---

## 7. Resumen de Fases

| Fase | Módulos | Tiempo Estimado | Prioridad |
|------|---------|-----------------|-----------|
| 1 | Proveedores, Productos, Listas de Precios, Mejoras Customers | 10-12h | Alta |
| 2 | Almacenes y Stock | 12-15h | Alta |
| 3 | Facturación de Ventas | 15-18h | Crítica |
| 4 | Facturación de Compras | 8-10h | Alta |
| 5 | Tesorería (Cajas, Bancos, Cobros, Pagos) | 12-15h | Alta |
| **TOTAL** | | **57-70 horas** | |

**Después de completar todas las fases**, volver al plan de Contabilidad para implementar la **Fase 4.1: Integración con Documentos Comerciales** (8-10h adicionales).

---

## 8. Dependencias entre Fases

```
Fase 1 (Catálogos)
    ↓
Fase 2 (Stock) ← depende de Productos
    ↓
Fase 3 (Ventas) ← depende de Productos, Stock, Customers
    ↓
Fase 4 (Compras) ← depende de Productos, Stock, Proveedores
    ↓
Fase 5 (Tesorería) ← depende de Ventas, Compras
    ↓
Integración con Contabilidad ← depende de todo lo anterior
```

---

## 9. Próximos Pasos

1. ✅ **Revisar y aprobar este plan**
2. ⏳ **Comenzar con Fase 1: Catálogos Base**
   - Crear modelos en Prisma
   - Ejecutar migraciones
   - Implementar CRUD de Proveedores
   - Implementar CRUD de Productos
   - Implementar Listas de Precios
3. ⏳ Continuar con Fase 2, 3, 4, 5 en orden
4. ⏳ Finalmente, integrar con Contabilidad (Fase 4.1 del plan de Contabilidad)

---

## 10. Notas Importantes

- **NO comenzar con integraciones a Contabilidad** hasta tener todo el módulo comercial funcionando
- Validar cada fase con datos de prueba antes de avanzar
- Seguir reglas de CLAUDE.md (logger, moment.js, tipos inferidos, etc.)
- Usar Server Components para listados, Client Components para formularios
- Todas las Server Actions en `actions.server.ts` dentro de cada feature
- Validaciones con Zod en `validators.ts`

---

## 11. Ajustes

- Revisar Clientes, no esta el campo de Condición frente al IVA. (Resuelto)
- Revisar la lógica de las facturas de venta, en /docs/rules-system.md podes encontrar la lógica de que facturas puede emitir una empresa dependiendo de su condición frente al IVA. (Resuelto)
- No encontré en la UI donde puede cargar movimientos de entrada/salida/entre almacenes de los productos, creo que faltan crear los formularios. (Resuelto)
 

**Listo para comenzar la implementación del Módulo Comercial 🚀**
