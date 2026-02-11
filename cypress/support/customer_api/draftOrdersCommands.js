import { customerApiConfig } from './config';

Cypress.Commands.add('createDraftOrder', (payload) => {
  return cy.request({
    method: 'POST',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/draft-orders`,
    auth: customerApiConfig.auth,
    body: payload,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 20000,
    failOnStatusCode: false
  }).then((response) => {
    return cy.wait(10000).then(() => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('order_checkout_link');

      // Save values to Cypress.env if needed
      Cypress.env('draftOrderId', response.body.id);
      Cypress.env('checkoutLink', response.body.order_checkout_link);

      return response.body;
    });
  });
});

Cypress.Commands.add('getAllDraftOrders', () => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/draft-orders`,
    auth: customerApiConfig.auth,
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000
  }).then((response) => {
    return cy.wait(5000).then(() => {
      expect(response.status).to.eq(200);

      // Check if 'data' exists and it's an array
      const orders = response.body.data;
      if (Array.isArray(orders) && orders.length > 0) {
        // Return the first order object
        return orders[0];
      } else {
        throw new Error('No draft orders found.');
      }
    });
  });
});

Cypress.Commands.add('deleteDraftOrderById', (orderId) => {
  return cy.request({
    method: 'DELETE',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/draft-orders/${orderId}`,
    auth: customerApiConfig.auth,
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000,
    failOnStatusCode: false
  }).then((response) => {
    return cy.wait(5000).then(() => {
      expect(response.status).to.eq(200);
      cy.log(`Successfully deleted draft order with ID: ${orderId}`);
    });
  });
});
