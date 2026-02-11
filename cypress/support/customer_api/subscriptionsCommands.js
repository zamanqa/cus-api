import { customerApiConfig } from './config';

// Fetch all subscriptions
Cypress.Commands.add('getCustomerSubscriptions', () => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/subscriptions`,
    auth: customerApiConfig.auth
  }).then((response) => {
    return cy.wait(5000).then(() => response);
  });
});

// Fetch a single subscription by ID
Cypress.Commands.add('getSubscriptionById', (subscriptionId) => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/subscriptions/${subscriptionId}`,
    auth: customerApiConfig.auth
  }).then((response) => {
    return cy.wait(5000).then(() => response);
  });
});

// Create a subscription
Cypress.Commands.add('createSubscription', (subscriptionData) => {
  return cy.request({
    method: 'POST',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/subscriptions`,
    body: subscriptionData,
    auth: customerApiConfig.auth,
    failOnStatusCode: false // Optional, if you're testing failure cases too
  }).then((response) => {
    return cy.wait(10000).then(() => response);
  });
});

// Delete the subscription from DB using subscription_id
Cypress.Commands.add('deleteSubscriptionFromDb', (subscriptionId) => {
  const query = `
    DELETE FROM public.subscriptions
    WHERE subscription_id = '${subscriptionId}'
    AND company_id IN ('734f-4c766638po');
  `;
  return cy.task('queryDb', query).then((result) => {
    cy.log(`Deleted subscription ${subscriptionId} from DB.`);
  });
});

// updates a subscription's real_end_date
Cypress.Commands.add('updateSubscription', (subscriptionId, updateBody) => {
    return cy.request({
      method: 'PUT',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/subscriptions/${subscriptionId}`,
      body: updateBody,
      auth: customerApiConfig.auth
    }).then((response) => {
      return cy.wait(10000).then(() => response);
    });
  });

Cypress.Commands.add('getLatestActiveNormalSubscriptionId', () => {
  const query = `
    SELECT subscription_id
    FROM subscriptions
    WHERE company_id = '734f-4c766638po'
      AND real_end_date IS NULL
      AND subscription_type = 'normal'
      AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  return cy.task('queryDb', query).then((rows) => {
    expect(rows).to.be.an('array');
    expect(rows.length).to.be.greaterThan(0);

    return rows[0].subscription_id;
  });
});



  // Add Note
  Cypress.Commands.add('addSubscriptionNote', (subscriptionId, notePayload) => {
    return cy.request({
      method: 'POST',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/subscriptions/${subscriptionId}/notes`,
      auth: customerApiConfig.auth,
      body: notePayload,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      return cy.wait(10000).then(() => response);
    });
  });

  // Update serial number
  Cypress.Commands.add('updateSubscription', (subscriptionId, updateBody) => {
    return cy.request({
      method: 'PUT',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/subscriptions/${subscriptionId}`,
      body: updateBody,
      auth: customerApiConfig.auth
    }).then((response) => {
      return cy.wait(10000).then(() => response);
    });
  });

  // reactivate subscription
  Cypress.Commands.add('reactivateSubscription', (subscriptionId) => {
    return cy.request({
      method: 'POST',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/subscriptions/${subscriptionId}/reactivate`,
      auth: customerApiConfig.auth
    }).then((response) => {
      return cy.wait(10000).then(() => response);
    });
  });
