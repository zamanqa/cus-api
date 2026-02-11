import '../../../support/customer_api/deliveriesCommands';
import { customerApiConfig } from '../../../support/customer_api/config';

describe('Deliveries API', () => {
  it.only('Test 1: Return a list of deliveries and save the first shipping date', () => {
    cy.getAllDeliveries().then((shippingDate) => {
      cy.log(`Saved shipping date: ${shippingDate}`);
    });
  });

  it.only('Test 2: Returns all deliveries associated with a shipping date as list', () => {
    const shippingDate = Cypress.env('shipping_date');
    expect(shippingDate).to.exist;

    cy.getDeliveryByDate(shippingDate).then((delivery) => {
      expect(delivery).to.have.property('shipping_date', shippingDate);
      cy.log(`Fetched delivery for: ${shippingDate}`);
    });
  });
});
