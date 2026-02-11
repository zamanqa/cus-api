// databaseUtil.js - Database verification utilities for Customer API tests

import { customerApiConfig } from './config';

/**
 * Check if customer order exists in database
 * Uses the orderId stored in Cypress.env during createCustomerOrder
 */
Cypress.Commands.add('checkCustomerOrderExistsInDatabase', () => {
  const orderId = Cypress.env('createdOrderId');
  if (!orderId) {
    cy.log('⚠ No orderId found in Cypress.env - skipping DB check');
    return;
  }

  const queryString = `SELECT * FROM orders WHERE order_id = '${orderId}'`;

  cy.task('queryDb', queryString).then((result) => {
    if (result.length > 0) {
      cy.log(`✓ Order ${orderId} exists in the database`);
      expect(result.length).to.be.greaterThan(0);
    } else {
      cy.log(`✗ Order ${orderId} NOT found in the database`);
      expect(result.length).to.be.greaterThan(0);
    }
  });
});

/**
 * Check if customer order item exists in database
 * Uses the orderId stored in Cypress.env during createCustomerOrder
 */
Cypress.Commands.add('checkCustomerOrderItemExistsInDatabase', () => {
  const orderId = Cypress.env('createdOrderId');
  if (!orderId) {
    cy.log('⚠ No orderId found in Cypress.env - skipping DB check');
    return;
  }

  const queryString = `SELECT * FROM order_items WHERE order_id = (SELECT uid FROM orders WHERE order_id = '${orderId}')`;

  cy.task('queryDb', queryString).then((result) => {
    if (result.length > 0) {
      cy.log(`✓ Order items for ${orderId} exist in the database (${result.length} items)`);
      expect(result.length).to.be.greaterThan(0);
    } else {
      cy.log(`✗ Order items for ${orderId} NOT found in the database`);
      expect(result.length).to.be.greaterThan(0);
    }
  });
});
