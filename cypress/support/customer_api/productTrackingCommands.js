import { customerApiConfig } from './config';

Cypress.Commands.add('getProductTracking', () => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/product-tracking`,
    auth: customerApiConfig.auth,
  }).then((response) => {
    return cy.wait(5000).then(() => response);
  });
});


Cypress.Commands.add('getSerialNumberFromDB', () => {
    const query = `
      SELECT serial_number
      FROM product_trackings
      WHERE company_id = '734f-4c766638po'
        AND location_status IN ('rented out')
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return cy.task('queryDb', query).then((result) => {
      const serialNumber = result[0]?.serial_number;
      Cypress.env('serialNumber', serialNumber);
      return serialNumber;
    });
  });

  Cypress.Commands.add('getProductTrackingBySerial', (serialNumber) => {
    return cy.request({
      method: 'GET',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/product-tracking/${serialNumber}`,
      auth: customerApiConfig.auth
    }).then((response) => {
      return cy.wait(5000).then(() => response);
    });
  });

  Cypress.Commands.add('getLatestSerialNumberForProductTracking', () => {
    const query = `
      SELECT serial_number
      FROM subscriptions
      WHERE company_id = '734f-4c766638po'
        AND status = 'active'
        AND subscription_type = 'normal'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    return cy.task('queryDb', query).then((result) => {
      const serialNumber = result[0].serial_number;
      Cypress.env('serialNumber', serialNumber);
      return serialNumber;
    });
  });

  Cypress.Commands.add('postRepairRequest', (serialNumber) => {
    return cy.request({
      method: 'POST',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/product-tracking/${serialNumber}/repair`,
      auth: customerApiConfig.auth,
      body: {
        delete_rps: true
      },
      failOnStatusCode: false
    }).then((response) => {
      return cy.wait(10000).then(() => response);
    });
  });

  Cypress.Commands.add('postStockRequest', (serialNumber) => {
    return cy.request({
      method: 'POST',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/product-tracking/${serialNumber}/stock?do_not_restock=false`,
      auth: customerApiConfig.auth,
      body: {
        location: 'Berlin'
      },
      failOnStatusCode: false
    }).then((response) => {
      return cy.wait(10000).then(() => response);
    });
  });
