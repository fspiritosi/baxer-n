import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Dashboard', () => {
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

  describe('Overview', () => {
    it('should display the dashboard page with title', () => {
      cy.visit('/dashboard');

      cy.contains('h1', 'Dashboard').should('be.visible');
      cy.contains('Resumen general de tu empresa').should('be.visible');
    });

    it('should display all 6 KPI cards', () => {
      cy.visit('/dashboard');

      const kpiTitles = [
        'Ventas del Mes',
        'Compras del Mes',
        'Pendiente de Cobro',
        'Pendiente de Pago',
        'Stock Crítico',
        'Saldo Bancario',
      ];

      kpiTitles.forEach((title) => {
        cy.contains(title).should('be.visible');
      });
    });

    it('should display sales trend chart section', () => {
      cy.visit('/dashboard');

      cy.contains('Tendencia de Ventas').should('be.visible');
    });

    it('should display purchases trend chart section', () => {
      cy.visit('/dashboard');

      cy.contains('Tendencia de Compras').should('be.visible');
    });

    it('should display critical stock section', () => {
      cy.visit('/dashboard');

      cy.contains('Stock Crítico').should('be.visible');
    });

    it('should display alerts section', () => {
      cy.visit('/dashboard');

      cy.contains('Alertas y Vencimientos').should('be.visible');
    });
  });

  describe('Period Selector', () => {
    it('should show month and year selectors', () => {
      cy.visit('/dashboard');

      // Should have month and year select triggers
      cy.get('button[data-slot="select-trigger"]').should('have.length.at.least', 2);
    });

    it('should navigate to previous month', () => {
      cy.visit('/dashboard');

      // Click left arrow (previous month)
      cy.get('button').filter(':has(svg)').first().click();

      // URL should now have ?month= parameter
      cy.url().should('include', 'month=');

      // Should show historical subtitle instead of "Resumen general"
      cy.contains('Datos de').should('be.visible');
    });

    it('should show "Hoy" button when viewing historical month', () => {
      cy.visit('/dashboard');

      // Navigate to previous month
      cy.get('button').filter(':has(svg)').first().click();

      // Should show "Hoy" button
      cy.contains('button', 'Hoy').should('be.visible');
    });

    it('should return to current month when clicking "Hoy"', () => {
      cy.visit('/dashboard');

      // Navigate to previous month
      cy.get('button').filter(':has(svg)').first().click();
      cy.contains('Datos de').should('be.visible');

      // Click "Hoy"
      cy.contains('button', 'Hoy').click();

      // Should show current month subtitle
      cy.contains('Resumen general de tu empresa').should('be.visible');

      // URL should not have month parameter
      cy.url().should('not.include', 'month=');
    });
  });
});
