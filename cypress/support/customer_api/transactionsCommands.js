import { customerApiConfig } from './config';

Cypress.Commands.add('getCustomerTransactions', () => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/transactions`,
    auth: customerApiConfig.auth
  }).then((response) => {
    return cy.wait(5000).then(() => response);
  });
});

Cypress.Commands.add('getTransactionById', (transactionId) => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/transactions/${transactionId}`,
    auth: customerApiConfig.auth
  }).then((response) => {
    return cy.wait(5000).then(() => response);
  });
});
