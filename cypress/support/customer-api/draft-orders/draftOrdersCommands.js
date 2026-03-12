import { apiRequest, getCompanyId } from '../_shared/apiClient';
import {
  getSubscriptionProductVariantQuery,
  getLatestDraftOrderQuery,
  verifyDraftOrderCreatedQuery,
  verifyDraftOrderDeletedQuery,
} from './draftOrderQueries';
import { getDraftOrderPayload } from './draftOrderPayloads';

// Re-export payload so tests access via draftOrders.*
export { getDraftOrderPayload };

// ── DB reads ──────────────────────────────────────────────

// Get a valid subscription product variant from DB (beforeEach)
export function getSubscriptionProductVariantFromDB() {
  const companyId = getCompanyId();
  const query = getSubscriptionProductVariantQuery(companyId);
  return cy.task('queryDb', query);
}

// Get the latest draft order from DB (beforeEach)
export function getLatestDraftOrderFromDB() {
  const companyId = getCompanyId();
  const query = getLatestDraftOrderQuery(companyId);
  return cy.task('queryDb', query);
}

// ── API calls ─────────────────────────────────────────────

// Create a new draft order: Test 1
export function createDraftOrder(payload) {
  return apiRequest('POST', '/draft-orders', {
    body: payload,
    timeout: 20000,
    failOnStatusCode: false,
  });
}

// Fetch all draft orders: Test 2
export function getAllDraftOrders() {
  return apiRequest('GET', '/draft-orders', {
    timeout: 20000,
  });
}

// Fetch a specific draft order by ID: Test 3
export function getDraftOrderById(orderId) {
  return apiRequest('GET', `/draft-orders/${orderId}`, {
    timeout: 20000,
  });
}

// Delete a draft order by ID: Test 4
export function deleteDraftOrderById(orderId) {
  return apiRequest('DELETE', `/draft-orders/${orderId}`, {
    timeout: 20000,
    failOnStatusCode: false,
  });
}

// ── DB verification ───────────────────────────────────────

// Verify draft order was created in DB (Test 1)
export function verifyDraftOrderCreatedInDB(draftOrderId) {
  const companyId = getCompanyId();
  const query = verifyDraftOrderCreatedQuery(companyId, draftOrderId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`DB verification — draft order exists with ID: ${draftOrderId}`);
    cy.log(`DB status: ${result[0].status}, created_at: ${result[0].created_at}`);
  });
}

// Verify draft order was deleted in DB (Test 4)
export function verifyDraftOrderDeletedInDB(draftOrderId) {
  const query = verifyDraftOrderDeletedQuery(draftOrderId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`DB verification — draft order ${draftOrderId} is soft-deleted`);
    cy.log(`DB deleted_at: ${result[0].deleted_at}`);
  });
}
