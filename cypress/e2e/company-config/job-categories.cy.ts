import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Company Config - Job Categories CRUD', () => {
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
    it('should display the job categories page', () => {
      cy.visit('/dashboard/company/job-categories');
      cy.get('[data-testid="job-categories-page-title"]').should('be.visible');
      cy.get('[data-testid="job-categories-page-title"]').should(
        'contain.text',
        'Categorías Laborales'
      );
    });

    it('should have a button to create new job category', () => {
      cy.visit('/dashboard/company/job-categories');
      cy.get('[data-testid="new-job-category-button"]').should('be.visible');
      cy.get('[data-testid="new-job-category-button"]').should('contain.text', 'Nueva');
    });

    it('should show table or empty state', () => {
      cy.visit('/dashboard/company/job-categories');
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="job-categories-table"]').length > 0) {
          cy.get('[data-testid="job-categories-table"]').should('exist');
        } else {
          cy.get('[data-testid="job-categories-empty-state"]').should('be.visible');
          cy.get('[data-testid="job-categories-empty-state"]').should(
            'contain.text',
            'No hay categorías laborales'
          );
        }
      });
    });
  });

  describe('Create', () => {
    it('should navigate to create page', () => {
      cy.visit('/dashboard/company/job-categories');
      cy.get('[data-testid="new-job-category-button"]').click();
      cy.url().should('include', '/dashboard/company/job-categories/new');
    });

    it('should show form with required fields', () => {
      cy.visit('/dashboard/company/job-categories/new');
      cy.get('[data-testid="job-category-form"]').should('be.visible');
      cy.get('[data-testid="job-category-union-select"]').should('be.visible');
      cy.get('[data-testid="job-category-agreement-select"]').should('be.visible');
      cy.get('[data-testid="job-category-name-input"]').should('be.visible');
      cy.get('[data-testid="job-category-submit-button"]').should('be.visible');
      cy.get('[data-testid="job-category-cancel-button"]').should('be.visible');
    });

    it('should navigate back when cancel button is clicked', () => {
      cy.visit('/dashboard/company/job-categories/new');
      cy.get('[data-testid="job-category-cancel-button"]').click();
      cy.url().should('include', '/dashboard/company/job-categories');
      cy.url().should('not.include', '/new');
    });
  });

  describe('Edit', () => {
    it('should navigate to edit page', () => {
      cy.visit('/dashboard/company/job-categories');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="job-categories-table"]').length > 0) {
          // Get the first row and extract its id from the data-testid
          cy.get('[data-testid^="job-category-row-"]')
            .first()
            .invoke('attr', 'data-testid')
            .then((testId) => {
              const id = testId?.replace('job-category-row-', '');
              cy.get(`[data-testid="job-category-actions-${id}"]`).click({ force: true });
              cy.get(`[data-testid="job-category-edit-${id}"]`).click();
              cy.url().should('include', '/edit');
            });
        } else {
          cy.log('No job categories found, skipping edit test');
        }
      });
    });

    it('should show form with pre-filled data on edit page', () => {
      cy.visit('/dashboard/company/job-categories');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="job-categories-table"]').length > 0) {
          cy.get('[data-testid^="job-category-row-"]')
            .first()
            .invoke('attr', 'data-testid')
            .then((testId) => {
              const id = testId?.replace('job-category-row-', '');
              cy.get(`[data-testid="job-category-actions-${id}"]`).click({ force: true });
              cy.get(`[data-testid="job-category-edit-${id}"]`).click();
              cy.get('[data-testid="job-category-form"]').should('be.visible');
              cy.get('[data-testid="job-category-name-input"]').should('not.have.value', '');
            });
        } else {
          cy.log('No job categories found, skipping edit form test');
        }
      });
    });
  });

  describe('Delete', () => {
    it('should show delete confirmation dialog', () => {
      cy.visit('/dashboard/company/job-categories');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="job-categories-table"]').length > 0) {
          cy.get('[data-testid^="job-category-row-"]')
            .first()
            .invoke('attr', 'data-testid')
            .then((testId) => {
              const id = testId?.replace('job-category-row-', '');
              cy.get(`[data-testid="job-category-actions-${id}"]`).click({ force: true });
              cy.get(`[data-testid="job-category-delete-${id}"]`).click();
              cy.get('[data-testid="job-category-delete-dialog"]').should('be.visible');
              cy.get('[data-testid="job-category-delete-confirm"]').should('be.visible');
              cy.get('[data-testid="job-category-delete-cancel"]').click();
              cy.get('[data-testid="job-category-delete-dialog"]').should('not.exist');
            });
        } else {
          cy.log('No job categories found, skipping delete test');
        }
      });
    });
  });
});
