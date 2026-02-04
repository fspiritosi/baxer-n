import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Sign In Flow', () => {
  beforeEach(() => {
    setupClerkTestingToken();
  });

  it('should display the sign-in page', () => {
    cy.visit('/sign-in');

    // Verify sign-in form is visible
    cy.get('.cl-signIn-root').should('exist');
    cy.contains('Entrar').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/sign-in');

    // Fill with invalid credentials
    cy.get('input[name="identifier"]').type('invalid@email.com');
    cy.get('.cl-formButtonPrimary').click();

    // Should show error
    cy.get('.cl-formFieldErrorText, .cl-formGlobalError', { timeout: 10000 }).should('be.visible');
  });

  it('should redirect unauthenticated users to sign-in', () => {
    // Try to access protected route without auth
    cy.visit('/dashboard');

    // Should redirect to sign-in
    cy.url({ timeout: 10000 }).should('include', '/sign-in');
  });

  // Test authenticated flow with clerk_test user using email_code strategy
  // This uses the special +clerk_test email which accepts code 424242
  it('should sign in with Clerk email_code and access dashboard', () => {
    cy.visit('/');

    // Wait for Clerk to load
    cy.window().should((win) => {
      expect(win).to.have.property('Clerk');
      expect(win.Clerk.loaded).to.eq(true);
    });

    cy.clerkSignIn({
      strategy: 'email_code',
      identifier: Cypress.env('test_user'),
    });

    // Navigate to protected page
    cy.visit('/dashboard');

    // Should be on dashboard (not redirected to sign-in)
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
    cy.url().should('not.include', '/sign-in');
  });
});
