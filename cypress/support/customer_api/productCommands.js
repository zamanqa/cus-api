// cypress/support/customer_api/productCommands.js
import { customerApiConfig } from './config';

Cypress.Commands.add('getCustomerProducts', () => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/products`,
    auth: customerApiConfig.auth,
    failOnStatusCode: false
  }).then((response) => {
    return cy.wait(5000).then(() => response);
  });
});

Cypress.Commands.add('getCustomerVariants', () => {
    return cy.request({
      method: 'GET',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/variants`,
      auth: customerApiConfig.auth,
      failOnStatusCode: false
    }).then((response) => {
      return cy.wait(5000).then(() => response);
    });
  });

  Cypress.Commands.add('getCustomerProductVariantsByVariantId', (variantId) => {
    return cy.request({
      method: 'GET',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/products/${variantId}/variants`,
      auth: customerApiConfig.auth,
      failOnStatusCode: false
    }).then((response) => {
      return cy.wait(5000).then(() => response);
    });
  });
