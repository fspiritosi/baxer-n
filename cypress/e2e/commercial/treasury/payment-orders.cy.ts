import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Payment Orders', () => {
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

  describe('List Payment Orders', () => {
    it('should display the payment orders page', () => {
      cy.visit('/dashboard/commercial/treasury/payment-orders');

      cy.contains('h1', 'Órdenes de Pago').should('be.visible');
      cy.contains('Gestión de órdenes de pago a proveedores').should('be.visible');
    });

    it('should display KPI summary cards', () => {
      cy.visit('/dashboard/commercial/treasury/payment-orders');

      cy.contains('Total Pagado').should('be.visible');
      cy.contains('Órdenes Confirmadas').should('be.visible');
      cy.contains('Borradores').should('be.visible');
    });

    it('should have a button to create new payment order', () => {
      cy.visit('/dashboard/commercial/treasury/payment-orders');

      cy.contains('button', 'Nueva Orden de Pago').should('be.visible');
    });

    it('should display the payment orders table', () => {
      cy.visit('/dashboard/commercial/treasury/payment-orders');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });

  describe('Create Payment Order', () => {
    it('should open create modal', () => {
      cy.visit('/dashboard/commercial/treasury/payment-orders');

      cy.contains('button', 'Nueva Orden de Pago').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Crear Orden de Pago').should('be.visible');
    });

    it('should show all sections in create modal', () => {
      cy.visit('/dashboard/commercial/treasury/payment-orders');

      cy.contains('button', 'Nueva Orden de Pago').click();
      cy.get('[role="dialog"]').should('be.visible');

      cy.get('[role="dialog"]').within(() => {
        cy.contains('Datos Básicos').should('be.visible');
        cy.contains('Items a Pagar').should('be.visible');
        cy.contains('Formas de Pago').should('be.visible');
      });
    });
  });

  describe('View Payment Order Detail', () => {
    it('should display payment order detail in modal', () => {
      cy.visit('/dashboard/commercial/treasury/payment-orders');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          // Click on first row to open detail
          cy.get('table tbody tr').first().click();

          cy.get('[role="dialog"]').should('be.visible');
          cy.contains('Detalle de Orden de Pago').should('be.visible');
        } else {
          cy.log('No payment orders found, skipping detail test');
        }
      });
    });
  });

  describe('Search Payment Orders', () => {
    it('should have search functionality', () => {
      cy.visit('/dashboard/commercial/treasury/payment-orders');

      cy.get('[data-testid="search-input"]').should('be.visible');
      cy.get('[data-testid="search-input"]').type('test');
      cy.wait(500);
      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });
});
