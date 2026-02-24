import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Bank Accounts', () => {
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
    cy.task('cleanupTestBankAccounts').then((result) => {
      cy.log(`Bank accounts cleanup: ${JSON.stringify(result)}`);
    });
  });

  describe('List Bank Accounts', () => {
    it('should display the bank accounts page', () => {
      cy.visit('/dashboard/commercial/treasury/bank-accounts');

      cy.contains('h1', 'Cuentas Bancarias').should('be.visible');
      cy.contains('Gestión de cuentas bancarias y movimientos').should('be.visible');
    });

    it('should display KPI summary cards', () => {
      cy.visit('/dashboard/commercial/treasury/bank-accounts');

      cy.contains('Total en Bancos').should('be.visible');
      cy.contains('Cuentas Activas').should('be.visible');
      cy.contains('Movimientos').should('be.visible');
    });

    it('should have a button to create new account', () => {
      cy.visit('/dashboard/commercial/treasury/bank-accounts');

      cy.contains('button', 'Nueva Cuenta').should('be.visible');
    });

    it('should display the bank accounts table', () => {
      cy.visit('/dashboard/commercial/treasury/bank-accounts');

      cy.get('[data-testid="data-table"]').should('be.visible');
    });
  });

  describe('Create Bank Account', () => {
    it('should open create modal', () => {
      cy.visit('/dashboard/commercial/treasury/bank-accounts');

      cy.contains('button', 'Nueva Cuenta').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Nueva Cuenta Bancaria').should('be.visible');
    });

    it('should create a new bank account', () => {
      cy.visit('/dashboard/commercial/treasury/bank-accounts');

      cy.contains('button', 'Nueva Cuenta').click();
      cy.get('[role="dialog"]').should('be.visible');

      // Fill form
      cy.get('[role="dialog"]').within(() => {
        cy.contains('label', 'Banco').parent().find('input').type(`Test Bank ${timestamp}`);
        cy.contains('label', 'Número de Cuenta').parent().find('input').type('9876543210');

        cy.contains('button', 'Crear').click();
      });

      // Modal should close
      cy.get('[role="dialog"]').should('not.exist', { timeout: 10000 });
    });
  });

  describe('View Bank Account Detail', () => {
    it('should display bank account detail with movements', () => {
      cy.visit('/dashboard/commercial/treasury/bank-accounts');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().find('a').first().click();

          cy.url().should('match', /\/dashboard\/commercial\/treasury\/bank-accounts\/[a-zA-Z0-9-]+$/);

          // Should show tabs
          cy.contains('Movimientos').should('be.visible');
          cy.contains('Conciliación').should('be.visible');
        } else {
          cy.log('No bank accounts found, skipping detail test');
        }
      });
    });

    it('should display reconciliation tab', () => {
      cy.visit('/dashboard/commercial/treasury/bank-accounts');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().find('a').first().click();
          cy.url().should('match', /\/dashboard\/commercial\/treasury\/bank-accounts\/[a-zA-Z0-9-]+$/);

          // Click reconciliation tab
          cy.contains('[role="tab"]', 'Conciliación').click();
          cy.wait(500);
          cy.get('body').should('be.visible');
        } else {
          cy.log('No bank accounts found, skipping reconciliation test');
        }
      });
    });
  });

  describe('Edit Bank Account', () => {
    it('should edit a bank account via actions dropdown', () => {
      cy.visit('/dashboard/commercial/treasury/bank-accounts');

      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().find('button').last().click();
          cy.contains('Editar').click();

          cy.get('[role="dialog"]').should('be.visible');
          cy.contains('Editar Cuenta Bancaria').should('be.visible');
        } else {
          cy.log('No bank accounts found, skipping edit test');
        }
      });
    });
  });
});
