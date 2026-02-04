import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Company Config - Collective Agreements CRUD', () => {
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
    it('should display the collective agreements page', () => {
      cy.visit('/dashboard/company/collective-agreements');
      cy.get('[data-testid="collective-agreements-page-title"]').should('be.visible');
      cy.get('[data-testid="collective-agreements-page-title"]').should(
        'contain.text',
        'Convenios'
      );
    });

    it('should have a button to create new agreement', () => {
      cy.visit('/dashboard/company/collective-agreements');
      cy.get('[data-testid="new-collective-agreement-button"]').should('be.visible');
      cy.get('[data-testid="new-collective-agreement-button"]').should('contain.text', 'Nuevo');
    });

    it('should show table or empty state', () => {
      cy.visit('/dashboard/company/collective-agreements');
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="collective-agreements-table"]').length > 0) {
          cy.get('[data-testid="collective-agreements-table"]').should('exist');
        } else {
          cy.get('[data-testid="collective-agreements-empty-state"]').should('be.visible');
        }
      });
    });
  });

  describe('Create', () => {
    it('should navigate to create page', () => {
      cy.visit('/dashboard/company/collective-agreements');
      cy.get('[data-testid="new-collective-agreement-button"]').click();
      cy.url().should('include', '/dashboard/company/collective-agreements/new');
    });

    it('should show form with required fields', () => {
      cy.visit('/dashboard/company/collective-agreements/new');
      cy.get('[data-testid="collective-agreement-union-select"]').should('be.visible');
      cy.get('[data-testid="collective-agreement-name-input"]').should('be.visible');
      cy.get('[data-testid="collective-agreement-submit-button"]').should('be.visible');
      cy.get('[data-testid="collective-agreement-cancel-button"]').should('be.visible');
    });

    it('should navigate back when cancel is clicked', () => {
      cy.visit('/dashboard/company/collective-agreements/new');
      cy.get('[data-testid="collective-agreement-cancel-button"]').click();
      cy.url().should('include', '/dashboard/company/collective-agreements');
      cy.url().should('not.include', '/new');
    });
  });

  describe('Edit', () => {
    it('should navigate to edit page', () => {
      cy.visit('/dashboard/company/collective-agreements');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="collective-agreements-table"]').length > 0) {
          cy.get('[data-testid^="collective-agreement-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="collective-agreement-edit-"]').first().click();
          cy.url().should('include', '/edit');
        } else {
          cy.log('No collective agreements found, skipping edit test');
        }
      });
    });

    it('should show form fields in edit page', () => {
      cy.visit('/dashboard/company/collective-agreements');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="collective-agreements-table"]').length > 0) {
          cy.get('[data-testid^="collective-agreement-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="collective-agreement-edit-"]').first().click();
          cy.get('[data-testid="collective-agreement-union-select"]').should('be.visible');
          cy.get('[data-testid="collective-agreement-name-input"]').should('be.visible');
          cy.get('[data-testid="collective-agreement-submit-button"]').should('be.visible');
          cy.get('[data-testid="collective-agreement-cancel-button"]').should('be.visible');
        } else {
          cy.log('No collective agreements found, skipping edit form test');
        }
      });
    });
  });

  describe('Delete', () => {
    it('should show delete confirmation dialog', () => {
      cy.visit('/dashboard/company/collective-agreements');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="collective-agreements-table"]').length > 0) {
          cy.get('[data-testid^="collective-agreement-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="collective-agreement-delete-"]').first().click();
          cy.get('[data-testid="collective-agreement-delete-dialog"]').should('be.visible');
          cy.get('[data-testid="collective-agreement-delete-cancel"]').click();
        } else {
          cy.log('No collective agreements found, skipping delete test');
        }
      });
    });

    it('should close delete dialog when cancel is clicked', () => {
      cy.visit('/dashboard/company/collective-agreements');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="collective-agreements-table"]').length > 0) {
          cy.get('[data-testid^="collective-agreement-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="collective-agreement-delete-"]').first().click();
          cy.get('[data-testid="collective-agreement-delete-dialog"]').should('be.visible');
          cy.get('[data-testid="collective-agreement-delete-cancel"]').click();
          cy.get('[data-testid="collective-agreement-delete-dialog"]').should('not.exist');
        } else {
          cy.log('No collective agreements found, skipping delete cancel test');
        }
      });
    });
  });
});
