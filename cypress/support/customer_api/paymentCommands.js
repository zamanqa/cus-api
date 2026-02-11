import { customerApiConfig } from './config';

Cypress.Commands.add('issueOneTimePayment', (orderId) => {
  return cy.request({
    method: 'POST',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/payments/one-time-payments`,
    auth: customerApiConfig.auth,
    body: {
      amount: 20.0,
      order_id: orderId,
      message: "",
      products: [
        {
          product: "Automation test 1",
          amount: 10.0,
          tax_percent: 19,
          quantity: 1
        },
        {
          product: "Automation test 2",
          amount: 10.0,
          tax_percent: 19,
          quantity: 1
        }
      ]
    }
  }).then((response) => {
    return cy.wait(10000).then(() => response);
  });
});
