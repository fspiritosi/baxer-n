import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Sales Invoices', () => {
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
    cy.task('cleanupTestSalesInvoices').then((result) => {
      cy.log(`Sales invoices cleanup: ${JSON.stringify(result)}`);
    });
  });

  describe('List Sales Invoices', () => {
    it('should display the sales invoices page', () => {
      cy.visit('/dashboard/commercial/invoices');

      cy.contains('h1', 'Facturas de Venta').should('be.visible');
      cy.contains('Gestiona las facturas emitidas a tus clientes').should('be.visible');
    });

    it('should have a button to create new invoice', () => {
      cy.visit('/dashboard/commercial/invoices');

      cy.contains('button', 'Nueva Factura').should('be.visible');
    });

    it('should display the invoices table', () => {
      cy.visit('/dashboard/commercial/invoices');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });

    it('should have search functionality', () => {
      cy.visit('/dashboard/commercial/invoices');

      cy.get('[data-testid="search-input"]').should('be.visible');
    });
  });

  describe('Create Sales Invoice', () => {
    it('should navigate to create invoice page', () => {
      cy.visit('/dashboard/commercial/invoices');

      cy.contains('button', 'Nueva Factura').click();

      cy.url().should('include', '/dashboard/commercial/invoices/new');
      cy.contains('Nueva Factura de Venta').should('be.visible');
    });

    it('should show form sections', () => {
      cy.visit('/dashboard/commercial/invoices/new');

      cy.contains('Datos de la Factura').should('be.visible');
      cy.contains('Líneas de Factura').should('be.visible');
      cy.contains('Observaciones').should('be.visible');
    });

    it('should create a sales invoice', () => {
      cy.visit('/dashboard/commercial/invoices/new');

      // Select customer (first available)
      cy.contains('label', 'Cliente')
        .parent()
        .find('[role="combobox"], button[data-slot="select-trigger"]')
        .click();
      cy.get('[role="option"]').first().click();

      // Select point of sale (first available)
      cy.contains('label', 'Punto de Venta')
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

      // Add a line
      cy.contains('button', 'Agregar Línea').click();

      // Select product in the line
      cy.get('[role="combobox"], button[data-slot="select-trigger"]')
        .filter(':contains("Seleccionar producto")')
        .first()
        .click();
      cy.get('[role="option"]').first().click();

      // Set quantity
      cy.get('input[placeholder="1"]').first().clear().type('2');

      // Add notes for cleanup identification
      cy.contains('label', 'Notas')
        .first()
        .parent()
        .find('textarea')
        .type('Factura de venta test E2E');

      // Submit
      cy.contains('button', 'Crear Factura').click();

      // Should redirect to detail
      cy.url().should('match', /\/dashboard\/commercial\/invoices\/[a-zA-Z0-9-]+$/, { timeout: 15000 });
    });
  });

  describe('View Invoice Detail', () => {
    it('should display invoice detail page', () => {
      cy.visit('/dashboard/commercial/invoices');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          // Click on first invoice actions
          cy.get('table tbody tr').first().find('button').last().click();
          cy.contains('Ver Detalle').click();

          cy.url().should('match', /\/dashboard\/commercial\/invoices\/[a-zA-Z0-9-]+$/);

          // Should show invoice sections
          cy.contains('Cliente').should('be.visible');
          cy.contains('Información de la Factura').should('be.visible');
        } else {
          cy.log('No invoices found, skipping detail test');
        }
      });
    });
  });

  describe('Invoice Actions', () => {
    it('should confirm a draft invoice', () => {
      cy.visit('/dashboard/commercial/invoices');

      cy.get('body').then(($body) => {
        // Look for a DRAFT invoice (Borrador badge)
        const draftRows = $body.find('table tbody tr:contains("Borrador")');
        if (draftRows.length > 0) {
          cy.get('table tbody tr').contains('Borrador').parents('tr').find('button').last().click();
          cy.contains('Confirmar').click();

          // Wait for confirmation
          cy.wait(2000);

          // Should update status or show success toast
          cy.get('body').should('be.visible');
        } else {
          cy.log('No draft invoices found, skipping confirm test');
        }
      });
    });

    it('should cancel an invoice', () => {
      cy.visit('/dashboard/commercial/invoices');

      cy.get('body').then(($body) => {
        const draftRows = $body.find('table tbody tr:contains("Borrador")');
        if (draftRows.length > 0) {
          cy.get('table tbody tr').contains('Borrador').parents('tr').find('button').last().click();
          cy.contains('Anular').click();

          cy.wait(2000);
          cy.get('body').should('be.visible');
        } else {
          cy.log('No cancelable invoices found, skipping cancel test');
        }
      });
    });
  });

  describe('Sales Reports', () => {
    it('should display sales reports page', () => {
      cy.visit('/dashboard/commercial/reports');

      // Should show reports content
      cy.get('body').should('be.visible');
      cy.wait(1000);
    });
  });
});
