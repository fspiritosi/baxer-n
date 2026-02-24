import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Checks', () => {
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

  describe('List Checks', () => {
    it('should display the checks page', () => {
      cy.visit('/dashboard/commercial/treasury/checks');

      cy.contains('h1', 'Cheques').should('be.visible');
      cy.contains('Gestión de cartera de cheques propios y de terceros').should('be.visible');
    });

    it('should display KPI summary cards', () => {
      cy.visit('/dashboard/commercial/treasury/checks');

      cy.contains('En Cartera').should('be.visible');
      cy.contains('Depositados').should('be.visible');
      cy.contains('Vencidos').should('be.visible');
    });

    it('should display the checks table', () => {
      cy.visit('/dashboard/commercial/treasury/checks');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });

    it('should have a button to create new check', () => {
      cy.visit('/dashboard/commercial/treasury/checks');

      cy.contains('button', 'Nuevo Cheque').should('be.visible');
    });
  });

  describe('Create Check', () => {
    it('should open create modal with all fields', () => {
      cy.visit('/dashboard/commercial/treasury/checks');

      cy.contains('button', 'Nuevo Cheque').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Nuevo Cheque').should('be.visible');

      // Verify form fields are present
      cy.contains('Tipo de Cheque').should('be.visible');
      cy.contains('Número de Cheque').should('be.visible');
      cy.contains('Banco').should('be.visible');
      cy.contains('Monto').should('be.visible');
      cy.contains('Librador').should('be.visible');
      cy.contains('Fecha de Emisión').should('be.visible');
      cy.contains('Fecha de Vencimiento').should('be.visible');
    });

    it('should create a check successfully', () => {
      cy.visit('/dashboard/commercial/treasury/checks');

      cy.contains('button', 'Nuevo Cheque').click();
      cy.get('[role="dialog"]').should('be.visible');

      const ts = Date.now();

      // Fill form
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[name="checkNumber"]').type(`CHK-${ts}`);
        cy.get('input[name="bankName"]').type('Banco Nación');
        cy.get('input[name="amount"]').type('50000');
        cy.get('input[name="drawerName"]').type(`Test Drawer ${ts}`);
      });

      cy.contains('button', 'Crear Cheque').click();
      cy.get('[data-sonner-toast]').should('contain.text', 'Cheque creado correctamente');
    });
  });

  describe('Check Actions', () => {
    it('should open detail modal from dropdown', () => {
      cy.visit('/dashboard/commercial/treasury/checks');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().find('button').last().click();
          cy.contains('Ver Detalle').click();
          cy.get('[role="dialog"]').should('be.visible');
          cy.contains('Detalle de Cheque').should('be.visible');
        } else {
          cy.log('No checks found, skipping detail test');
        }
      });
    });
  });
});
