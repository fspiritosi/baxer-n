import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Receipts', () => {
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

  describe('List Receipts', () => {
    it('should display the receipts page', () => {
      cy.visit('/dashboard/commercial/treasury/receipts');

      cy.contains('h1', 'Recibos de Cobro').should('be.visible');
      cy.contains('Gestión de recibos de cobro y cobranzas').should('be.visible');
    });

    it('should display KPI summary cards', () => {
      cy.visit('/dashboard/commercial/treasury/receipts');

      cy.contains('Total Cobrado').should('be.visible');
      cy.contains('Recibos Confirmados').should('be.visible');
      cy.contains('Borradores').should('be.visible');
    });

    it('should have a button to create new receipt', () => {
      cy.visit('/dashboard/commercial/treasury/receipts');

      cy.contains('button', 'Nuevo Recibo').should('be.visible');
    });

    it('should display the receipts table', () => {
      cy.visit('/dashboard/commercial/treasury/receipts');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });

  describe('Create Receipt', () => {
    it('should open create modal', () => {
      cy.visit('/dashboard/commercial/treasury/receipts');

      cy.contains('button', 'Nuevo Recibo').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Crear Recibo de Cobro').should('be.visible');
    });

    it('should show all sections in create modal', () => {
      cy.visit('/dashboard/commercial/treasury/receipts');

      cy.contains('button', 'Nuevo Recibo').click();
      cy.get('[role="dialog"]').should('be.visible');

      cy.get('[role="dialog"]').within(() => {
        cy.contains('Datos Básicos').should('be.visible');
        cy.contains('Facturas a Cobrar').should('be.visible');
        cy.contains('Formas de Pago').should('be.visible');
      });
    });
  });

  describe('View Receipt Detail', () => {
    it('should display receipt detail in modal', () => {
      cy.visit('/dashboard/commercial/treasury/receipts');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().click();

          cy.get('[role="dialog"]').should('be.visible');
          cy.contains('Detalle de Recibo de Cobro').should('be.visible');
        } else {
          cy.log('No receipts found, skipping detail test');
        }
      });
    });
  });

  describe('Search Receipts', () => {
    it('should have search functionality', () => {
      cy.visit('/dashboard/commercial/treasury/receipts');

      cy.get('[data-testid="search-input"]').should('be.visible');
      cy.get('[data-testid="search-input"]').type('test');
      cy.wait(500);
      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });
});
