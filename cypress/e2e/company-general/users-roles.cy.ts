import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Company General - Users & Roles', () => {
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

  describe('Users Page', () => {
    it('should display the users page', () => {
      cy.visit('/dashboard/company/general/users');

      cy.contains('h1', 'Usuarios').should('be.visible');
      cy.contains('Gestiona los usuarios que tienen acceso a la empresa').should('be.visible');
    });

    it('should display users table', () => {
      cy.visit('/dashboard/company/general/users');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });

    it('should have invite user button', () => {
      cy.visit('/dashboard/company/general/users');

      cy.contains('button', 'Invitar Usuario').should('be.visible');
    });

    it('should open invite user modal', () => {
      cy.visit('/dashboard/company/general/users');

      cy.contains('button', 'Invitar Usuario').click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should have search functionality', () => {
      cy.visit('/dashboard/company/general/users');

      cy.get('[data-testid="search-input"]').should('be.visible');
      cy.get('[data-testid="search-input"]').type('test');
      cy.wait(500);
      cy.get('[data-testid="data-table"]').should('be.visible');
    });

    it('should show current user in the list', () => {
      cy.visit('/dashboard/company/general/users');

      // At least one user should be visible (the logged-in user)
      cy.get('table tbody tr').should('have.length.at.least', 1);
    });
  });

  describe('Roles Page', () => {
    it('should display the roles page', () => {
      cy.visit('/dashboard/company/general/roles');

      cy.contains('h1', 'Roles').should('be.visible');
      cy.contains('Configura los roles y permisos de tu empresa').should('be.visible');
    });

    it('should display roles table', () => {
      cy.visit('/dashboard/company/general/roles');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });

    it('should have create role button', () => {
      cy.visit('/dashboard/company/general/roles');

      cy.contains('button', 'Nuevo Rol').should('be.visible');
    });

    it('should open create role modal', () => {
      cy.visit('/dashboard/company/general/roles');

      cy.contains('button', 'Nuevo Rol').click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should show existing roles', () => {
      cy.visit('/dashboard/company/general/roles');

      // Should have at least system roles
      cy.get('table tbody tr').should('have.length.at.least', 1);
    });

    it('should have search functionality', () => {
      cy.visit('/dashboard/company/general/roles');

      cy.get('[data-testid="search-input"]').should('be.visible');
    });
  });

  describe('Audit Page', () => {
    it('should display the audit page', () => {
      cy.visit('/dashboard/company/general/audit');

      cy.contains('h1', 'Auditoría').should('be.visible');
      cy.contains('Historial de cambios en permisos y roles de la empresa').should('be.visible');
    });

    it('should display audit log table', () => {
      cy.visit('/dashboard/company/general/audit');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });

    it('should have search functionality', () => {
      cy.visit('/dashboard/company/general/audit');

      cy.get('[data-testid="search-input"]').should('be.visible');
    });
  });
});
