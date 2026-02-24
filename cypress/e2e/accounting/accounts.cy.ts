import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Accounting - Chart of Accounts', () => {
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

  describe('List Accounts', () => {
    it('should display the chart of accounts page', () => {
      cy.visit('/dashboard/company/accounting/accounts');

      cy.contains('Plan de Cuentas').should('be.visible');
      cy.contains('Gestiona las cuentas contables de tu empresa').should('be.visible');
    });

    it('should have a button to create new account', () => {
      cy.visit('/dashboard/company/accounting/accounts');

      cy.contains('button', 'Nueva Cuenta').should('be.visible');
    });

    it('should display the accounts table', () => {
      cy.visit('/dashboard/company/accounting/accounts');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });

    it('should have search functionality', () => {
      cy.visit('/dashboard/company/accounting/accounts');

      cy.get('[data-testid="search-input"]').should('be.visible');
    });
  });

  describe('Create Account', () => {
    it('should open create account modal', () => {
      cy.visit('/dashboard/company/accounting/accounts');

      cy.contains('button', 'Nueva Cuenta').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Nueva Cuenta Contable').should('be.visible');
    });

    it('should show form fields in create modal', () => {
      cy.visit('/dashboard/company/accounting/accounts');

      cy.contains('button', 'Nueva Cuenta').click();
      cy.get('[role="dialog"]').should('be.visible');

      cy.get('[role="dialog"]').within(() => {
        cy.contains('label', 'Código').should('be.visible');
        cy.contains('label', 'Nombre').should('be.visible');
        cy.contains('label', 'Tipo').should('be.visible');
      });
    });
  });

  describe('Search Accounts', () => {
    it('should filter accounts by search term', () => {
      cy.visit('/dashboard/company/accounting/accounts');

      cy.get('[data-testid="search-input"]').type('Caja');
      cy.wait(500);
      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });
});
