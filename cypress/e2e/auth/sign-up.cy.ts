import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Sign Up Flow', () => {
  beforeEach(() => {
    setupClerkTestingToken();
  });

  it('should display the sign-up page', () => {
    cy.visit('/sign-up');

    // Verify sign-up form is visible
    cy.get('.cl-signUp-root').should('exist');
    cy.contains('Crear cuenta').should('be.visible');
  });

  it('should show validation errors for empty form', () => {
    cy.visit('/sign-up');

    // Try to submit empty form
    cy.get('.cl-formButtonPrimary').click();

    // Should show validation error
    cy.get('.cl-formFieldErrorText').should('be.visible');
  });

  it('should sign up a new user with test email', () => {
    cy.fixture('user').then((userData) => {
      const { newUser } = userData;
      const timestamp = Date.now();
      const testEmail = `e2e_${timestamp}+clerk_test@example.com`;

      cy.visit('/sign-up');

      // Fill email
      cy.get('input[name="emailAddress"]').type(testEmail);
      cy.get('.cl-formButtonPrimary').click();

      // Fill password
      cy.get('input[name="password"]').type(newUser.password);
      cy.get('.cl-formButtonPrimary').click();

      // If email verification is required, use the test code 424242
      cy.get('body').then(($body) => {
        if ($body.find('input[name="code"]').length > 0) {
          cy.get('input[name="code"]').type('424242');
          cy.get('.cl-formButtonPrimary').click();
        }
      });

      // Should redirect to dashboard after successful sign-up
      cy.url({ timeout: 15000 }).should('include', '/dashboard');
    });
  });

  it('should navigate to sign-in from sign-up page', () => {
    cy.visit('/sign-up');

    // Click on "Already have an account?" link
    cy.contains('¿Ya tienes una cuenta?').click();

    // Should be on sign-in page
    cy.url().should('include', '/sign-in');
  });
});
