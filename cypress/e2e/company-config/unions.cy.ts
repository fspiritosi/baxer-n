import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Company Config - Unions CRUD', () => {
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

  describe('List', () => {
    it('should display the unions page', () => {
      cy.visit('/dashboard/company/unions');
      cy.get('[data-testid="unions-page-title"]').should('be.visible');
    });

    it('should have a button to create new union', () => {
      cy.visit('/dashboard/company/unions');
      cy.get('[data-testid="new-union-button"]').should('be.visible');
    });

    it('should show table or empty state', () => {
      cy.visit('/dashboard/company/unions');
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="unions-table"]').length > 0) {
          cy.get('[data-testid="unions-table"]').should('exist');
        } else {
          cy.get('[data-testid="unions-empty-state"]').should('be.visible');
        }
      });
    });
  });

  describe('Create', () => {
    it('should navigate to create page', () => {
      cy.visit('/dashboard/company/unions');
      cy.get('[data-testid="new-union-button"]').click();
      cy.url().should('include', '/dashboard/company/unions/new');
    });

    it('should show validation error for empty name', () => {
      cy.visit('/dashboard/company/unions/new');
      cy.get('[data-testid="union-submit-button"]').click();
      cy.contains('El nombre debe tener al menos 2 caracteres').should('be.visible');
    });

    it('should create a new union', () => {
      const timestamp = Date.now();
      const unionName = `Test Union ${timestamp}`;

      cy.visit('/dashboard/company/unions/new');
      cy.get('[data-testid="union-name-input"]').type(unionName);
      cy.get('[data-testid="union-submit-button"]').click();

      cy.contains('Sindicato creado exitosamente', { timeout: 10000 }).should('be.visible');
      cy.url().should('include', '/dashboard/company/unions');
      cy.url().should('not.include', '/new');
    });
  });

  describe('Edit', () => {
    it('should navigate to edit page', () => {
      cy.visit('/dashboard/company/unions');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="unions-table"]').length > 0) {
          cy.get('[data-testid="unions-table"] tbody tr')
            .first()
            .find('[data-testid^="union-actions-"]')
            .click({ force: true });
          cy.contains('Editar').click();
          cy.url().should('include', '/edit');
        } else {
          cy.log('No unions found, skipping edit test');
        }
      });
    });

    it('should update union', () => {
      const timestamp = Date.now();

      cy.visit('/dashboard/company/unions');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="unions-table"]').length > 0) {
          cy.get('[data-testid="unions-table"] tbody tr')
            .first()
            .find('[data-testid^="union-actions-"]')
            .click({ force: true });
          cy.contains('Editar').click();
          cy.url().should('include', '/edit');

          cy.get('[data-testid="union-name-input"]').clear().type(`Updated Union ${timestamp}`);
          cy.get('[data-testid="union-submit-button"]').click();

          cy.contains('Sindicato actualizado exitosamente', { timeout: 10000 }).should(
            'be.visible'
          );
        } else {
          cy.log('No unions found, skipping update test');
        }
      });
    });
  });

  describe('Delete', () => {
    it('should show delete confirmation dialog', () => {
      cy.visit('/dashboard/company/unions');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="unions-table"]').length > 0) {
          cy.get('[data-testid="unions-table"] tbody tr')
            .first()
            .find('[data-testid^="union-actions-"]')
            .click({ force: true });
          cy.contains('Eliminar').click();
          cy.contains('¿Eliminar sindicato?').should('be.visible');
          cy.get('[data-testid="union-cancel-button"]').should('not.exist'); // Cancel in dialog uses different button
          cy.contains('button', 'Cancelar').click();
        } else {
          cy.log('No unions found, skipping delete test');
        }
      });
    });
  });
});
