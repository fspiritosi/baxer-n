import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Accounting - Settings', () => {
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

  describe('Accounting Settings Page', () => {
    it('should display the settings page', () => {
      cy.visit('/dashboard/company/accounting/settings');

      cy.contains('Configuración Contable').should('be.visible');
      cy.contains('Configura los parámetros contables de tu empresa').should('be.visible');
    });

    it('should display fiscal year section', () => {
      cy.visit('/dashboard/company/accounting/settings');

      cy.contains('Ejercicio Fiscal').should('be.visible');
    });

    it('should display commercial integration section', () => {
      cy.visit('/dashboard/company/accounting/settings');

      cy.contains('Integración Comercial').should('be.visible');
      cy.contains('Configura las cuentas contables por defecto').should('be.visible');
    });

    it('should have save buttons for each section', () => {
      cy.visit('/dashboard/company/accounting/settings');

      // Should have at least one save button
      cy.contains('button', 'Guardar').should('exist');
    });
  });
});
