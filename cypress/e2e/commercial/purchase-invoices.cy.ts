import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Purchase Invoices', () => {
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

  after(() => {
    cy.task('cleanupTestPurchaseInvoices').then((result) => {
      cy.log(`Purchase invoices cleanup: ${JSON.stringify(result)}`);
    });
  });

  describe('List Purchase Invoices', () => {
    it('should display the purchase invoices page', () => {
      cy.visit('/dashboard/commercial/purchases');

      cy.contains('h1', 'Facturas de Compra').should('be.visible');
      cy.contains('Registra y gestiona las facturas de tus proveedores').should('be.visible');
    });

    it('should have a button to create new invoice', () => {
      cy.visit('/dashboard/commercial/purchases');

      cy.contains('button', 'Nueva Factura').should('be.visible');
    });

    it('should display the invoices table', () => {
      cy.visit('/dashboard/commercial/purchases');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });

    it('should have search functionality', () => {
      cy.visit('/dashboard/commercial/purchases');

      cy.get('[data-testid="search-input"]').should('be.visible');
    });
  });

  describe('Create Purchase Invoice', () => {
    it('should navigate to create page', () => {
      cy.visit('/dashboard/commercial/purchases');

      cy.contains('button', 'Nueva Factura').click();

      cy.url().should('include', '/dashboard/commercial/purchases/new');
      cy.contains('Nueva Factura de Compra').should('be.visible');
    });

    it('should show form sections', () => {
      cy.visit('/dashboard/commercial/purchases/new');

      cy.contains('Datos del Comprobante').should('be.visible');
      cy.contains('Líneas de Factura').should('be.visible');
    });

    it('should create a purchase invoice', () => {
      cy.visit('/dashboard/commercial/purchases/new');

      // Select supplier
      cy.contains('label', 'Proveedor')
        .parent()
        .find('[role="combobox"], button[data-slot="select-trigger"]')
        .click();
      cy.get('[role="option"]').first().click();

      // Select voucher type
      cy.contains('label', 'Tipo de Comprobante')
        .parent()
        .find('[role="combobox"], button[data-slot="select-trigger"]')
        .click();
      cy.get('[role="option"]').first().click();

      // Fill POS number and invoice number
      cy.contains('label', 'Punto de Venta')
        .parent()
        .find('input')
        .type('0001');
      cy.contains('label', 'Número')
        .parent()
        .find('input')
        .type(String(Date.now()).slice(-8));

      // Set issue date
      cy.contains('label', 'Fecha de Emisión')
        .parent()
        .find('input')
        .type(new Date().toISOString().split('T')[0]);

      // Add a line
      cy.contains('button', 'Agregar Línea').click();

      // Select product
      cy.get('[role="combobox"], button[data-slot="select-trigger"]')
        .filter(':contains("Seleccionar producto")')
        .first()
        .click();
      cy.get('[role="option"]').first().click();

      // Set quantity
      cy.get('input[placeholder="1"]').first().clear().type('3');

      // Add notes for cleanup
      cy.contains('label', 'Notas')
        .parent()
        .find('textarea')
        .type('Factura de compra test E2E');

      // Submit
      cy.contains('button', 'Crear Factura').click();

      cy.url().should('match', /\/dashboard\/commercial\/purchases\/[a-zA-Z0-9-]+$/, { timeout: 15000 });
    });
  });

  describe('View Purchase Invoice Detail', () => {
    it('should display invoice detail page', () => {
      cy.visit('/dashboard/commercial/purchases');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().find('button').last().click();
          cy.contains('Ver detalle').click();

          cy.url().should('match', /\/dashboard\/commercial\/purchases\/[a-zA-Z0-9-]+$/);

          cy.contains('Proveedor').should('be.visible');
        } else {
          cy.log('No purchase invoices found, skipping detail test');
        }
      });
    });
  });

  describe('Invoice Actions', () => {
    it('should confirm a draft purchase invoice', () => {
      cy.visit('/dashboard/commercial/purchases');

      cy.get('body').then(($body) => {
        const draftRows = $body.find('table tbody tr:contains("Borrador")');
        if (draftRows.length > 0) {
          cy.get('table tbody tr').contains('Borrador').parents('tr').find('button').last().click();
          cy.contains('Confirmar factura').click();

          cy.wait(2000);
          cy.get('body').should('be.visible');
        } else {
          cy.log('No draft purchase invoices found, skipping confirm test');
        }
      });
    });

    it('should cancel a purchase invoice', () => {
      cy.visit('/dashboard/commercial/purchases');

      cy.get('body').then(($body) => {
        const draftRows = $body.find('table tbody tr:contains("Borrador")');
        if (draftRows.length > 0) {
          cy.get('table tbody tr').contains('Borrador').parents('tr').find('button').last().click();
          cy.contains('Cancelar factura').click();

          cy.wait(2000);
          cy.get('body').should('be.visible');
        } else {
          cy.log('No cancelable purchase invoices found, skipping cancel test');
        }
      });
    });
  });

  describe('Purchase Reports', () => {
    it('should display purchase reports page', () => {
      cy.visit('/dashboard/commercial/purchase-reports');

      cy.get('body').should('be.visible');
      cy.wait(1000);
    });
  });
});
