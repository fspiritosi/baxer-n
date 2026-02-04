import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Company Config - Cost Centers CRUD', () => {
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
    it('should display the cost centers page', () => {
      cy.visit('/dashboard/company/cost-centers');
      cy.get('[data-testid="cost-centers-page-title"]').should('be.visible');
      cy.get('[data-testid="cost-centers-page-title"]').should('contain', 'Centros de Costo');
    });

    it('should have a button to create new cost center', () => {
      cy.visit('/dashboard/company/cost-centers');
      cy.get('[data-testid="new-cost-center-button"]').should('be.visible');
    });

    it('should show table or empty state', () => {
      cy.visit('/dashboard/company/cost-centers');
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="cost-centers-table"]').length > 0) {
          cy.get('[data-testid="cost-centers-table"]').should('exist');
        } else {
          cy.get('[data-testid="cost-centers-empty-state"]').should('be.visible');
        }
      });
    });
  });

  describe('Create', () => {
    it('should navigate to create page', () => {
      cy.visit('/dashboard/company/cost-centers');
      cy.get('[data-testid="new-cost-center-button"]').click();
      cy.url().should('include', '/dashboard/company/cost-centers/new');
    });

    it('should create a new cost center', () => {
      const timestamp = Date.now();
      const name = `Test Cost Center ${timestamp}`;

      cy.visit('/dashboard/company/cost-centers/new');
      cy.get('[data-testid="cost-center-name-input"]').type(name);
      cy.get('[data-testid="cost-center-submit-button"]').click();

      cy.contains('creado', { timeout: 10000 }).should('be.visible');
      cy.url().should('not.include', '/new');
    });
  });

  describe('Edit', () => {
    it('should navigate to edit page and update', () => {
      const timestamp = Date.now();

      cy.visit('/dashboard/company/cost-centers');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="cost-centers-table"]').length > 0) {
          // Get the first row and click its action button
          cy.get('[data-testid^="cost-center-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="cost-center-edit-"]').first().click();
          cy.url().should('include', '/edit');

          cy.get('[data-testid="cost-center-name-input"]')
            .clear()
            .type(`Updated Cost Center ${timestamp}`);
          cy.get('[data-testid="cost-center-submit-button"]').click();

          cy.contains('actualizado', { timeout: 10000 }).should('be.visible');
        } else {
          cy.log('No cost centers found, skipping edit test');
        }
      });
    });
  });

  describe('Delete', () => {
    it('should show delete confirmation dialog', () => {
      cy.visit('/dashboard/company/cost-centers');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="cost-centers-table"]').length > 0) {
          // Get the first row and click its action button
          cy.get('[data-testid^="cost-center-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="cost-center-delete-"]').first().click();
          cy.get('[data-testid="cost-center-delete-dialog"]').should('be.visible');
          cy.get('[data-testid="cost-center-delete-cancel"]').click();
        } else {
          cy.log('No cost centers found, skipping delete test');
        }
      });
    });
  });
});
