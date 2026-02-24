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

/**
 * Select an option from a shadcn Select component by trigger label and option text
 */
Cypress.Commands.add('selectOption', (triggerLabel: string, optionText: string) => {
  cy.contains('label', triggerLabel)
    .parent()
    .find('[role="combobox"], button[data-slot="select-trigger"]')
    .click();
  cy.get('[role="option"]').contains(optionText).click();
});

/**
 * Click a button by text and wait for the modal/dialog to appear
 */
Cypress.Commands.add('openModal', (buttonText: string) => {
  cy.contains('button', buttonText).click();
  cy.get('[role="dialog"]').should('be.visible');
});

/**
 * Close the currently open modal/dialog
 */
Cypress.Commands.add('closeModal', () => {
  cy.get('[role="dialog"]')
    .find('button[aria-label="Close"], button:contains("Cancelar")')
    .first()
    .click();
  cy.get('[role="dialog"]').should('not.exist');
});

/**
 * Verify a Sonner toast notification appears with expected text
 */
Cypress.Commands.add('checkToast', (message: string) => {
  cy.get('[data-sonner-toast]', { timeout: 10000 }).should('contain', message);
});

// Declare types
declare global {
  namespace Cypress {
    interface Chainable {
      waitForPageLoad(): Chainable<void>;
      fillField(label: string, value: string): Chainable<void>;
      submitForm(): Chainable<void>;
      selectOption(triggerLabel: string, optionText: string): Chainable<void>;
      openModal(buttonText: string): Chainable<void>;
      closeModal(): Chainable<void>;
      checkToast(message: string): Chainable<void>;
    }
  }
}

export {};
