// e2e.js - Support file loaded before every test
// Global configuration and behavior

// Suppress uncaught exceptions from third-party scripts
Cypress.on('uncaught:exception', () => {
  return false;
});

// Log current test name before each test
beforeEach(() => {
  cy.log(`Running: ${Cypress.currentTest.titlePath.join(' > ')}`);
});
