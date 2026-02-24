import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Cashflow Projections', () => {
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

  describe('List Projections', () => {
    it('should display the projections page', () => {
      cy.visit('/dashboard/commercial/treasury/projections');

      cy.contains('h1', 'Proyecciones de Cashflow').should('be.visible');
      cy.contains('Gestión de proyecciones de flujo de caja').should('be.visible');
    });

    it('should display KPI summary cards', () => {
      cy.visit('/dashboard/commercial/treasury/projections');

      cy.contains('Total Ingresos Proyectados').should('be.visible');
      cy.contains('Total Egresos Proyectados').should('be.visible');
      cy.contains('Balance Neto').should('be.visible');
    });

    it('should display the projections table', () => {
      cy.visit('/dashboard/commercial/treasury/projections');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });

    it('should have a button to create new projection', () => {
      cy.visit('/dashboard/commercial/treasury/projections');

      cy.contains('button', 'Nueva Proyección').should('be.visible');
    });
  });

  describe('Create Projection', () => {
    it('should open create modal with all fields', () => {
      cy.visit('/dashboard/commercial/treasury/projections');

      cy.contains('button', 'Nueva Proyección').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Nueva Proyección de Cashflow').should('be.visible');

      // Verify form fields
      cy.contains('Tipo').should('be.visible');
      cy.contains('Categoría').should('be.visible');
      cy.contains('Descripción').should('be.visible');
      cy.contains('Monto').should('be.visible');
      cy.contains('Fecha').should('be.visible');
      cy.contains('Es recurrente').should('be.visible');
    });

    it('should create a projection successfully', () => {
      cy.visit('/dashboard/commercial/treasury/projections');

      cy.contains('button', 'Nueva Proyección').click();
      cy.get('[role="dialog"]').should('be.visible');

      const ts = Date.now();

      cy.get('[role="dialog"]').within(() => {
        cy.get('input[name="description"]').type(`Test Projection ${ts}`);
        cy.get('input[name="amount"]').type('25000');
      });

      cy.contains('button', 'Guardar').click();
      cy.get('[data-sonner-toast]').should('contain.text', 'Proyección creada correctamente');
    });
  });

  describe('Projection Actions', () => {
    it('should open edit, link and delete options from dropdown', () => {
      cy.visit('/dashboard/commercial/treasury/projections');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().find('button').last().click();
          cy.contains('Vincular documento').should('be.visible');
          cy.contains('Editar').should('be.visible');
          cy.contains('Eliminar').should('be.visible');
        } else {
          cy.log('No projections found, skipping actions test');
        }
      });
    });
  });

  describe('Projection Status', () => {
    it('should display status column in table', () => {
      cy.visit('/dashboard/commercial/treasury/projections');

      cy.get('[data-testid="data-table"]').should('be.visible');
      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          // Status column should be visible (Pendiente/Parcial/Confirmada)
          cy.get('table tbody tr').first().within(() => {
            cy.get('td').should('have.length.at.least', 7);
          });
        }
      });
    });
  });

  describe('Link Document Modal', () => {
    it('should open link document modal from dropdown', () => {
      cy.visit('/dashboard/commercial/treasury/projections');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().find('button').last().click();
          // Only show if not CONFIRMED
          cy.get('body').then(($menuBody) => {
            if ($menuBody.find(':contains("Vincular documento")').length > 0) {
              cy.contains('Vincular documento').click();
              cy.get('[role="dialog"]').should('be.visible');
              cy.contains('Vincular a Documento').should('be.visible');
            } else {
              cy.log('Projection is already confirmed, skipping link test');
            }
          });
        } else {
          cy.log('No projections found, skipping link test');
        }
      });
    });
  });
});
