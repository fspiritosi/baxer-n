import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Company Config - Job Positions CRUD', () => {
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
    it('should display the job positions page', () => {
      cy.visit('/dashboard/company/job-positions');
      cy.get('[data-testid="job-positions-page-title"]').should('be.visible');
    });

    it('should have a button to create new job position', () => {
      cy.visit('/dashboard/company/job-positions');
      cy.get('[data-testid="new-job-position-button"]').should('be.visible');
    });

    it('should show table or empty state', () => {
      cy.visit('/dashboard/company/job-positions');
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="job-positions-table"]').length > 0) {
          cy.get('[data-testid="job-positions-table"]').should('exist');
        } else {
          cy.get('[data-testid="job-positions-empty-state"]').should('be.visible');
        }
      });
    });
  });

  describe('Create', () => {
    it('should navigate to create page', () => {
      cy.visit('/dashboard/company/job-positions');
      cy.get('[data-testid="new-job-position-button"]').click();
      cy.url().should('include', '/dashboard/company/job-positions/new');
    });

    it('should create a new job position', () => {
      const timestamp = Date.now();
      const positionName = `Test Position ${timestamp}`;

      cy.visit('/dashboard/company/job-positions/new');
      cy.get('[data-testid="job-position-name-input"]').type(positionName);
      cy.get('[data-testid="job-position-submit-button"]').click();

      cy.contains('creado', { timeout: 10000 }).should('be.visible');
      cy.url().should('not.include', '/new');
    });
  });

  describe('Edit', () => {
    it('should navigate to edit page and update', () => {
      const timestamp = Date.now();

      cy.visit('/dashboard/company/job-positions');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="job-positions-table"]').length > 0) {
          // Use data-testid selectors for actions
          cy.get('[data-testid^="job-position-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="job-position-edit-"]').first().click();
          cy.url().should('include', '/edit');

          cy.get('[data-testid="job-position-name-input"]')
            .clear()
            .type(`Updated Position ${timestamp}`);
          cy.get('[data-testid="job-position-submit-button"]').click();

          cy.contains('actualizado', { timeout: 10000 }).should('be.visible');
        } else {
          cy.log('No job positions found, skipping edit test');
        }
      });
    });
  });

  describe('Delete', () => {
    it('should show delete confirmation dialog', () => {
      cy.visit('/dashboard/company/job-positions');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="job-positions-table"]').length > 0) {
          // Use data-testid selectors for actions
          cy.get('[data-testid^="job-position-actions-"]').first().click({ force: true });
          cy.get('[data-testid^="job-position-delete-"]').first().click();
          cy.get('[data-testid="job-position-delete-dialog"]').should('be.visible');
          cy.get('[data-testid="job-position-delete-cancel"]').click();
        } else {
          cy.log('No job positions found, skipping delete test');
        }
      });
    });
  });
});
