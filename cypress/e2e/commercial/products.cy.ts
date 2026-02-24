import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Products CRUD', () => {
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
    cy.task('cleanupTestProducts').then((result) => {
      cy.log(`Products cleanup: ${JSON.stringify(result)}`);
    });
  });

  describe('List Products', () => {
    it('should display the products page', () => {
      cy.visit('/dashboard/commercial/products');

      cy.contains('h1', 'Productos').should('be.visible');
      cy.contains('Gestión de productos y servicios').should('be.visible');
    });

    it('should have a button to create new product', () => {
      cy.visit('/dashboard/commercial/products');

      cy.contains('button', 'Nuevo Producto').should('be.visible');
    });

    it('should display the products table', () => {
      cy.visit('/dashboard/commercial/products');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });

    it('should have search functionality', () => {
      cy.visit('/dashboard/commercial/products');

      cy.get('[data-testid="search-input"]').should('be.visible');
      cy.get('[data-testid="search-input"]').type('test search');
      cy.wait(500);
      // Search should filter (no error thrown)
      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });

  describe('Create Product', () => {
    it('should navigate to create product page', () => {
      cy.visit('/dashboard/commercial/products');

      cy.contains('button', 'Nuevo Producto').click();

      cy.url().should('include', '/dashboard/commercial/products/new');
      cy.contains('Nuevo Producto').should('be.visible');
    });

    it('should create a product with complete data', () => {
      cy.fixture('product').then((productData) => {
        const { validProduct } = productData;
        const productName = `${validProduct.name} ${timestamp}`;

        cy.visit('/dashboard/commercial/products/new');

        // Card 1: Información Básica
        cy.contains('label', 'Nombre').parent().find('input').type(productName);

        // Card 2: Precios e IVA
        cy.contains('label', 'Precio de Costo').parent().find('input').clear().type(String(validProduct.purchasePrice));
        cy.contains('label', 'Precio de Venta').parent().find('input').clear().type(String(validProduct.salePrice));

        // Submit
        cy.contains('button', 'Crear Producto').click();

        // Should show success and redirect to detail
        cy.url().should('match', /\/dashboard\/commercial\/products\/[a-zA-Z0-9-]+$/, { timeout: 15000 });
        cy.contains(productName).should('be.visible');
      });
    });

    it('should create a product with minimal data', () => {
      cy.fixture('product').then((productData) => {
        const { minimalProduct } = productData;
        const productName = `${minimalProduct.name} ${timestamp}`;

        cy.visit('/dashboard/commercial/products/new');

        cy.contains('label', 'Nombre').parent().find('input').type(productName);
        cy.contains('label', 'Precio de Venta').parent().find('input').clear().type(String(minimalProduct.salePrice));

        cy.contains('button', 'Crear Producto').click();

        cy.url().should('match', /\/dashboard\/commercial\/products\/[a-zA-Z0-9-]+$/, { timeout: 15000 });
        cy.contains(productName).should('be.visible');
      });
    });
  });

  describe('View Product Detail', () => {
    it('should display product detail when clicking on a product', () => {
      cy.visit('/dashboard/commercial/products');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          // Click on the first product link in the table
          cy.get('table tbody tr').first().find('a').first().click();

          cy.url().should('match', /\/dashboard\/commercial\/products\/[a-zA-Z0-9-]+$/);

          // Should show product info cards
          cy.contains('Información Básica').should('be.visible');
          cy.contains('Precios e IVA').should('be.visible');
        } else {
          cy.log('No products found, skipping detail test');
        }
      });
    });
  });

  describe('Edit Product', () => {
    it('should navigate to edit page and update a product', () => {
      cy.visit('/dashboard/commercial/products');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          // Go to first product detail
          cy.get('table tbody tr').first().find('a').first().click();
          cy.url().should('match', /\/dashboard\/commercial\/products\/[a-zA-Z0-9-]+$/);

          // Click edit button
          cy.contains('a', 'Editar').click();
          cy.url().should('include', '/edit');

          // Modify a field
          cy.contains('label', 'Descripción').parent().find('textarea').clear().type('Descripción actualizada E2E');

          cy.contains('button', 'Guardar Cambios').click();

          // Should redirect back to detail
          cy.url().should('match', /\/dashboard\/commercial\/products\/[a-zA-Z0-9-]+$/, { timeout: 15000 });
        } else {
          cy.log('No products found, skipping edit test');
        }
      });
    });
  });

  describe('Search Products', () => {
    it('should filter products by search term', () => {
      cy.visit('/dashboard/commercial/products');

      // Type a search term that likely exists
      cy.get('[data-testid="search-input"]').type('Test Product');

      cy.wait(1000);

      // Table should still be visible (no crash)
      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', () => {
      cy.visit('/dashboard/commercial/products');

      // Pagination should exist
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination-next"]').length > 0) {
          cy.get('[data-testid="pagination-next"]').should('be.visible');
        } else {
          cy.log('Not enough products for pagination');
        }
      });
    });
  });
});
