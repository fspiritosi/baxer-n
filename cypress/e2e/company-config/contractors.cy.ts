import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Company Config - Contractors CRUD', () => {
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
    it('should display the contractors page', () => {
      cy.visit('/dashboard/company/contractors');
      cy.get('[data-testid="contractors-page-title"]').should('be.visible');
    });

    it('should have a button to create new contractor', () => {
      cy.visit('/dashboard/company/contractors');
      cy.get('[data-testid="new-contractor-button"]').should('be.visible');
    });

    it('should show table or empty state', () => {
      cy.visit('/dashboard/company/contractors');
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="contractors-table"]').length > 0) {
          cy.get('[data-testid="contractors-table"]').should('exist');
        } else {
          cy.get('[data-testid="contractors-empty-state"]').should('be.visible');
        }
      });
    });
  });

  describe('Create', () => {
    it('should navigate to create page', () => {
      cy.visit('/dashboard/company/contractors');
      cy.get('[data-testid="new-contractor-button"]').click();
      cy.url().should('include', '/dashboard/company/contractors/new');
    });

    it('should create a new contractor', () => {
      const timestamp = Date.now();
      const name = `Test Contractor ${timestamp}`;

      cy.visit('/dashboard/company/contractors/new');
      cy.get('[data-testid="contractor-name-input"]').type(name);
      cy.get('[data-testid="contractor-submit-button"]').click();

      cy.contains('creado', { timeout: 10000 }).should('be.visible');
      cy.url().should('not.include', '/new');
    });
  });

  describe('Edit', () => {
    it('should navigate to edit page and show form', () => {
      cy.visit('/dashboard/company/contractors');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="contractors-table"] tbody tr').length > 0) {
          cy.get('[data-testid="contractors-table"] tbody tr')
            .first()
            .find('button')
            .last()
            .click({ force: true });
          cy.contains('Editar').click();
          cy.url().should('include', '/edit');

          // Verify form is loaded with data
          cy.get('[data-testid="contractor-name-input"]').should('exist');
          cy.get('[data-testid="contractor-submit-button"]').should('be.visible');
          cy.contains('button', 'Cancelar').should('be.visible');
        } else {
          cy.log('No contractors found, skipping edit test');
        }
      });
    });
  });

  describe('Delete', () => {
    it('should show delete confirmation dialog', () => {
      cy.visit('/dashboard/company/contractors');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="contractors-table"] tbody tr').length > 0) {
          cy.get('[data-testid="contractors-table"] tbody tr')
            .first()
            .find('button')
            .last()
            .click({ force: true });
          cy.contains('Eliminar').click();
          cy.contains('¿Eliminar').should('be.visible');
          cy.contains('button', 'Cancelar').click();
        } else {
          cy.log('No contractors found, skipping delete test');
        }
      });
    });
  });
});
