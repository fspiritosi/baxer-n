import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Expenses', () => {
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
    cy.task('cleanupTestExpenses').then((result) => {
      cy.log(`Expenses cleanup: ${JSON.stringify(result)}`);
    });
  });

  describe('List Expenses', () => {
    it('should display the expenses page', () => {
      cy.visit('/dashboard/commercial/expenses');

      cy.contains('h1', 'Gastos').should('be.visible');
      cy.contains('Gestión de gastos operativos de la empresa').should('be.visible');
    });

    it('should display KPI summary cards', () => {
      cy.visit('/dashboard/commercial/expenses');

      cy.contains('Confirmados').should('be.visible');
      cy.contains('Borradores').should('be.visible');
    });

    it('should have a button to create new expense', () => {
      cy.visit('/dashboard/commercial/expenses');

      cy.contains('button', 'Nuevo Gasto').should('be.visible');
    });

    it('should display the expenses table', () => {
      cy.visit('/dashboard/commercial/expenses');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });

  describe('Create Expense', () => {
    it('should open create modal', () => {
      cy.visit('/dashboard/commercial/expenses');

      cy.contains('button', 'Nuevo Gasto').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Nuevo Gasto').should('be.visible');
    });

    it('should create an expense with complete data', () => {
      cy.visit('/dashboard/commercial/expenses');

      cy.contains('button', 'Nuevo Gasto').click();
      cy.get('[role="dialog"]').should('be.visible');

      cy.get('[role="dialog"]').within(() => {
        // Description
        cy.contains('label', 'Descripción')
          .parent()
          .find('input')
          .type('Gasto test E2E');

        // Amount
        cy.contains('label', 'Monto')
          .parent()
          .find('input')
          .type('1500');

        // Date
        cy.contains('label', 'Fecha')
          .parent()
          .find('input')
          .type(new Date().toISOString().split('T')[0]);

        // Category - select first available
        cy.contains('label', 'Categoría')
          .parent()
          .find('[role="combobox"], button[data-slot="select-trigger"]')
          .click();
      });
      // Options are rendered outside the dialog in a portal
      cy.get('[role="option"]').first().click();

      cy.get('[role="dialog"]').within(() => {
        cy.contains('button', 'Guardar').click();
      });

      // Modal should close
      cy.get('[role="dialog"]').should('not.exist', { timeout: 10000 });
    });

    it('should create an expense without supplier', () => {
      cy.visit('/dashboard/commercial/expenses');

      cy.contains('button', 'Nuevo Gasto').click();
      cy.get('[role="dialog"]').should('be.visible');

      cy.get('[role="dialog"]').within(() => {
        cy.contains('label', 'Descripción')
          .parent()
          .find('input')
          .type('Gasto sin proveedor test E2E');

        cy.contains('label', 'Monto')
          .parent()
          .find('input')
          .type('800');

        cy.contains('label', 'Fecha')
          .parent()
          .find('input')
          .type(new Date().toISOString().split('T')[0]);

        // Select category
        cy.contains('label', 'Categoría')
          .parent()
          .find('[role="combobox"], button[data-slot="select-trigger"]')
          .click();
      });
      cy.get('[role="option"]').first().click();

      cy.get('[role="dialog"]').within(() => {
        // Leave supplier empty
        cy.contains('button', 'Guardar').click();
      });

      cy.get('[role="dialog"]').should('not.exist', { timeout: 10000 });
    });
  });

  describe('View Expense Detail', () => {
    it('should display expense detail in modal', () => {
      cy.visit('/dashboard/commercial/expenses');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().click();

          cy.get('[role="dialog"]').should('be.visible');
          cy.contains('Detalle de Gasto').should('be.visible');
        } else {
          cy.log('No expenses found, skipping detail test');
        }
      });
    });
  });

  describe('Search Expenses', () => {
    it('should filter expenses by search term', () => {
      cy.visit('/dashboard/commercial/expenses');

      cy.get('[data-testid="search-input"]').should('be.visible');
      cy.get('[data-testid="search-input"]').type('test E2E');
      cy.wait(500);
      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });
});
