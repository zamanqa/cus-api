import { apiRequest, getCompanyId } from '../_shared/apiClient';
import {
  getActiveConsumableSubscriptionQuery,
  getActiveNormalSubscriptionQuery,
  getDeliveryIdQuery,
  getProductVariantIdQuery,
  getStripeBuyoutSubscriptionQuery,
  getOrderVariantQuery,
} from './cssQueries';

// ── DB reads ──────────────────────────────────────────────

// Get active consumable subscription (beforeEach — Tests 1–5)
export function getActiveConsumableSubscriptionFromDB() {
  const companyId = getCompanyId();
  const query = getActiveConsumableSubscriptionQuery(companyId);
  return cy.task('queryDb', query);
}

// Get active normal subscription (beforeEach — Test 6)
export function getActiveNormalSubscriptionFromDB() {
  const companyId = getCompanyId();
  const query = getActiveNormalSubscriptionQuery(companyId);
  return cy.task('queryDb', query);
}

// Get delivery ID for shipping date update (Test 3)
export function getDeliveryIdFromDB() {
  const companyId = getCompanyId();
  const query = getDeliveryIdQuery(companyId);
  return cy.task('queryDb', query);
}

// Get product variant ID for bundle swap (Test 5)
export function getProductVariantIdFromDB() {
  const companyId = getCompanyId();
  const query = getProductVariantIdQuery(companyId);
  return cy.task('queryDb', query);
}

// Get active normal subscription with stripe for buyout (Test 7)
export function getStripeBuyoutSubscriptionFromDB() {
  const companyId = getCompanyId();
  const query = getStripeBuyoutSubscriptionQuery(companyId);
  return cy.task('queryDb', query);
}

// Get variant and parent order for customer order creation (Test 8)
export function getOrderVariantFromDB() {
  const companyId = getCompanyId();
  const query = getOrderVariantQuery(companyId);
  return cy.task('queryDb', query);
}

// ── API calls ─────────────────────────────────────────────

// GET subscription deliveries: Test 1
export function getSubscriptionDeliveries(subscriptionId) {
  return apiRequest('GET', `/css/subscriptions/${subscriptionId}/deliveries`);
}

// POST report issue: Test 2
export function reportSubscriptionIssue(subscriptionId, issuePayload) {
  return apiRequest('POST', `/css/subscriptions/${subscriptionId}/report-issue`, {
    body: issuePayload,
  });
}

// PUT update shipping date: Test 3
export function updateShippingDate(deliveryId, shippingDate, shift = true) {
  return apiRequest('PUT', `/css/deliveries/${deliveryId}/shipping-date`, {
    body: { shift, shipping_date: shippingDate },
  });
}

// PUT change subscription frequency: Test 4
export function changeSubscriptionFrequency(subscriptionId, frequency, interval) {
  return apiRequest('PUT', `/css/subscriptions/${subscriptionId}/change-frequency`, {
    body: {
      subscription_frequency: frequency,
      subscription_frequency_interval: interval,
    },
  });
}

// POST bundle swap: Test 5
export function bundleSwap(subscriptionId, productVariantId) {
  return apiRequest('POST', `/css/subscriptions/${subscriptionId}/bundle-swap`, {
    body: { product_variant_id: productVariantId },
  });
}

// POST cancel subscription: Test 6
export function cancelSubscription(subscriptionId, cancelPayload) {
  return apiRequest('POST', `/css/subscriptions/${subscriptionId}/cancel`, {
    body: cancelPayload,
  });
}

// POST process buyout: Test 7
export function processBuyout(subscriptionId, buyoutPayload) {
  return apiRequest('POST', `/css/subscriptions/${subscriptionId}/process-buyout`, {
    body: buyoutPayload,
  });
}

// POST create order by customer: Test 8
export function createOrderByCustomer(orderPayload) {
  return apiRequest('POST', '/css/orders/subscriptions', {
    body: orderPayload,
  });
}
