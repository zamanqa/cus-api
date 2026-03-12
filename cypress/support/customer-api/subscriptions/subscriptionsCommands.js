import { apiRequest, getCompanyId } from '../_shared/apiClient';
import {
  getSubscriptionByCompanyQuery,
  verifySubscriptionQuery,
  getConsumableOrderItemQuery,
  getNormalBundleOrderItemQuery,
  verifySubscriptionCreatedQuery,
  deleteSubscriptionQuery,
  getActiveNormalSubscriptionQuery,
  verifyRealEndDateQuery,
  verifySerialNumberQuery,
  setSubscriptionStatusQuery,
  verifySubscriptionStatusQuery,
  verifyAutoRenewQuery
} from './subscriptionQueries';
import {
  getNotePayload,
  getAutoRenewPayload,
  getConsumableSubscriptionPayload,
  getNormalBundleSubscriptionPayload
} from './subscriptionPayloads';

// Re-export payload functions so test can access via subscriptions.*
export { getConsumableSubscriptionPayload, getNormalBundleSubscriptionPayload };

// ── DB reads ──────────────────────────────────────────────

// Get latest active subscription from DB (beforeEach)
export function getSubscriptionFromDB() {
  const companyId = getCompanyId();
  const query = getSubscriptionByCompanyQuery(companyId);
  return cy.task('queryDb', query);
}

// Get active normal subscription with no real_end_date (Test 5)
export function getActiveNormalSubscriptionFromDB() {
  const companyId = getCompanyId();
  const query = getActiveNormalSubscriptionQuery(companyId);
  return cy.task('queryDb', query);
}

// Get eligible consumable order item for subscription creation (Test 3)
export function getConsumableOrderItemFromDB() {
  const companyId = getCompanyId();
  const query = getConsumableOrderItemQuery(companyId);
  return cy.task('queryDb', query);
}

// Get eligible normal bundle order item for subscription creation (Test 4)
export function getNormalBundleOrderItemFromDB() {
  const companyId = getCompanyId();
  const query = getNormalBundleOrderItemQuery(companyId);
  return cy.task('queryDb', query);
}

// ── API calls ─────────────────────────────────────────────

// Fetch all subscriptions: Test 1
export function getCustomerSubscriptions() {
  return apiRequest('GET', '/subscriptions');
}

// Fetch single subscription by ID: Test 2
export function getSubscriptionById(subscriptionId) {
  return apiRequest('GET', `/subscriptions/${subscriptionId}`);
}

// Create a subscription: Tests 3 & 4
export function createSubscription(subscriptionData) {
  return apiRequest('POST', '/subscriptions', {
    body: subscriptionData
  });
}

// Update a subscription (real_end_date, serial_number, etc.): Tests 5 & 7
export function updateSubscription(subscriptionId, updateBody) {
  return apiRequest('PUT', `/subscriptions/${subscriptionId}`, {
    body: updateBody
  });
}

// Add note to subscription: Test 6
export function addSubscriptionNote(subscriptionId) {
  const payload = getNotePayload();
  return apiRequest('POST', `/subscriptions/${subscriptionId}/notes`, {
    body: payload,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Reactivate subscription: Test 8
export function reactivateSubscription(subscriptionId) {
  return apiRequest('POST', `/subscriptions/${subscriptionId}/reactivate`);
}

// Toggle auto_renew: Tests 9 & 10
export function toggleAutoRenew(subscriptionId, autoRenew) {
  const payload = getAutoRenewPayload(autoRenew);
  return apiRequest('PUT', `/subscriptions/${subscriptionId}/auto-renew`, {
    body: payload
  });
}

// ── DB verification ───────────────────────────────────────

// Verify subscription exists in DB (Test 2)
export function verifySubscriptionInDB(subscriptionId) {
  const query = verifySubscriptionQuery(subscriptionId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`Subscription ${subscriptionId} verified in DB`);
  });
}

// Verify subscription was created in DB (Tests 3 & 4)
export function verifySubscriptionCreatedInDB(subscriptionId) {
  const query = verifySubscriptionCreatedQuery(subscriptionId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`Subscription created in DB: ${subscriptionId}, status: ${result[0].status}`);
  });
}

// Verify real_end_date was updated (Test 5)
export function verifyRealEndDateInDB(subscriptionId) {
  const query = verifyRealEndDateQuery(subscriptionId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    expect(result[0].real_end_date).to.not.be.null;
    cy.log(`real_end_date verified: ${result[0].real_end_date}`);
  });
}

// Verify serial_number was updated (Test 7)
export function verifySerialNumberInDB(subscriptionId, expectedSerial) {
  const query = verifySerialNumberQuery(subscriptionId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    expect(result[0].serial_number).to.eq(expectedSerial);
    cy.log(`serial_number verified: ${result[0].serial_number}`);
  });
}

// Verify subscription status (Test 8)
export function verifySubscriptionStatusInDB(subscriptionId, expectedStatus) {
  const query = verifySubscriptionStatusQuery(subscriptionId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    expect(result[0].status).to.eq(expectedStatus);
    cy.log(`Subscription status verified: ${result[0].status}`);
  });
}

// Verify auto_renew value (Tests 9 & 10)
export function verifyAutoRenewInDB(subscriptionId, expectedValue) {
  const query = verifyAutoRenewQuery(subscriptionId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    expect(result[0].auto_renew).to.eq(expectedValue);
    cy.log(`auto_renew verified: ${result[0].auto_renew}`);
  });
}

// ── DB mutations ──────────────────────────────────────────

// Delete subscription from DB (cleanup for Tests 3 & 4)
export function deleteSubscriptionFromDB(subscriptionId) {
  const companyId = getCompanyId();
  const query = deleteSubscriptionQuery(subscriptionId, companyId);
  return cy.task('queryDb', query).then(() => {
    cy.log(`Deleted subscription ${subscriptionId} from DB`);
  });
}

// Set subscription status in DB (Test 8 setup)
export function setSubscriptionStatusInDB(subscriptionId, status) {
  const query = setSubscriptionStatusQuery(subscriptionId, status);
  return cy.task('queryDb', query).then(() => {
    cy.log(`Set subscription ${subscriptionId} status to '${status}' in DB`);
  });
}
