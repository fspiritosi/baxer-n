import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Employees CRUD', () => {
  beforeEach(() => {
    setupClerkTestingToken();

    // Sign in before each test using email_code strategy
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

  describe('List Employees', () => {
    it('should display the employees page', () => {
      cy.visit('/dashboard/employees');

      // Should show the employees header
      cy.get('[data-testid="employees-page-title"]').should('be.visible');
    });

    it('should have a button to create new employee', () => {
      cy.visit('/dashboard/employees');

      cy.get('[data-testid="new-employee-button"]').should('be.visible');
    });

    it('should show table or empty state', () => {
      cy.visit('/dashboard/employees');

      // Either table exists or empty state is shown
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="employees-table"]').length > 0) {
          cy.get('[data-testid="employees-table"]').should('exist');
          // If table exists, search input should also exist
          cy.get('[data-testid="employees-search-input"]').should('exist');
        } else {
          // Empty state
          cy.get('[data-testid="employees-empty-state"]').should('be.visible');
        }
      });
    });
  });

  describe('Create Employee', () => {
    it('should navigate to create employee page', () => {
      cy.visit('/dashboard/employees');

      cy.get('[data-testid="new-employee-button"]').click();

      cy.url().should('include', '/dashboard/employees/new');
    });

    it('should show validation errors for empty required fields', () => {
      cy.visit('/dashboard/employees/new');

      // Try to submit without filling required fields
      cy.get('[data-testid="employee-submit-button"]').click();

      // Should show validation errors
      cy.contains('El nombre es requerido').should('be.visible');
    });

    it('should display tabs for personal, contact and work data', () => {
      cy.visit('/dashboard/employees/new');

      // Check tabs exist
      cy.get('[data-testid="employee-tab-personal"]').should('be.visible');
      cy.get('[data-testid="employee-tab-contact"]').should('be.visible');
      cy.get('[data-testid="employee-tab-work"]').should('be.visible');
    });

    it('should fill the employee form and navigate through tabs', () => {
      cy.fixture('employee').then((employeeData) => {
        const { minimalEmployee } = employeeData;
        const timestamp = Date.now();

        cy.visit('/dashboard/employees/new');
        cy.wait(1000);

        // Tab 1: Personal Data - fill required fields
        cy.get('[data-testid="employee-firstname-input"]').type(`Test${timestamp}`.slice(0, 15));
        cy.get('[data-testid="employee-lastname-input"]').type(minimalEmployee.lastName);
        cy.get('[data-testid="employee-document-input"]').type(`${timestamp}`.slice(-8));
        cy.get('[data-testid="employee-cuil-input"]').type(`20${timestamp}`.slice(0, 11));
        cy.get('[data-testid="employee-birthdate-input"]').type(minimalEmployee.birthDate);

        // Select nationality
        cy.get('[data-testid="employee-nationality-select"]').click({ force: true });
        cy.get('[role="listbox"]', { timeout: 5000 }).should('be.visible');
        cy.contains('[role="option"]', 'Argentina').click({ force: true });
        cy.wait(300);

        // Select gender
        cy.get('[data-testid="employee-gender-select"]').click({ force: true });
        cy.get('[role="listbox"]', { timeout: 5000 }).should('be.visible');
        cy.contains('[role="option"]', 'Masculino').click({ force: true });
        cy.wait(300);

        // Tab 2: Contact Data - navigate and fill
        cy.get('[data-testid="employee-tab-contact"]').click({ force: true });
        cy.wait(500);
        cy.get('[data-testid="employee-street-input"]')
          .should('be.visible')
          .type(minimalEmployee.street, { force: true });
        cy.get('[data-testid="employee-streetnumber-input"]').type(minimalEmployee.streetNumber, {
          force: true,
        });
        cy.get('[data-testid="employee-postalcode-input"]').type(minimalEmployee.postalCode, {
          force: true,
        });
        cy.get('[data-testid="employee-phone-input"]').type(minimalEmployee.phone, { force: true });

        // Tab 3: Work Data - navigate and verify
        cy.get('[data-testid="employee-tab-work"]').click({ force: true });
        cy.wait(500);
        cy.get('[data-testid="employee-number-input"]').should('be.visible');
        cy.get('[data-testid="employee-hiredate-input"]').should('be.visible');

        // Verify form button exists and is clickable
        cy.get('[data-testid="employee-submit-button"]').should('exist').and('not.be.disabled');
      });
    });
  });

  describe('View Employee Detail', () => {
    it('should navigate to employee detail when clicking on view', () => {
      cy.visit('/dashboard/employees');

      // Wait for page to load
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="employees-table"]').length > 0) {
          // Click on first employee's action menu (find any action button in the table)
          cy.get('[data-testid^="employee-actions-"]').first().click({ force: true });

          // Click "Ver detalle" in dropdown
          cy.get('[data-testid^="employee-view-"]').first().click();

          // Should be on detail page
          cy.url().should('match', /\/dashboard\/employees\/[a-zA-Z0-9-]+$/);
        } else {
          // No employees, skip this test
          cy.log('No employees found, skipping detail view test');
        }
      });
    });
  });

  describe('Edit Employee', () => {
    it('should navigate to edit page from list', () => {
      cy.visit('/dashboard/employees');

      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="employees-table"]').length > 0) {
          // Click on first employee's action menu
          cy.get('[data-testid^="employee-actions-"]').first().click({ force: true });

          // Click "Editar" in dropdown
          cy.get('[data-testid^="employee-edit-"]').first().click();

          // Should be on edit page
          cy.url().should('include', '/edit');
          cy.get('[data-testid="employee-submit-button"]').should('be.visible');
        } else {
          cy.log('No employees found, skipping edit test');
        }
      });
    });

    it('should update employee information', () => {
      cy.fixture('employee').then((employeeData) => {
        const { updatedEmployee } = employeeData;
        const timestamp = Date.now();

        cy.visit('/dashboard/employees');

        cy.wait(2000);

        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="employees-table"]').length > 0) {
            // Click on first employee's action menu
            cy.get('[data-testid^="employee-actions-"]').first().click({ force: true });

            // Click "Editar" in dropdown
            cy.get('[data-testid^="employee-edit-"]').first().click();

            // Wait for edit page to load
            cy.url().should('include', '/edit');
            cy.wait(1000);

            // Update first name
            cy.get('[data-testid="employee-firstname-input"]')
              .clear()
              .type(`${updatedEmployee.firstName}${timestamp}`.slice(0, 20));

            // Go to contact tab and update phone
            cy.get('[data-testid="employee-tab-contact"]').click();
            cy.wait(500);
            cy.get('[data-testid="employee-phone-input"]').clear().type(updatedEmployee.phone);

            // Submit
            cy.get('[data-testid="employee-submit-button"]').click();

            // Should show success message
            cy.contains('Empleado actualizado exitosamente', { timeout: 15000 }).should(
              'be.visible'
            );

            // Should redirect to employees list
            cy.url({ timeout: 10000 }).should('include', '/dashboard/employees');
            cy.url().should('not.include', '/edit');
          } else {
            cy.log('No employees found, skipping update test');
          }
        });
      });
    });
  });

  describe('Delete Employee', () => {
    it('should show delete confirmation dialog', () => {
      cy.visit('/dashboard/employees');

      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="employees-table"]').length > 0) {
          // Click on first employee's action menu
          cy.get('[data-testid^="employee-actions-"]').first().click({ force: true });

          // Click "Eliminar" in dropdown
          cy.get('[data-testid^="employee-delete-"]').first().click();

          // Should show confirmation dialog
          cy.get('[data-testid="employee-delete-dialog-title"]').should('be.visible');

          // Close dialog
          cy.get('[data-testid="employee-delete-cancel"]').click();
        } else {
          cy.log('No employees found, skipping delete test');
        }
      });
    });

    it('should cancel delete when clicking cancel', () => {
      cy.visit('/dashboard/employees');

      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="employees-table"]').length > 0) {
          // Click on first employee's action menu
          cy.get('[data-testid^="employee-actions-"]').first().click({ force: true });

          // Click "Eliminar" in dropdown
          cy.get('[data-testid^="employee-delete-"]').first().click();

          // Click cancel
          cy.get('[data-testid="employee-delete-cancel"]').click();

          // Dialog should close
          cy.get('[data-testid="employee-delete-dialog"]').should('not.exist');

          // Table should still exist
          cy.get('[data-testid="employees-table"]').should('exist');
        } else {
          cy.log('No employees found, skipping cancel delete test');
        }
      });
    });
  });

  describe('Search Employees', () => {
    it('should filter employees by search term', () => {
      cy.visit('/dashboard/employees');

      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="employees-table"]').length > 0) {
          // Get the name of first employee
          cy.get('[data-testid^="employee-name-"]')
            .first()
            .invoke('text')
            .then((name) => {
              // Search for part of the name
              const searchTerm = (name as string).split(',')[0].trim().slice(0, 3);
              cy.get('[data-testid="employees-search-input"]').type(searchTerm);

              // Should still show results containing the search term
              cy.get('[data-testid="employees-table"] tbody tr').should('have.length.at.least', 1);
            });
        } else {
          cy.log('No employees found, skipping search test');
        }
      });
    });
  });
});
