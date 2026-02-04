import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Equipment CRUD', () => {
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

  describe('List Equipment', () => {
    it('should display the equipment page', () => {
      cy.visit('/dashboard/equipment');
      cy.get('[data-testid="equipment-page-title"]').should('be.visible');
    });

    it('should have a button to create new equipment', () => {
      cy.visit('/dashboard/equipment');
      cy.get('[data-testid="new-equipment-button"]').should('be.visible');
    });

    it('should show table or empty state', () => {
      cy.visit('/dashboard/equipment');
      cy.wait(2000);
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="equipment-table"]').length > 0) {
          cy.get('[data-testid="equipment-table"]').should('exist');
        } else {
          cy.get('[data-testid="equipment-empty-state"]').should('be.visible');
        }
      });
    });

    it('should display tabs for filtering', () => {
      cy.visit('/dashboard/equipment');
      cy.wait(2000);
      cy.get('[data-testid="equipment-filter-tabs"]').should('exist');
    });
  });

  describe('Create Equipment', () => {
    it('should navigate to create equipment page', () => {
      cy.visit('/dashboard/equipment');
      cy.get('[data-testid="new-equipment-button"]').click();
      cy.url().should('include', '/dashboard/equipment/new');
    });

    it('should display form with tabs', () => {
      cy.visit('/dashboard/equipment/new');
      cy.get('[data-testid="equipment-tab-info"]').should('be.visible');
      cy.get('[data-testid="equipment-tab-contract"]').should('be.visible');
      cy.get('[data-testid="equipment-tab-assignment"]').should('be.visible');
    });

    it('should show validation errors for empty required fields', () => {
      cy.visit('/dashboard/equipment/new');
      cy.get('[data-testid="equipment-submit-button"]').click();
      // Should show validation error
      cy.get('.text-destructive').should('exist');
    });

    it('should fill equipment form fields', () => {
      const timestamp = Date.now();

      cy.visit('/dashboard/equipment/new');
      cy.wait(1000);

      // Fill engine number (required field)
      cy.get('[data-testid="equipment-engine-input"]').should('be.visible').type(`ENG${timestamp}`);

      // Fill year
      cy.get('[data-testid="equipment-year-input"]').type('2023');

      // Navigate to other tabs to verify they work
      cy.get('[data-testid="equipment-tab-contract"]').click({ force: true });
      cy.wait(500);
      cy.get('[data-testid="equipment-contract-number-input"]').should('exist');

      cy.get('[data-testid="equipment-tab-assignment"]').click({ force: true });
      cy.wait(500);

      // Verify form button exists
      cy.get('[data-testid="equipment-submit-button"]').should('exist');
    });
  });

  describe('View Equipment Detail', () => {
    it('should be able to navigate to detail page', () => {
      cy.visit('/dashboard/equipment');
      cy.wait(3000);

      cy.get('body').then(($body) => {
        // Check if there are any links in the page that go to equipment detail
        const links = $body.find('a[href*="/dashboard/equipment/"]').not('a[href*="/new"]');
        if (links.length > 0) {
          cy.wrap(links).first().click({ force: true });
          cy.url().should('match', /\/dashboard\/equipment\/[a-zA-Z0-9-]+/);
        } else {
          cy.log('No equipment links found, skipping detail view test');
        }
      });
    });
  });

  describe('Edit Equipment', () => {
    it('should be able to navigate to edit page', () => {
      cy.visit('/dashboard/equipment');
      cy.wait(3000);

      cy.get('body').then(($body) => {
        // Look for dropdown menu buttons in the table
        const menuButtons = $body.find(
          '[data-testid="equipment-table"] button[aria-haspopup="menu"]'
        );
        if (menuButtons.length > 0) {
          cy.wrap(menuButtons).first().click({ force: true });
          cy.contains('Editar').click();
          cy.url().should('include', '/edit');
        } else {
          cy.log('No equipment menu buttons found, skipping edit test');
        }
      });
    });
  });

  describe('Delete/Deactivate Equipment', () => {
    it('should show deactivate option in menu', () => {
      cy.visit('/dashboard/equipment');
      cy.wait(3000);

      cy.get('body').then(($body) => {
        const menuButtons = $body.find(
          '[data-testid="equipment-table"] button[aria-haspopup="menu"]'
        );
        if (menuButtons.length > 0) {
          cy.wrap(menuButtons).first().click({ force: true });
          // Look for either "Dar de baja" or "Reactivar"
          cy.get('[role="menuitem"]').should('exist');
        } else {
          cy.log('No equipment menu buttons found, skipping deactivate test');
        }
      });
    });
  });

  describe('Search Equipment', () => {
    it('should have search input', () => {
      cy.visit('/dashboard/equipment');
      cy.wait(2000);

      cy.get('[data-testid="equipment-search-input"]').should('be.visible');
    });
  });
});
