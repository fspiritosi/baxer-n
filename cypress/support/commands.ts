/// <reference types="cypress" />

// Application-specific commands

/**
 * Wait for the page to be fully loaded (no pending requests)
 */
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  // Wait for any loading spinners to disappear
  cy.get('[data-loading="true"]').should('not.exist');
});

/**
 * Fill a form field by label text
 */
Cypress.Commands.add('fillField', (label: string, value: string) => {
  cy.contains('label', label).parent().find('input, textarea').clear().type(value);
});

/**
 * Submit a form and wait for navigation
 */
Cypress.Commands.add('submitForm', () => {
  cy.get('form').submit();
});

// Declare types
declare global {
  namespace Cypress {
    interface Chainable {
      waitForPageLoad(): Chainable<void>;
      fillField(label: string, value: string): Chainable<void>;
      submitForm(): Chainable<void>;
    }
  }
}

export {};
