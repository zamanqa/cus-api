import { customerApiConfig } from './config';

Cypress.Commands.add('getRecurringPayments', () => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/recurring-payments`,
    auth: customerApiConfig.auth,
  }).then((response) => {
    return cy.wait(5000).then(() => response);
  });
});

Cypress.Commands.add('getRecurringPaymentById', (id) => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/recurring-payments/${id}`,
    auth: customerApiConfig.auth,
  }).then((response) => {
    return cy.wait(5000).then(() => response);
  });
});
