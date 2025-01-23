describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should login successfully with correct credentials', () => {
    // Navigate to login page
    cy.get('[href="/login"]').click();

    // Fill in the form
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');

    // Submit form
    cy.get('button[type="submit"]').click();

    // Assert successful login
    cy.url().should('include', '/dashboard');
    cy.get('.user-info').should('contain', 'test@example.com');
  });

  it('should show error message with incorrect credentials', () => {
    cy.get('[href="/login"]').click();
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.get('.error-message').should('be.visible')
      .and('contain', 'Invalid credentials');
  });
}); 