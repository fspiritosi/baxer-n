import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Cashflow Dashboard', () => {
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

  describe('Cashflow Dashboard Page', () => {
    it('should display the cashflow page', () => {
      cy.visit('/dashboard/commercial/treasury/cashflow');

      cy.contains('h1', 'Flujo de Caja').should('be.visible');
      cy.contains('Proyección financiera').should('be.visible');
    });

    it('should display summary cards', () => {
      cy.visit('/dashboard/commercial/treasury/cashflow');

      cy.contains('Saldo Actual').should('be.visible');
      cy.contains('Ingresos Proyectados').should('be.visible');
      cy.contains('Egresos Proyectados').should('be.visible');
      cy.contains('Saldo Proyectado Final').should('be.visible');
    });

    it('should display the chart', () => {
      cy.visit('/dashboard/commercial/treasury/cashflow');

      cy.contains('Proyección de Flujo de Caja').should('be.visible');
    });

    it('should display the cashflow table with headers', () => {
      cy.visit('/dashboard/commercial/treasury/cashflow');

      cy.get('table').should('be.visible');
      cy.contains('th', 'Período').should('be.visible');
      cy.contains('th', 'Ingresos').should('be.visible');
      cy.contains('th', 'Egresos').should('be.visible');
      cy.contains('th', 'Neto').should('be.visible');
      cy.contains('th', 'Saldo Proyectado').should('be.visible');
    });

    it('should display granularity selector with default weekly', () => {
      cy.visit('/dashboard/commercial/treasury/cashflow');

      cy.contains('button', 'Diario').should('be.visible');
      cy.contains('button', 'Semanal').should('be.visible');
      cy.contains('button', 'Mensual').should('be.visible');
    });

    it('should switch granularity to daily', () => {
      cy.visit('/dashboard/commercial/treasury/cashflow');

      cy.contains('button', 'Diario').click();
      cy.url().should('include', 'granularity=daily');
    });

    it('should switch granularity to monthly', () => {
      cy.visit('/dashboard/commercial/treasury/cashflow');

      cy.contains('button', 'Mensual').click();
      cy.url().should('include', 'granularity=monthly');
    });
  });
});
