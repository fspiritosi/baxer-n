import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Company Config - Contract Types CRUD', () => {
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
    it('should display the contract types page', () => {
      cy.visit('/dashboard/company/contract-types');
      cy.get('[data-testid="contract-types-page-title"]').should('be.visible');
      cy.get('[data-testid="contract-types-page-title"]').should('contain', 'Tipos de Contrato');
    });

    it('should have a button to create new contract type', () => {
      cy.visit('/dashboard/company/contract-types');
      cy.get('[data-testid="new-contract-type-button"]').should('be.visible');
    });

    it('should show table or empty state', () => {
      cy.visit('/dashboard/company/contract-types');
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="contract-types-table"]').length > 0) {
          cy.get('[data-testid="contract-types-table"]').should('exist');
        } else {
          cy.get('[data-testid="contract-types-empty-state"]').should('be.visible');
        }
      });
    });
  });

  describe('Create', () => {
    it('should navigate to create page', () => {
      cy.visit('/dashboard/company/contract-types');
      cy.get('[data-testid="new-contract-type-button"]').click();
      cy.url().should('include', '/dashboard/company/contract-types/new');
    });

    it('should create a new contract type', () => {
      const timestamp = Date.now();
      const name = `Test Contract ${timestamp}`;

      cy.visit('/dashboard/company/contract-types/new');
      cy.get('[data-testid="contract-type-name-input"]').type(name);
      cy.get('[data-testid="contract-type-submit-button"]').click();

      cy.contains('creado', { timeout: 10000 }).should('be.visible');
      cy.url().should('not.include', '/new');
    });

    it('should fill all form fields when creating', () => {
      const timestamp = Date.now();
      const name = `Full Contract ${timestamp}`;
      const code = `FC${timestamp.toString().slice(-4)}`;
      const description = `Test description for contract type ${timestamp}`;

      cy.visit('/dashboard/company/contract-types/new');
      cy.get('[data-testid="contract-type-name-input"]').type(name);
      cy.get('[data-testid="contract-type-code-input"]').type(code);
      cy.get('[data-testid="contract-type-description-input"]').type(description);
      cy.get('[data-testid="contract-type-submit-button"]').click();

      cy.contains('creado', { timeout: 10000 }).should('be.visible');
      cy.url().should('not.include', '/new');
    });

    it('should cancel creation and go back to list', () => {
      cy.visit('/dashboard/company/contract-types/new');
      cy.get('[data-testid="contract-type-cancel-button"]').click();
      cy.url().should('include', '/dashboard/company/contract-types');
      cy.url().should('not.include', '/new');
    });
  });

  describe('Edit', () => {
    it('should navigate to edit page and update', () => {
      const timestamp = Date.now();

      cy.visit('/dashboard/company/contract-types');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="contract-types-table"]').length > 0) {
          // Get the first row and click its actions button
          cy.get('[data-testid^="contract-type-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="contract-type-edit-"]').first().click();
          cy.url().should('include', '/edit');

          cy.get('[data-testid="contract-type-name-input"]')
            .clear()
            .type(`Updated Contract ${timestamp}`);
          cy.get('[data-testid="contract-type-submit-button"]').click();

          cy.contains('actualizado', { timeout: 10000 }).should('be.visible');
        } else {
          cy.log('No contract types found, skipping edit test');
        }
      });
    });
  });

  describe('Delete', () => {
    it('should show delete confirmation dialog', () => {
      cy.visit('/dashboard/company/contract-types');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="contract-types-table"]').length > 0) {
          // Get the first row and click its actions button
          cy.get('[data-testid^="contract-type-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="contract-type-delete-"]').first().click();

          cy.get('[data-testid="contract-type-delete-dialog"]').should('be.visible');
          cy.get('[data-testid="contract-type-delete-cancel"]').click();
        } else {
          cy.log('No contract types found, skipping delete test');
        }
      });
    });

    it('should delete a contract type when confirmed', () => {
      // First create a contract type to delete
      const timestamp = Date.now();
      const name = `To Delete ${timestamp}`;

      cy.visit('/dashboard/company/contract-types/new');
      cy.get('[data-testid="contract-type-name-input"]').type(name);
      cy.get('[data-testid="contract-type-submit-button"]').click();
      cy.contains('creado', { timeout: 10000 }).should('be.visible');

      // Now delete it
      cy.visit('/dashboard/company/contract-types');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="contract-types-table"]').length > 0) {
          // Get the first row and click its actions button
          cy.get('[data-testid^="contract-type-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="contract-type-delete-"]').first().click();

          cy.get('[data-testid="contract-type-delete-dialog"]').should('be.visible');
          cy.get('[data-testid="contract-type-delete-confirm"]').click();

          cy.contains('eliminado', { timeout: 10000 }).should('be.visible');
        }
      });
    });
  });
});
