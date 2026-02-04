import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Company Config - Vehicle Types CRUD', () => {
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
    it('should display the vehicle types page', () => {
      cy.visit('/dashboard/company/vehicle-types');
      cy.get('[data-testid="vehicle-types-page-title"]').should('be.visible');
      cy.get('[data-testid="vehicle-types-page-title"]').should('contain', 'Tipos de Equipo');
    });

    it('should have a button to create new type', () => {
      cy.visit('/dashboard/company/vehicle-types');
      cy.get('[data-testid="new-vehicle-type-button"]').should('be.visible');
    });

    it('should show table or empty state', () => {
      cy.visit('/dashboard/company/vehicle-types');
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="vehicle-types-table"]').length > 0) {
          cy.get('[data-testid="vehicle-types-table"]').should('exist');
        } else {
          cy.get('[data-testid="vehicle-types-empty-state"]').should('be.visible');
        }
      });
    });
  });

  describe('Create', () => {
    it('should navigate to create page', () => {
      cy.visit('/dashboard/company/vehicle-types');
      cy.get('[data-testid="new-vehicle-type-button"]').click();
      cy.url().should('include', '/dashboard/company/vehicle-types/new');
      cy.get('[data-testid="vehicle-type-new-page-title"]').should('be.visible');
    });

    it('should create a new vehicle type', () => {
      const timestamp = Date.now();
      const name = `Test Type ${timestamp}`;

      cy.visit('/dashboard/company/vehicle-types/new');
      cy.get('[data-testid="vehicle-type-name-input"]').type(name);
      cy.get('[data-testid="vehicle-type-submit-button"]').click();

      cy.contains('creado', { timeout: 10000 }).should('be.visible');
      cy.url().should('not.include', '/new');
    });

    it('should cancel creation and return to list', () => {
      cy.visit('/dashboard/company/vehicle-types/new');
      cy.get('[data-testid="vehicle-type-cancel-button"]').click();
      cy.url().should('include', '/dashboard/company/vehicle-types');
      cy.url().should('not.include', '/new');
    });
  });

  describe('Edit', () => {
    it('should navigate to edit page and update', () => {
      const timestamp = Date.now();

      cy.visit('/dashboard/company/vehicle-types');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="vehicle-types-table"]').length > 0) {
          // Get the first row and click its actions button
          cy.get('[data-testid^="vehicle-type-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="vehicle-type-edit-"]').first().click();
          cy.url().should('include', '/edit');
          cy.get('[data-testid="vehicle-type-edit-page-title"]').should('be.visible');

          cy.get('[data-testid="vehicle-type-name-input"]')
            .clear()
            .type(`Updated Type ${timestamp}`);
          cy.get('[data-testid="vehicle-type-submit-button"]').click();

          cy.contains('actualizado', { timeout: 10000 }).should('be.visible');
        } else {
          cy.log('No vehicle types found, skipping edit test');
        }
      });
    });
  });

  describe('Delete', () => {
    it('should show delete confirmation dialog', () => {
      cy.visit('/dashboard/company/vehicle-types');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="vehicle-types-table"]').length > 0) {
          // Get the first row and click its actions button
          cy.get('[data-testid^="vehicle-type-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="vehicle-type-delete-"]').first().click();
          cy.get('[data-testid="vehicle-type-delete-dialog"]').should('be.visible');
          cy.get('[data-testid="vehicle-type-delete-cancel"]').click();
        } else {
          cy.log('No vehicle types found, skipping delete test');
        }
      });
    });

    it('should delete a vehicle type', () => {
      // First create a vehicle type to delete
      const timestamp = Date.now();
      const name = `Delete Test ${timestamp}`;

      cy.visit('/dashboard/company/vehicle-types/new');
      cy.get('[data-testid="vehicle-type-name-input"]').type(name);
      cy.get('[data-testid="vehicle-type-submit-button"]').click();
      cy.contains('creado', { timeout: 10000 }).should('be.visible');

      // Now delete it
      cy.visit('/dashboard/company/vehicle-types');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="vehicle-types-table"]').length > 0) {
          // Get the first row and click its actions button
          cy.get('[data-testid^="vehicle-type-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="vehicle-type-delete-"]').first().click();
          cy.get('[data-testid="vehicle-type-delete-dialog"]').should('be.visible');
          cy.get('[data-testid="vehicle-type-delete-confirm"]').click();
          cy.contains('eliminado', { timeout: 10000 }).should('be.visible');
        } else {
          cy.log('No vehicle types found, skipping delete test');
        }
      });
    });
  });
});
