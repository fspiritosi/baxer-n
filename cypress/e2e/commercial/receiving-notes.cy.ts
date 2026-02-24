import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Remitos de Recepción', () => {
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
    cy.task('cleanupTestReceivingNotes').then((result) => {
      cy.log(`Cleanup receiving notes: ${JSON.stringify(result)}`);
    });
  });

  describe('List Receiving Notes', () => {
    it('should navigate to the receiving notes page', () => {
      cy.visit('/dashboard/commercial/receiving-notes');

      cy.contains('h1', 'Remitos de Recepción').should('be.visible');
    });

    it('should have a button to create a new receiving note', () => {
      cy.visit('/dashboard/commercial/receiving-notes');

      cy.contains('Nuevo Remito').should('be.visible');
    });

    it('should display the receiving notes table', () => {
      cy.visit('/dashboard/commercial/receiving-notes');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });

  describe('Create Receiving Note', () => {
    it('should navigate to the create page', () => {
      cy.visit('/dashboard/commercial/receiving-notes');

      cy.contains('Nuevo Remito').click();
      cy.url().should('include', '/receiving-notes/new');
    });

    it('should display the creation form with required fields', () => {
      cy.visit('/dashboard/commercial/receiving-notes/new');

      cy.contains('h1', 'Nuevo Remito de Recepción').should('be.visible');
      cy.contains('label', 'Proveedor').should('be.visible');
      cy.contains('label', 'Almacén').should('be.visible');
      cy.contains('label', 'Fecha de Recepción').should('be.visible');
      cy.contains('label', 'Observaciones').should('be.visible');
    });

    it('should display the three source type options', () => {
      cy.visit('/dashboard/commercial/receiving-notes/new');

      cy.contains('Tipo de Origen').should('be.visible');
      cy.contains('Orden de Compra').should('be.visible');
      cy.contains('Factura de Compra').should('be.visible');
      cy.contains('Sin documento').should('be.visible');
    });

    it('should go back to the list when clicking cancel', () => {
      cy.visit('/dashboard/commercial/receiving-notes/new');

      cy.contains('button', 'Cancelar').click();

      // Should navigate back to the list
      cy.url().should('include', '/receiving-notes');
    });
  });
});
