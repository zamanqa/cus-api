import { customerApiConfig } from './config';

Cypress.Commands.add('getAllDeliveries', () => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/deliveries`,
     auth: customerApiConfig.auth,
  }).then((response) => {
    return cy.wait(5000).then(() => {
      expect(response.status).to.eq(200);
      const firstShippingDate = response.body[0]?.shipping_date;
      expect(firstShippingDate).to.exist;
      Cypress.env('shipping_date', firstShippingDate);
      return firstShippingDate;
    });
  });
});

Cypress.Commands.add('getDeliveryByDate', (shippingDate) => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/deliveries/${encodeURIComponent(shippingDate)}`,
     auth: customerApiConfig.auth,
  }).then((response) => {
    return cy.wait(5000).then(() => {
      expect(response.status).to.eq(200);
      return response.body;
    });
  });
});
