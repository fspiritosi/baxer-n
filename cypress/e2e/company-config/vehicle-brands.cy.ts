import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Company Config - Vehicle Brands CRUD', () => {
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
    it('should display the vehicle brands page', () => {
      cy.visit('/dashboard/company/vehicle-brands');
      cy.get('[data-testid="vehicle-brands-page-title"]').should('be.visible');
    });

    it('should have a button to create new brand', () => {
      cy.visit('/dashboard/company/vehicle-brands');
      cy.get('[data-testid="new-vehicle-brand-button"]').should('be.visible');
    });

    it('should show table or empty state', () => {
      cy.visit('/dashboard/company/vehicle-brands');
      // Wait for either the table or empty state to appear
      cy.get('[data-testid="vehicle-brands-table"], [data-testid="vehicle-brands-empty-state"]', {
        timeout: 10000,
      }).should('exist');
    });
  });

  describe('Create', () => {
    it('should navigate to create page', () => {
      cy.visit('/dashboard/company/vehicle-brands');
      cy.get('[data-testid="new-vehicle-brand-button"]').click();
      cy.url().should('include', '/dashboard/company/vehicle-brands/new');
      cy.get('[data-testid="vehicle-brand-new-page-title"]').should('be.visible');
    });

    it('should create a new vehicle brand', () => {
      const timestamp = Date.now();
      const name = `Test Brand ${timestamp}`;

      cy.visit('/dashboard/company/vehicle-brands/new');
      cy.get('[data-testid="vehicle-brand-name-input"]').type(name);
      cy.get('[data-testid="vehicle-brand-submit-button"]').click();

      cy.contains('Marca creada exitosamente', { timeout: 10000 }).should('be.visible');
      cy.url().should('not.include', '/new');
    });
  });

  describe('Edit', () => {
    it('should navigate to edit page and update', () => {
      const timestamp = Date.now();

      cy.visit('/dashboard/company/vehicle-brands');
      // Wait for the page to fully load
      cy.get('[data-testid="vehicle-brands-page-title"]').should('be.visible');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="vehicle-brands-table"]').length > 0) {
          // Get the first row's actions button using a partial match
          cy.get('[data-testid^="vehicle-brand-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="vehicle-brand-edit-"]').first().click();
          cy.url().should('include', '/edit');
          cy.get('[data-testid="vehicle-brand-edit-page-title"]').should('be.visible');

          cy.get('[data-testid="vehicle-brand-name-input"]')
            .clear()
            .type(`Updated Brand ${timestamp}`);
          cy.get('[data-testid="vehicle-brand-submit-button"]').click();

          cy.contains('Marca actualizada exitosamente', { timeout: 10000 }).should('be.visible');
        } else {
          cy.log('No vehicle brands found, skipping edit test');
        }
      });
    });
  });

  describe('Delete', () => {
    it('should show delete confirmation dialog', () => {
      cy.visit('/dashboard/company/vehicle-brands');
      // Wait for the page to fully load
      cy.get('[data-testid="vehicle-brands-page-title"]').should('be.visible');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="vehicle-brands-table"]').length > 0) {
          // Get the first row's actions button using a partial match
          cy.get('[data-testid^="vehicle-brand-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="vehicle-brand-delete-"]').first().click();
          cy.get('[data-testid="vehicle-brand-delete-dialog"]').should('be.visible');
          cy.get('[data-testid="vehicle-brand-delete-cancel"]').click();
        } else {
          cy.log('No vehicle brands found, skipping delete test');
        }
      });
    });
  });
});
