import { apiRequest } from '../_shared/apiClient';
import {
  getCustomerIdQuery,
  getCustomerByIdQuery,
  getCustomerAccountQuery,
  checkExternalCustomerIdQuery,
  checkCustomerExistsQuery,
  getTwoRecentCustomersQuery,
  checkCustomerByUidQuery,
  checkOrdersByCustomerQuery,
  deleteReferralByEmailQuery,
  deleteReferralCodeQuery
} from './customerQueries';
import {
  getCreateCustomerPayload,
  getValidateAddressPayload,
  getMergeCustomersPayload
} from './customerPayloads';

// Get customer_id from DB by company_id
export function getCustomerIdFromDB() {
  const companyId = Cypress.env('companyId');
  const query = getCustomerIdQuery(companyId);
  return cy.task('queryDb', query);
}

// Return a paginated list of customers: Test 1
export function getAllCustomers() {
  return apiRequest('GET', '/customers');
}

// Get customer by ID: Test 2
export function getCustomerById(customerId) {
  return apiRequest('GET', `/customers/${customerId}`);
}

// Get customer balance: Test 3
export function getCustomerBalance(customerId) {
  return apiRequest('GET', `/customers/${customerId}/balance`);
}

// Add customer balance: Test 4
export function addCustomerBalance(customerId, amount) {
  return apiRequest('PUT', `/customers/${customerId}/balance`, {
    body: { add: amount },
    headers: { 'Content-Type': 'application/json' }
  });
}

// Update customer external ID: Test 5
export function updateCustomerExternalId(customerId, externalId) {
  return apiRequest('PUT', `/customers/${customerId}`, {
    body: { external_customer_id: externalId },
    headers: { 'Content-Type': 'application/json' }
  });
}

// Create referral code: Test 6
export function createCustomerReferralCode(customerId) {
  return apiRequest('POST', `/customers/${customerId}/referral-code`);
}

// Get referral code: Test 7
export function getCustomerReferralCode(customerId) {
  return apiRequest('GET', `/customers/${customerId}/referral-code`);
}

// Create a new customer: Test 8
export function createCustomer() {
  const requestBody = getCreateCustomerPayload();
  Cypress.env('createdCustomerEmail', requestBody.email);
  return apiRequest('POST', '/customers', {
    body: requestBody,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Delete referral codes by email from DB
export function deleteReferralByEmail(email) {
  const query = deleteReferralByEmailQuery(email);
  return cy.task('queryDb', query).then(() => {
    cy.log(`Referral code(s) deleted for email: ${email}`);
  });
}

// Delete referral code from DB
export function deleteReferralCodeFromDB(referralCode) {
  const query = deleteReferralCodeQuery(referralCode);
  return cy.task('queryDb', query).then(() => {
    cy.log('Deleted referral code from DB if it existed');
  });
}

// Verify customer exists in DB by email
export function verifyCustomerExistsInDB(email) {
  const query = checkCustomerExistsQuery(email);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`Customer with email ${email} exists in the database`);
  });
}

// Verify external_customer_id updated in DB
export function verifyExternalCustomerIdInDB(customerId, expectedExternalId) {
  const query = checkExternalCustomerIdQuery(customerId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    expect(result[0].external_customer_id).to.eq(expectedExternalId);
    cy.log(`Customer ${customerId} external_customer_id verified: ${expectedExternalId}`);
  });
}

// Verify customer exists in DB by uid
export function verifyCustomerInDB(customerId) {
  const query = getCustomerByIdQuery(customerId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`Customer ${customerId} exists in the database`);
  });
}

// Get customer account balance from DB by email
export function getCustomerAccountFromDB(email) {
  const query = getCustomerAccountQuery(email);
  return cy.task('queryDb', query);
}

// Verify customer balance in DB
export function verifyCustomerBalanceInDB(email, expectedAmount) {
  const query = getCustomerAccountQuery(email);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`Customer account remaining_amount: ${result[0].remaining_amount}`);
    expect(Number(result[0].remaining_amount)).to.eq(expectedAmount);
  });
}

// Validate address: Test 10
export function validateAddress() {
  const payload = getValidateAddressPayload();
  return apiRequest('POST', '/validate-address', {
    body: payload,
    headers: { 'Content-Type': 'application/json' },
    failOnStatusCode: false
  });
}

// Get 2 most recent customers from DB for merge
export function getTwoRecentCustomersFromDB() {
  const companyId = Cypress.env('companyId');
  const query = getTwoRecentCustomersQuery(companyId);
  return cy.task('queryDb', query);
}

// Transfer (merge) customers: Test 11
export function transferCustomers(sourceCustomerId, targetCustomerId) {
  const payload = getMergeCustomersPayload(sourceCustomerId, targetCustomerId);
  return apiRequest('POST', '/customers/transfer', {
    body: payload,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Verify orders were transferred from source to target customer in DB
export function verifyCustomerTransferredInDB(sourceUid, targetUid) {
  const companyId = Cypress.env('companyId');

  // Source customer should have 0 orders
  const sourceQuery = checkOrdersByCustomerQuery(sourceUid, companyId);
  cy.task('queryDb', sourceQuery).then((result) => {
    const sourceCount = Number(result[0].count);
    cy.log(`Source customer ${sourceUid} has ${sourceCount} orders`);
    expect(sourceCount).to.eq(0);
  });

  // Target customer should have orders
  const targetQuery = checkOrdersByCustomerQuery(targetUid, companyId);
  return cy.task('queryDb', targetQuery).then((result) => {
    const targetCount = Number(result[0].count);
    cy.log(`Target customer ${targetUid} has ${targetCount} orders`);
    expect(targetCount).to.be.greaterThan(0);
  });
}
