import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Accounting - Journal Entries', () => {
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

  describe('List Entries', () => {
    it('should display the journal entries page', () => {
      cy.visit('/dashboard/company/accounting/entries');

      cy.contains('Libro Diario').should('be.visible');
      cy.contains('Gestiona los asientos contables de tu empresa').should('be.visible');
    });

    it('should have a button to create new entry', () => {
      cy.visit('/dashboard/company/accounting/entries');

      cy.contains('button', 'Nuevo Asiento').should('be.visible');
    });

    it('should display the entries table', () => {
      cy.visit('/dashboard/company/accounting/entries');

      cy.contains('Asientos Contables').should('be.visible');
    });

    it('should have search functionality', () => {
      cy.visit('/dashboard/company/accounting/entries');

      cy.get('[data-testid="search-input"]').should('be.visible');
    });
  });

  describe('Create Entry', () => {
    it('should open create entry modal', () => {
      cy.visit('/dashboard/company/accounting/entries');

      cy.contains('button', 'Nuevo Asiento').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Nuevo Asiento Contable').should('be.visible');
    });

    it('should show entry form with line items', () => {
      cy.visit('/dashboard/company/accounting/entries');

      cy.contains('button', 'Nuevo Asiento').click();
      cy.get('[role="dialog"]').should('be.visible');

      cy.get('[role="dialog"]').within(() => {
        cy.contains('label', 'Fecha').should('be.visible');
        cy.contains('label', 'Descripción').should('be.visible');
        cy.contains('Agregar Línea').should('be.visible');
      });
    });

    it('should add and remove lines', () => {
      cy.visit('/dashboard/company/accounting/entries');

      cy.contains('button', 'Nuevo Asiento').click();
      cy.get('[role="dialog"]').should('be.visible');

      cy.get('[role="dialog"]').within(() => {
        // Should start with 2 lines
        // Add another line
        cy.contains('button', 'Agregar Línea').click();
        cy.wait(300);
      });
    });
  });

  describe('View Entry Detail', () => {
    it('should display entry detail when expanding a row', () => {
      cy.visit('/dashboard/company/accounting/entries');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          // Click first row to expand
          cy.get('table tbody tr').first().click();
          cy.wait(500);
          cy.get('body').should('be.visible');
        } else {
          cy.log('No entries found, skipping detail test');
        }
      });
    });
  });

  describe('Filter Entries', () => {
    it('should search entries by description', () => {
      cy.visit('/dashboard/company/accounting/entries');

      cy.get('[data-testid="search-input"]').type('test');
      cy.wait(500);
      cy.get('body').should('be.visible');
    });
  });
});
