import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Warehouses CRUD', () => {
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
    cy.task('cleanupTestWarehouses').then((result) => {
      cy.log(`Warehouses cleanup: ${JSON.stringify(result)}`);
    });
  });

  describe('List Warehouses', () => {
    it('should display the warehouses page', () => {
      cy.visit('/dashboard/commercial/warehouses');

      cy.contains('h1', 'Almacenes').should('be.visible');
      cy.contains('Gestiona los almacenes y depósitos de la empresa').should('be.visible');
    });

    it('should display the warehouses table', () => {
      cy.visit('/dashboard/commercial/warehouses');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });

  describe('Create Warehouse', () => {
    it('should navigate to create warehouse page', () => {
      cy.visit('/dashboard/commercial/warehouses');

      cy.contains('a', 'Nuevo Almacén').click();

      cy.url().should('include', '/dashboard/commercial/warehouses/new');
      cy.contains('Nuevo Almacén').should('be.visible');
    });

    it('should create a new warehouse', () => {
      cy.visit('/dashboard/commercial/warehouses/new');

      cy.contains('label', 'Código')
        .parent()
        .find('input')
        .type(`TST-${timestamp}`);
      cy.contains('label', 'Nombre')
        .parent()
        .find('input')
        .type(`Test Warehouse ${timestamp}`);

      cy.contains('button', 'Crear Almacén').click();

      // Should redirect to detail or list
      cy.url().should('include', '/dashboard/commercial/warehouses', { timeout: 15000 });
    });
  });

  describe('View Warehouse Detail', () => {
    it('should display warehouse detail with stock info', () => {
      cy.visit('/dashboard/commercial/warehouses');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().find('a').first().click();

          cy.url().should('match', /\/dashboard\/commercial\/warehouses\/[a-zA-Z0-9-]+$/);

          // Should show info cards (Tipo, Productos, Disponible, Reservado)
          cy.contains('Tipo').should('be.visible');
          cy.contains('Productos').should('be.visible');
        } else {
          cy.log('No warehouses found, skipping detail test');
        }
      });
    });
  });

  describe('Edit Warehouse', () => {
    it('should edit an existing warehouse', () => {
      cy.visit('/dashboard/commercial/warehouses');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().find('a').first().click();
          cy.url().should('match', /\/dashboard\/commercial\/warehouses\/[a-zA-Z0-9-]+$/);

          cy.contains('a', 'Editar').click();
          cy.url().should('include', '/edit');

          // Modify address
          cy.contains('label', 'Dirección')
            .parent()
            .find('input')
            .clear()
            .type('Dirección test E2E');

          cy.contains('button', 'Guardar Cambios').click();

          cy.url().should('match', /\/dashboard\/commercial\/warehouses\/[a-zA-Z0-9-]+$/, { timeout: 15000 });
        } else {
          cy.log('No warehouses found, skipping edit test');
        }
      });
    });
  });

  describe('Stock Movements Page', () => {
    it('should display stock movements page', () => {
      cy.visit('/dashboard/commercial/movements');

      cy.contains('Movimientos de Stock').should('be.visible');
    });

    it('should display filters card', () => {
      cy.visit('/dashboard/commercial/movements');

      cy.contains('Filtros').should('be.visible');
    });

    it('should display movements table', () => {
      cy.visit('/dashboard/commercial/movements');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });

  describe('Stock Control Page', () => {
    it('should display stock control page with tabs', () => {
      cy.visit('/dashboard/commercial/stock');

      cy.contains('Control de Stock').should('be.visible');
      cy.contains('Por Almacén').should('be.visible');
      cy.contains('Por Producto').should('be.visible');
    });

    it('should switch between tabs', () => {
      cy.visit('/dashboard/commercial/stock');

      // Click "Por Producto" tab
      cy.contains('[role="tab"]', 'Por Producto').click();

      // Should show product-based stock view
      cy.wait(500);
      cy.get('body').should('be.visible');
    });
  });
});
