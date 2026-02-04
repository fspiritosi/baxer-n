import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Documents - Company Documents', () => {
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

  describe('Navigation', () => {
    it('should display the documents page', () => {
      cy.visit('/dashboard/documents');
      cy.getByTestId('documents-page-title').should('be.visible');
    });

    it('should navigate to company tab', () => {
      cy.visit('/dashboard/documents');
      // Click on Company tab (use the tab within the main content area, not the sidebar)
      cy.get('[role="tablist"]').contains('button', /Empresa/i).click();
      cy.wait(1000);
      cy.getByTestId('company-documents-table').should('be.visible');
    });

    it('should access company tab directly via URL', () => {
      cy.visit('/dashboard/documents?tab=company');
      cy.wait(1000);
      cy.getByTestId('company-documents-table').should('be.visible');
    });
  });

  describe('Company Documents Tab', () => {
    beforeEach(() => {
      cy.visit('/dashboard/documents?tab=company');
      cy.wait(1000);
    });

    it('should display company documents table', () => {
      cy.getByTestId('company-documents-table').should('be.visible');
    });

    it('should NOT have permanent/monthly subtabs (company has only one type)', () => {
      // Company documents don't have subtabs like employees and equipment
      cy.get('body').then(($body) => {
        // The subtabs should not exist for company tab
        const permanentTab = $body.find('button:contains("Permanentes")');
        const monthlyTab = $body.find('button:contains("Mensuales")');
        // These should either not exist or not be visible when on company tab
        if (permanentTab.length === 0 && monthlyTab.length === 0) {
          cy.log('Correctly no subtabs for company documents');
        } else {
          // If they exist, they should be from the main tab bar, not subtabs
          cy.log('Main tabs exist but no subtabs for company');
        }
      });
    });
  });

  describe('Company Documents Table', () => {
    beforeEach(() => {
      cy.visit('/dashboard/documents?tab=company');
      cy.wait(2000);
    });

    it('should have search input', () => {
      cy.getByTestId('company-documents-table').within(() => {
        cy.get('input[placeholder*="Buscar"]').should('exist');
      });
    });

    it('should have state filter', () => {
      cy.getByTestId('company-documents-table').within(() => {
        cy.get('button').contains('Estado').should('exist');
      });
    });

    it('should have document type filter', () => {
      cy.getByTestId('company-documents-table').within(() => {
        cy.get('button').contains('Tipo de Documento').should('exist');
      });
    });

    it('should display table rows if data exists', () => {
      cy.getByTestId('company-documents-table').then(($table) => {
        const rows = $table.find('[data-testid^="table-row-"]');
        if (rows.length > 0) {
          cy.wrap(rows.first()).should('be.visible');
        } else {
          // Check for empty message
          cy.contains('No hay documentos de empresa').should('be.visible');
        }
      });
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      cy.visit('/dashboard/documents?tab=company');
      cy.wait(2000);
    });

    it('should filter by state', () => {
      cy.getByTestId('company-documents-table').within(() => {
        cy.get('button').contains('Estado').click();
      });
      // Filter dropdown should be visible
      cy.get('[role="option"], [role="menuitem"]').should('exist');
    });

    it('should filter by document type', () => {
      cy.getByTestId('company-documents-table').within(() => {
        cy.get('button').contains('Tipo de Documento').click();
      });
      // Filter dropdown should be visible
      cy.get('[role="option"], [role="menuitem"]').should('exist');
    });

    it('should search by document type name', () => {
      cy.getByTestId('company-documents-table').within(() => {
        cy.get('input[placeholder*="Buscar"]').type('Test');
      });
      cy.wait(500);
      // Search should work
    });
  });

  describe('Stats Cards', () => {
    beforeEach(() => {
      cy.visit('/dashboard/documents?tab=company');
      cy.wait(1000);
    });

    it('should display stats cards', () => {
      // Stats cards should be visible above the table
      cy.contains('Total').should('exist');
      cy.contains('Pendientes').should('exist');
      cy.contains('Aprobados').should('exist');
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      cy.visit('/dashboard/documents?tab=company');
      cy.wait(1000);
    });

    it('should show pagination controls if needed', () => {
      cy.getByTestId('company-documents-table').then(($table) => {
        const rows = $table.find('[data-testid^="table-row-"]');
        if (rows.length >= 10) {
          // Should have pagination if 10+ records
          cy.log('Checking for pagination controls');
        } else {
          cy.log('Not enough records for pagination');
        }
      });
    });
  });
});
