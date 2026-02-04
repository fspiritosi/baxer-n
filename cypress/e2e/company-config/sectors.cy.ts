import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Company Config - Sectors CRUD', () => {
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
    it('should display the sectors page', () => {
      cy.visit('/dashboard/company/sectors');
      cy.get('[data-testid="sectors-page-title"]').should('be.visible').and('contain', 'Sectores');
    });

    it('should have a button to create new sector', () => {
      cy.visit('/dashboard/company/sectors');
      cy.get('[data-testid="new-sector-button"]').should('be.visible');
    });

    it('should show table or empty state', () => {
      cy.visit('/dashboard/company/sectors');
      // Wait for either table or empty state to appear
      cy.get('[data-testid="sectors-table"], [data-testid="sectors-empty-state"]', {
        timeout: 10000,
      }).should('exist');
    });
  });

  describe('Create', () => {
    it('should navigate to create page', () => {
      cy.visit('/dashboard/company/sectors');
      cy.get('[data-testid="new-sector-button"]').click();
      cy.url().should('include', '/dashboard/company/sectors/new');
    });

    it('should create a new sector', () => {
      const timestamp = Date.now();
      const name = `Test Sector ${timestamp}`;

      cy.visit('/dashboard/company/sectors/new');
      cy.get('[data-testid="sector-name-input"]').type(name);
      cy.get('[data-testid="sector-submit-button"]').click();

      cy.contains('creado', { timeout: 10000 }).should('be.visible');
      cy.url().should('not.include', '/new');
    });
  });

  describe('Edit', () => {
    it('should navigate to edit page and update', () => {
      const timestamp = Date.now();

      cy.visit('/dashboard/company/sectors');
      // Wait for either table or empty state to appear
      cy.get('[data-testid="sectors-table"], [data-testid="sectors-empty-state"]', {
        timeout: 10000,
      })
        .should('exist')
        .then(($el) => {
          if ($el.is('[data-testid="sectors-table"]')) {
            // Get the first row and click its actions button
            cy.get('[data-testid^="sector-actions-"]').first().click({ force: true });
            cy.get('[data-testid^="sector-edit-"]').first().click();
            cy.url().should('include', '/edit');

            cy.get('[data-testid="sector-name-input"]').clear().type(`Updated Sector ${timestamp}`);
            cy.get('[data-testid="sector-submit-button"]').click();

            cy.contains('actualizado', { timeout: 10000 }).should('be.visible');
          } else {
            cy.log('No sectors found, skipping edit test');
          }
        });
    });
  });

  describe('Delete', () => {
    it('should show delete confirmation dialog', () => {
      cy.visit('/dashboard/company/sectors');
      // Wait for either table or empty state to appear
      cy.get('[data-testid="sectors-table"], [data-testid="sectors-empty-state"]', {
        timeout: 10000,
      })
        .should('exist')
        .then(($el) => {
          if ($el.is('[data-testid="sectors-table"]')) {
            // Get the first row and click its actions button
            cy.get('[data-testid^="sector-actions-"]').first().click({ force: true });
            cy.get('[data-testid^="sector-delete-"]').first().click();
            cy.get('[data-testid="sector-delete-dialog"]').should('be.visible');
            cy.get('[data-testid="sector-delete-cancel"]').click();
          } else {
            cy.log('No sectors found, skipping delete test');
          }
        });
    });
  });
});
