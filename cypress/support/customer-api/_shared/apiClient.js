/**
 * Centralized API request helper.
 * Reads configuration from Cypress.env() which is loaded from .env via cypress.config.js.
 */

function getApiConfig() {
  return {
    baseUrl: Cypress.env('apiBaseUrl'),
    apiVersion: Cypress.env('apiVersion'),
    auth: {
      username: Cypress.env('apiAuthUsername'),
      password: Cypress.env('apiAuthPassword'),
    },
  };
}

/**
 * Make an authenticated API request to the Customer API.
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} endpoint - API endpoint path (e.g., '/orders' or '/orders/123')
 * @param {object} [options] - Additional cy.request options (body, headers, failOnStatusCode, timeout)
 * @returns {Cypress.Chainable} The cy.request() response
 */
export function apiRequest(method, endpoint, options = {}) {
  const config = getApiConfig();
  return cy.request({
    method,
    url: `${config.baseUrl}/api/${config.apiVersion}${endpoint}`,
    auth: config.auth,
    ...options,
  });
}

/**
 * Get the company ID from environment configuration.
 */
export function getCompanyId() {
  return Cypress.env('companyId');
}
