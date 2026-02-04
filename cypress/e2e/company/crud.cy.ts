import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Company CRUD', () => {
  beforeEach(() => {
    setupClerkTestingToken();

    // Sign in before each test using email_code strategy
    // This works with +clerk_test emails using code 424242
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

  describe('List Companies', () => {
    it('should display the companies page', () => {
      cy.visit('/dashboard/companies');

      // Should show the companies header
      cy.get('[data-testid="companies-page-title"]').should('be.visible');
      cy.get('[data-testid="companies-page-description"]').should('be.visible');
    });

    it('should have a button to create new company', () => {
      cy.visit('/dashboard/companies');

      cy.get('[data-testid="new-company-button"]').should('be.visible');
    });
  });

  describe('Create Company', () => {
    it('should navigate to create company page', () => {
      cy.visit('/dashboard/companies');

      cy.get('[data-testid="new-company-button"]').click();

      cy.url().should('include', '/dashboard/companies/new');
      cy.get('[data-testid="company-new-page-title"]').should('be.visible');
    });

    it('should show validation error for empty name', () => {
      cy.visit('/dashboard/companies/new');

      // Try to submit without filling name
      cy.get('[data-testid="company-submit-button"]').click();

      // Should show validation error
      cy.get('[data-testid="company-name-error"]').should('be.visible');
    });

    it('should create a new company with minimal data', () => {
      cy.fixture('company').then((companyData) => {
        const { minimalCompany } = companyData;
        const timestamp = Date.now();
        const companyName = `${minimalCompany.name} ${timestamp}`;

        cy.visit('/dashboard/companies/new');

        // Fill only required field (name)
        cy.get('[data-testid="company-name-input"]').type(companyName);

        // Submit
        cy.get('[data-testid="company-submit-button"]').click();

        // Should show success message
        cy.contains('Empresa creada correctamente', { timeout: 10000 }).should('be.visible');

        // Should redirect to company detail page
        cy.url().should('match', /\/dashboard\/companies\/[a-zA-Z0-9-]+$/);

        // Should display the company name
        cy.get('[data-testid="company-detail-title"]').should('contain', companyName);
      });
    });

    it('should display all form fields for full data entry', () => {
      cy.fixture('company').then((companyData) => {
        const { validCompany } = companyData;

        cy.visit('/dashboard/companies/new');
        cy.get('[data-testid="company-form"]').should('be.visible');

        // Verify all input fields exist and are fillable
        cy.get('[data-testid="company-name-input"]').should('be.visible');
        cy.get('[data-testid="company-taxid-input"]').should('be.visible');
        cy.get('[data-testid="company-industry-input"]').should('be.visible');
        cy.get('[data-testid="company-email-input"]').should('be.visible');
        cy.get('[data-testid="company-phone-input"]').should('be.visible');
        cy.get('[data-testid="company-country-input"]').should('be.visible');
        cy.get('[data-testid="company-address-input"]').should('be.visible');
        cy.get('[data-testid="company-description-input"]').should('be.visible');

        // Verify submit and cancel buttons exist
        cy.get('[data-testid="company-submit-button"]').should('be.visible');
        cy.get('[data-testid="company-cancel-button"]').should('be.visible');
      });
    });
  });

  describe('View Company', () => {
    it('should display company details', () => {
      const timestamp = Date.now();
      const companyName = `View Test ${timestamp}`;

      // First create a company
      cy.visit('/dashboard/companies/new');
      cy.get('[data-testid="company-name-input"]').type(companyName);
      cy.get('[data-testid="company-submit-button"]').click();

      // Wait for redirect
      cy.url({ timeout: 10000 }).should('match', /\/dashboard\/companies\/[a-zA-Z0-9-]+$/);

      // Verify we're on the detail page
      cy.get('[data-testid="company-detail-title"]').should('contain', companyName);
      cy.get('[data-testid="company-general-info-title"]').should('be.visible');
      cy.get('[data-testid="company-owner-badge"]').should('be.visible');
    });

    it('should show edit and delete buttons for owner', () => {
      const timestamp = Date.now();
      const companyName = `Owner Test ${timestamp}`;

      // Create a company
      cy.visit('/dashboard/companies/new');
      cy.get('[data-testid="company-name-input"]').type(companyName);
      cy.get('[data-testid="company-submit-button"]').click();

      // Wait for redirect
      cy.url({ timeout: 10000 }).should('match', /\/dashboard\/companies\/[a-zA-Z0-9-]+$/);

      // Should show edit and delete buttons
      cy.get('[data-testid="company-edit-button"]').should('be.visible');
      cy.get('[data-testid="company-delete-button"]').should('be.visible');
    });
  });

  describe('Edit Company', () => {
    it('should navigate to edit page', () => {
      const timestamp = Date.now();
      const companyName = `Edit Nav Test ${timestamp}`;

      // Create a company
      cy.visit('/dashboard/companies/new');
      cy.get('[data-testid="company-name-input"]').type(companyName);
      cy.get('[data-testid="company-submit-button"]').click();

      // Wait for detail page
      cy.url({ timeout: 10000 }).should('match', /\/dashboard\/companies\/[a-zA-Z0-9-]+$/);

      // Click edit button
      cy.get('[data-testid="company-edit-button"]').click();

      // Should be on edit page
      cy.url().should('include', '/edit');
      cy.get('[data-testid="company-edit-page-title"]').should('be.visible');
    });

    it('should update company information', () => {
      cy.fixture('company').then((companyData) => {
        const { updatedCompany } = companyData;
        const timestamp = Date.now();
        const originalName = `Original ${timestamp}`;
        const updatedName = `${updatedCompany.name} ${timestamp}`;

        // Create a company
        cy.visit('/dashboard/companies/new');
        cy.get('[data-testid="company-name-input"]').type(originalName);
        cy.get('[data-testid="company-submit-button"]').click();

        // Wait for detail page
        cy.url({ timeout: 10000 }).should('match', /\/dashboard\/companies\/[a-zA-Z0-9-]+$/);

        // Go to edit page
        cy.get('[data-testid="company-edit-button"]').click();
        cy.url().should('include', '/edit');

        // Update fields
        cy.get('[data-testid="company-name-input"]').clear().type(updatedName);
        cy.get('[data-testid="company-industry-input"]').clear().type(updatedCompany.industry);
        cy.get('[data-testid="company-description-input"]')
          .clear()
          .type(updatedCompany.description);

        // Submit
        cy.get('[data-testid="company-submit-button"]').click();

        // Should show success message
        cy.contains('Empresa actualizada correctamente', { timeout: 10000 }).should('be.visible');

        // Should redirect to detail page with updated info
        cy.url().should('match', /\/dashboard\/companies\/[a-zA-Z0-9-]+$/);
        cy.url().should('not.include', '/edit');
        cy.get('[data-testid="company-detail-title"]').should('contain', updatedName);
        cy.contains(updatedCompany.industry).should('be.visible');
      });
    });
  });

  describe('Delete Company', () => {
    it('should show confirmation dialog before delete', () => {
      const timestamp = Date.now();
      const companyName = `Delete Dialog Test ${timestamp}`;

      // Create a company
      cy.visit('/dashboard/companies/new');
      cy.get('[data-testid="company-name-input"]').type(companyName);
      cy.get('[data-testid="company-submit-button"]').click();

      // Wait for detail page
      cy.url({ timeout: 10000 }).should('match', /\/dashboard\/companies\/[a-zA-Z0-9-]+$/);

      // Click delete button
      cy.get('[data-testid="company-delete-button"]').click();

      // Should show confirmation dialog
      cy.get('[data-testid="company-delete-dialog-title"]').should('be.visible');
      cy.get('[data-testid="company-delete-dialog-name"]').should('contain', companyName);
      cy.get('[data-testid="company-delete-dialog-description"]').should('be.visible');
    });

    it('should cancel delete when clicking cancel', () => {
      const timestamp = Date.now();
      const companyName = `Cancel Delete Test ${timestamp}`;

      // Create a company
      cy.visit('/dashboard/companies/new');
      cy.get('[data-testid="company-name-input"]').type(companyName);
      cy.get('[data-testid="company-submit-button"]').click();

      // Wait for detail page
      cy.url({ timeout: 10000 }).should('match', /\/dashboard\/companies\/[a-zA-Z0-9-]+$/);

      // Click delete button
      cy.get('[data-testid="company-delete-button"]').click();

      // Click cancel
      cy.get('[data-testid="company-delete-cancel"]').click();

      // Should still be on detail page
      cy.url().should('match', /\/dashboard\/companies\/[a-zA-Z0-9-]+$/);
      cy.get('[data-testid="company-detail-title"]').should('contain', companyName);
    });

    it('should delete company when confirmed', () => {
      const timestamp = Date.now();
      const companyName = `Delete Confirm Test ${timestamp}`;

      // Create a company
      cy.visit('/dashboard/companies/new');
      cy.get('[data-testid="company-name-input"]').type(companyName);
      cy.get('[data-testid="company-submit-button"]').click();

      // Wait for detail page
      cy.url({ timeout: 10000 }).should('match', /\/dashboard\/companies\/[a-zA-Z0-9-]+$/);

      // Click delete button
      cy.get('[data-testid="company-delete-button"]').click();

      // Confirm delete in dialog
      cy.get('[data-testid="company-delete-confirm"]').click();

      // Should show success message
      cy.contains('Empresa eliminada correctamente', { timeout: 10000 }).should('be.visible');

      // Should redirect to companies list
      cy.url().should('eq', Cypress.config().baseUrl + '/dashboard/companies');

      // Company should not be in the list
      cy.contains(companyName).should('not.exist');
    });
  });

  describe('Company Selector', () => {
    it('should show company selector in sidebar', () => {
      // Just verify the selector exists on any page with sidebar
      cy.visit('/dashboard/companies');

      // The company selector should exist in the sidebar
      cy.get('[data-testid="company-selector"]').should('exist');
    });
  });
});
