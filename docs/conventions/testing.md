# Testing E2E (Cypress)

---

## Estructura

```
cypress/
├── e2e/
│   ├── auth/              # Autenticacion
│   ├── dashboard/         # Dashboard
│   ├── commercial/        # Modulo comercial
│   │   └── treasury/      # Tesoreria
│   ├── accounting/        # Contabilidad
│   ├── company/           # CRUD empresa
│   ├── company-config/    # Catalogos
│   ├── company-general/   # Usuarios/roles
│   ├── documents/         # Documentos
│   ├── employees/         # Empleados
│   └── equipment/         # Equipamiento
├── fixtures/              # Datos de test (JSON)
├── support/
│   ├── commands.ts        # Custom commands
│   ├── db.ts              # Funciones de limpieza BD
│   └── e2e.ts             # Setup global (Clerk)
└── cypress.config.ts      # Config + DB tasks
```

---

## Autenticacion en Tests

Todos los tests usan Clerk en modo testing:

```typescript
import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Mi Test', () => {
  beforeEach(() => {
    setupClerkTestingToken();
    cy.visit('/');
    cy.window().should((win) => {
      expect(win).to.have.property('Clerk');
      expect(win.Clerk.loaded).to.eq(true);
    });
    cy.clerkSignIn({
      strategy: 'email_code',
      identifier: Cypress.env('test_user'),
    });
  });
});
```

**Importante:** El email de test debe tener formato `+clerk_test` (ej: `user+clerk_test@example.com`). Se configura en `cypress.config.ts` o `cypress.env.json`.

---

## Custom Commands

```typescript
cy.waitForPageLoad()                    // Esperar carga (sin spinners)
cy.fillField('Label', 'valor')         // Llenar campo por label
cy.submitForm()                         // Submit formulario
cy.selectOption('Label', 'opcion')     // Seleccionar en shadcn Select
cy.openModal('Texto Boton')            // Click boton → esperar dialog
cy.closeModal()                         // Cerrar dialog visible
cy.checkToast('mensaje')               // Verificar Sonner toast
```

---

## Selectores Preferidos

En orden de preferencia:

1. `[data-testid="..."]` — DataTable tiene `data-testid="data-table"` y `data-testid="search-input"`
2. `cy.contains('button', 'Texto')` — Botones por texto
3. `[role="dialog"]` — Modales/dialogs
4. `[role="combobox"]` — Selects de shadcn
5. `[data-sonner-toast]` — Notificaciones toast
6. `table tbody tr` — Filas de tabla

---

## Datos de Test

### Unicidad con Timestamps

```typescript
const ts = Date.now();
cy.fillField('Nombre', `Test Product ${ts}`);
```

### Fixtures

Datos predefinidos en `cypress/fixtures/`:
- `product.json` — Productos de test
- `supplier.json` — Proveedores de test
- `invoice.json` — Facturas de test

### Resiliencia

Verificar datos antes de interactuar:

```typescript
cy.get('body').then(($body) => {
  if ($body.find('table tbody tr').length > 0) {
    cy.get('table tbody tr').first().click();
  } else {
    cy.log('No data found, skipping');
  }
});
```

---

## Limpieza de Datos

Funciones de limpieza en `cypress/support/db.ts`, registradas como tasks en `cypress.config.ts`:

```typescript
after(() => {
  cy.task('cleanupTestProducts', companyId);
});
```

Tasks disponibles: `cleanupTestProducts`, `cleanupTestSuppliers`, `cleanupTestSalesInvoices`, `cleanupTestPurchaseInvoices`, `cleanupTestBankAccounts`, `cleanupTestExpenses`, `cleanupTestWarehouses`.

---

## Ejecucion

```bash
# UI interactiva
npm run cy:open

# Todos los tests (headless)
npm run cy:run

# Por modulo
npm run cy:run:dashboard
npm run cy:run:commercial
npm run cy:run:accounting
npm run cy:run:company-general

# Servidor + tests
npm run test:e2e
```

---

## Cuando Actualizar Tests

| Tipo de cambio | Accion requerida |
|----------------|-----------------|
| Nueva pagina/feature | Crear spec nuevo |
| Nuevo formulario | Test de campos, validacion, submit |
| Nueva tabla | Test de visibilidad, busqueda, paginacion |
| Cambio de texto/label | Actualizar assertions |
| Nuevo boton/accion | Test de click + resultado |
| Cambio en flujo | Actualizar secuencia del test |
| Nuevo filtro | Test de aplicar filtro |
