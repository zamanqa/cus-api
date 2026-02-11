import { customerApiConfig } from '../customer_api/config';

Cypress.Commands.add('getAllRetailers', () => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/retailers`,
    auth: customerApiConfig.auth,
    failOnStatusCode: false
  }).then((response) => {
    return cy.wait(5000).then(() => response);
  });
});

Cypress.Commands.add('getRetailerByLocationId', (locationId) => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/retailers/${locationId}`,
    auth: customerApiConfig.auth,
    failOnStatusCode: false
  }).then((response) => {
    return cy.wait(5000).then(() => response);
  });
});


Cypress.Commands.add('createRetailer', () => {
    const locationId = `retailer${Math.floor(Math.random() * 10000)}`; // Generate random location_id like retailer12345
    const retailerData = {
      name: "test111",
      password: "password",
      enabled: true,
      location_id: locationId,
      address: {
        company: "test",
        street: "Hansaallee 139",
        postal_code: "60320",
        city: "Frankfurt",
        country: "Germany",
        alpha2: "DE"
      }
    };

    return cy.request({
      method: 'POST',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/retailers`,
      auth: customerApiConfig.auth,
      body: retailerData,
      failOnStatusCode: false
    }).then((response) => {
      return cy.wait(10000).then(() => response);
    });
  });


  Cypress.Commands.add('updateRetailer', () => {
    const retailerId = Cypress.env('retailerId'); // Get retailer ID saved from the create test case
    if (!retailerId) {
      throw new Error('Retailer ID not found. Please run the create retailer test first.');
    }

    const updateData = {
      name: "test1",
      password: "password",
      enabled: true,
      address: {
        company: "test",
        street: "Hansaallee 139",
        postal_code: "60320",
        city: "Frankfurt",
        country: "Germany",
        alpha2: "DE"
      }
    };

    return cy.request({
      method: 'PUT',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/retailers/${retailerId}`,
      auth: customerApiConfig.auth,
      body: updateData,
      failOnStatusCode: false
    }).then((response) => {
      return cy.wait(10000).then(() => response);
    });
  });
