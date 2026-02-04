/// <reference types="cypress" />
import { addClerkCommands } from '@clerk/testing/cypress';

// Import custom commands (must be imported AFTER addClerkCommands)
import './commands';

// Add Clerk custom commands (cy.clerkSignIn, cy.clerkSignOut, etc.)
addClerkCommands({ Cypress, cy });

// Custom commands for the application
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// Declare custom commands types
declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};
