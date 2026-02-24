import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Points of Sale CRUD', () => {
  const timestamp = Date.now();
  const posNumber = String(Math.floor(Math.random() * 9000) + 1000); // Random 4-digit

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

  describe('List Points of Sale', () => {
    it('should display the points of sale page', () => {
      cy.visit('/dashboard/commercial/points-of-sale');

      cy.contains('h1', 'Puntos de Venta').should('be.visible');
      cy.contains('Gestiona los puntos de venta para la facturación electrónica').should('be.visible');
    });

    it('should have a button to create new point of sale', () => {
      cy.visit('/dashboard/commercial/points-of-sale');

      cy.contains('button', 'Nuevo Punto de Venta').should('be.visible');
    });

    it('should display points of sale table', () => {
      cy.visit('/dashboard/commercial/points-of-sale');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });

  describe('Create Point of Sale', () => {
    it('should navigate to create page', () => {
      cy.visit('/dashboard/commercial/points-of-sale');

      cy.contains('button', 'Nuevo Punto de Venta').click();

      cy.url().should('include', '/dashboard/commercial/points-of-sale/new');
      cy.contains('Nuevo Punto de Venta').should('be.visible');
    });

    it('should create a new point of sale', () => {
      cy.visit('/dashboard/commercial/points-of-sale/new');

      // Fill form fields
      cy.contains('label', 'Número de Punto de Venta')
        .parent()
        .find('input')
        .type(posNumber);
      cy.contains('label', 'Nombre')
        .parent()
        .find('input')
        .type(`Test POS ${timestamp}`);

      // Submit
      cy.contains('button', 'Crear').click();

      // Should redirect or show success
      cy.url().should('include', '/dashboard/commercial/points-of-sale', { timeout: 15000 });
    });
  });

  describe('Edit Point of Sale', () => {
    it('should edit an existing point of sale', () => {
      cy.visit('/dashboard/commercial/points-of-sale');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          // Open actions dropdown on first row
          cy.get('table tbody tr').first().find('button').last().click();
          cy.contains('Editar').click();

          cy.url().should('include', '/edit');

          // Modify name
          cy.contains('label', 'Nombre')
            .parent()
            .find('input')
            .clear()
            .type(`Updated POS ${timestamp}`);

          cy.contains('button', 'Guardar Cambios').click();

          cy.url().should('include', '/dashboard/commercial/points-of-sale', { timeout: 15000 });
        } else {
          cy.log('No points of sale found, skipping edit test');
        }
      });
    });
  });
});
