import { customerApiConfig } from './config';

Cypress.Commands.add('getAllCustomers', () => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/customers`,
    auth: customerApiConfig.auth
  }).then((response) => {
    return cy.wait(5000).then(() => response);
  });
});

// Get by customer id
Cypress.Commands.add('getCustomerById', (customerId) => {
    return cy.request({
      method: 'GET',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/customers/${customerId}`,
      auth: customerApiConfig.auth
    }).then((response) => {
      return cy.wait(5000).then(() => response);
    });
  });

  // get account balance
  Cypress.Commands.add('getCustomerBalance', (customerId) => {
    return cy.request({
      method: 'GET',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/customers/${customerId}/balance`,
      auth: customerApiConfig.auth
    }).then((response) => {
      return cy.wait(5000).then(() => response);
    });
  });

  //Add account Balance
  Cypress.Commands.add('addCustomerBalance', (customerId, amount) => {
    return cy.request({
      method: 'PUT',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/customers/${customerId}/balance`,
      auth: customerApiConfig.auth,
      body: {
        add: amount
      }
    }).then((response) => {
      return cy.wait(10000).then(() => response);
    });
  });

// Update customer details:
Cypress.Commands.add('updateCustomerExternalId', (customerId, externalId) => {
    return cy.request({
      method: 'PUT',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/customers/${customerId}`,
      auth: customerApiConfig.auth,
      body: {
        external_customer_id: externalId
      }
    }).then((response) => {
      return cy.wait(10000).then(() => response);
    });
  });


  Cypress.Commands.add('createCustomerReferralCode', (customerId) => {
    return cy.request({
      method: 'POST',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/customers/${customerId}/referral-code`,
      auth: customerApiConfig.auth,
      failOnStatusCode: false // In case referral code already exists
    }).then((response) => {
      return cy.wait(10000).then(() => response);
    });
  });

  Cypress.Commands.add('getCustomerReferralCode', (customerId) => {
    return cy.request({
      method: 'GET',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/customers/${customerId}/referral-code`,
      auth: customerApiConfig.auth
    }).then((response) => {
      return cy.wait(5000).then(() => response);
    });
  });

  Cypress.Commands.add('deleteReferralCodeFromDB', (referralCode) => {
    const query = `
      DELETE FROM checkout.checkout_voucher_codes
      WHERE voucher_code IN ('${referralCode}')
    `;
    cy.task('queryDb', query).then((result) => {
      cy.log('Deleted referral code from DB if it existed');
    });
  });

  Cypress.Commands.add('deleteReferralByEmail', (email) => {
    const query = `
      DELETE FROM checkout.checkout_voucher_codes
      WHERE referrer_email IN ('${email}')
    `;
    return cy.task('queryDb', query).then((result) => {
      cy.log(`Referral code(s) deleted for email: ${email}`);
    });
  });

Cypress.Commands.add('createCustomer', () => {
  // Generate a random 4-digit number for external_customer_id
  const randomExternalId = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit random number

  // Generate a random email by appending a random number to 'apiTest'
  const randomEmail = `apiTest${Math.floor(Math.random() * 10000)}@gmail.com`; // Random email

  // Define the customer data with the generated randomExternalId and randomEmail
  const customerData = {
    email: randomEmail,  // Random email value
    phone: "+4917656824720",  // Static phone value
    default_locale: "en",  // Static locale value
    marketing_consent: true,  // Static consent value
    date_of_birth: null,  // Static value for date_of_birth
    first_name: "Shahiduz",  // Static first name
    last_name: "Zaman",  // Static last name
    company: "Circuly",  // Static company name
    street: "Fritz Tarnow Str 21",  // Static street address
    address_addition: "test",  // Static address addition
    postal_code: "60320",  // Static postal code
    city: "Frankfurt",  // Static city value
    country: "Germany",  // Static country value
    external_customer_id: randomExternalId  // Dynamically generated 4-digit external customer ID
  };

  // Send the request to create the customer
  return cy.request({
    method: 'POST',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/customers`,
    auth: customerApiConfig.auth,
    body: customerData  // Send the customer data in the request body
  }).then((response) => {
    return cy.wait(10000).then(() => response);
  });
});
