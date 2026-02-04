import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Company Config - Type Operatives CRUD', () => {
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
    it('should display the type operatives page', () => {
      cy.visit('/dashboard/company/type-operatives');
      cy.get('[data-testid="type-operatives-page-title"]').should('be.visible');
      cy.get('[data-testid="type-operatives-page-title"]').should('contain', 'Tipos Operativos');
    });

    it('should have a button to create new type operative', () => {
      cy.visit('/dashboard/company/type-operatives');
      cy.get('[data-testid="new-type-operative-button"]').should('be.visible');
      cy.get('[data-testid="new-type-operative-button"]').should('contain', 'Nuevo');
    });

    it('should show table or empty state', () => {
      cy.visit('/dashboard/company/type-operatives');
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="type-operatives-table"]').length > 0) {
          cy.get('[data-testid="type-operatives-table"]').should('exist');
        } else {
          cy.get('[data-testid="type-operatives-empty-state"]').should('be.visible');
        }
      });
    });
  });

  describe('Create', () => {
    it('should navigate to create page', () => {
      cy.visit('/dashboard/company/type-operatives');
      cy.get('[data-testid="new-type-operative-button"]').click();
      cy.url().should('include', '/dashboard/company/type-operatives/new');
    });

    it('should create a new type operative', () => {
      const timestamp = Date.now();
      const name = `Test Type ${timestamp}`;

      cy.visit('/dashboard/company/type-operatives/new');
      cy.get('[data-testid="type-operative-name-input"]').type(name);
      cy.get('[data-testid="type-operative-submit-button"]').click();

      cy.contains('creado', { timeout: 10000 }).should('be.visible');
      cy.url().should('not.include', '/new');
    });

    it('should cancel and return to list', () => {
      cy.visit('/dashboard/company/type-operatives/new');
      cy.get('[data-testid="type-operative-cancel-button"]').click();
      cy.url().should('include', '/dashboard/company/type-operatives');
      cy.url().should('not.include', '/new');
    });
  });

  describe('Edit', () => {
    it('should navigate to edit page and update', () => {
      const timestamp = Date.now();

      cy.visit('/dashboard/company/type-operatives');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="type-operatives-table"]').length > 0) {
          // Get the first row's actions button
          cy.get('[data-testid^="type-operative-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="type-operative-edit-"]').first().click();
          cy.url().should('include', '/edit');

          cy.get('[data-testid="type-operative-name-input"]')
            .clear()
            .type(`Updated Type ${timestamp}`);
          cy.get('[data-testid="type-operative-submit-button"]').click();

          cy.contains('actualizado', { timeout: 10000 }).should('be.visible');
        } else {
          cy.log('No type operatives found, skipping edit test');
        }
      });
    });
  });

  describe('Delete', () => {
    it('should show delete confirmation dialog', () => {
      cy.visit('/dashboard/company/type-operatives');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="type-operatives-table"]').length > 0) {
          // Get the first row's actions button
          cy.get('[data-testid^="type-operative-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="type-operative-delete-"]').first().click();
          cy.get('[data-testid="type-operative-delete-dialog"]').should('be.visible');
          cy.get('[data-testid="type-operative-delete-cancel"]').click();
        } else {
          cy.log('No type operatives found, skipping delete test');
        }
      });
    });

    it('should cancel delete and close dialog', () => {
      cy.visit('/dashboard/company/type-operatives');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="type-operatives-table"]').length > 0) {
          cy.get('[data-testid^="type-operative-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="type-operative-delete-"]').first().click();
          cy.get('[data-testid="type-operative-delete-dialog"]').should('be.visible');
          cy.get('[data-testid="type-operative-delete-cancel"]').click();
          cy.get('[data-testid="type-operative-delete-dialog"]').should('not.exist');
        } else {
          cy.log('No type operatives found, skipping cancel delete test');
        }
      });
    });
  });
});
