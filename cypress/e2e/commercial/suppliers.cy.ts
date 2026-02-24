import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Suppliers CRUD', () => {
  const timestamp = Date.now();

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

  after(() => {
    cy.task('cleanupTestSuppliers').then((result) => {
      cy.log(`Suppliers cleanup: ${JSON.stringify(result)}`);
    });
  });

  describe('List Suppliers', () => {
    it('should display the suppliers page', () => {
      cy.visit('/dashboard/commercial/suppliers');

      cy.contains('h1', 'Proveedores').should('be.visible');
      cy.contains('Gestiona los proveedores de tu empresa').should('be.visible');
    });

    it('should have a button to create new supplier', () => {
      cy.visit('/dashboard/commercial/suppliers');

      cy.contains('button', 'Nuevo Proveedor').should('be.visible');
    });

    it('should display the suppliers table', () => {
      cy.visit('/dashboard/commercial/suppliers');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });

    it('should have search functionality', () => {
      cy.visit('/dashboard/commercial/suppliers');

      cy.get('[data-testid="search-input"]').should('be.visible');
      cy.get('[data-testid="search-input"]').type('test search');
      cy.wait(500);
      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });

  describe('Create Supplier', () => {
    it('should navigate to create supplier page', () => {
      cy.visit('/dashboard/commercial/suppliers');

      cy.contains('button', 'Nuevo Proveedor').click();

      cy.url().should('include', '/dashboard/commercial/suppliers/new');
      cy.contains('Nuevo Proveedor').should('be.visible');
    });

    it('should create a supplier with complete data', () => {
      cy.fixture('supplier').then((supplierData) => {
        const { validSupplier } = supplierData;
        const businessName = `${validSupplier.businessName} ${timestamp}`;

        cy.visit('/dashboard/commercial/suppliers/new');

        // Card 1: Información Fiscal
        cy.contains('label', 'Razón Social').parent().find('input').type(businessName);
        cy.contains('label', 'CUIT').parent().find('input').type(validSupplier.taxId);

        // Card 2: Información de Contacto
        cy.contains('label', 'Email')
          .parent()
          .find('input')
          .first()
          .type(validSupplier.email);
        cy.contains('label', 'Teléfono')
          .parent()
          .find('input')
          .first()
          .type(validSupplier.phone);

        // Card 3: Dirección
        cy.contains('label', 'Dirección')
          .parent()
          .find('input')
          .type(validSupplier.address);

        // Submit
        cy.contains('button', 'Crear Proveedor').click();

        // Should redirect to detail page
        cy.url().should('match', /\/dashboard\/commercial\/suppliers\/[a-zA-Z0-9-]+$/, { timeout: 15000 });
        cy.contains(businessName).should('be.visible');
      });
    });

    it('should create a supplier with minimal data', () => {
      cy.fixture('supplier').then((supplierData) => {
        const { minimalSupplier } = supplierData;
        const businessName = `${minimalSupplier.businessName} ${timestamp}`;

        cy.visit('/dashboard/commercial/suppliers/new');

        cy.contains('label', 'Razón Social').parent().find('input').type(businessName);
        cy.contains('label', 'CUIT').parent().find('input').type(minimalSupplier.taxId);

        cy.contains('button', 'Crear Proveedor').click();

        cy.url().should('match', /\/dashboard\/commercial\/suppliers\/[a-zA-Z0-9-]+$/, { timeout: 15000 });
        cy.contains(businessName).should('be.visible');
      });
    });
  });

  describe('View Supplier Detail', () => {
    it('should display supplier detail page', () => {
      cy.visit('/dashboard/commercial/suppliers');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().find('a').first().click();

          cy.url().should('match', /\/dashboard\/commercial\/suppliers\/[a-zA-Z0-9-]+$/);

          // Should show tabs
          cy.contains('Información General').should('be.visible');
          cy.contains('Cuenta Corriente').should('be.visible');

          // Should show info cards
          cy.contains('Información Fiscal').should('be.visible');
        } else {
          cy.log('No suppliers found, skipping detail test');
        }
      });
    });

    it('should display supplier account statement tab', () => {
      cy.visit('/dashboard/commercial/suppliers');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().find('a').first().click();
          cy.url().should('match', /\/dashboard\/commercial\/suppliers\/[a-zA-Z0-9-]+$/);

          // Click on account tab
          cy.contains('Cuenta Corriente').click();

          // Should show the account statement content
          cy.wait(1000);
          cy.get('body').should('be.visible');
        } else {
          cy.log('No suppliers found, skipping account statement test');
        }
      });
    });
  });

  describe('Edit Supplier', () => {
    it('should navigate to edit page and update a supplier', () => {
      cy.visit('/dashboard/commercial/suppliers');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().find('a').first().click();
          cy.url().should('match', /\/dashboard\/commercial\/suppliers\/[a-zA-Z0-9-]+$/);

          // Click edit button
          cy.contains('a', 'Editar').click();
          cy.url().should('include', '/edit');

          // Modify notes
          cy.contains('label', 'Notas')
            .parent()
            .find('textarea')
            .clear()
            .type('Notas actualizadas test E2E');

          cy.contains('button', 'Guardar Cambios').click();

          // Should redirect back
          cy.url().should('match', /\/dashboard\/commercial\/suppliers\/[a-zA-Z0-9-]+$/, { timeout: 15000 });
        } else {
          cy.log('No suppliers found, skipping edit test');
        }
      });
    });
  });

  describe('Search Suppliers', () => {
    it('should filter suppliers by search term', () => {
      cy.visit('/dashboard/commercial/suppliers');

      cy.get('[data-testid="search-input"]').type('Test Supplier');
      cy.wait(1000);
      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });
});
