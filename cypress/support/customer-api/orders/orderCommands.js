import { apiRequest, getCompanyId } from '../_shared/apiClient';
import {
  getOrderIdQuery,
  getChargeableOrderIdQuery,
  getInvoiceableOrderIdQuery,
  checkOrderExistsQuery,
  checkOrderItemExistsQuery,
  getOrderStatusQuery,
  deleteStaleJobsQuery,
  disableAllCronsQuery,
  enableSpecificCronsQuery,
  resetAllCronsQuery
} from './orderQueries';
import { getCreateOrderPayload, getUpdateAddressPayload } from './orderPayloads';

//Return a paginated list of orders: Test 1
export function getCustomerOrders() {
  return apiRequest('GET', '/orders');
}

//Get order_id from DB (non-subscription, visa, open, checkout)
export function getOrderIdFromDB() {
  const companyId = Cypress.env('companyId');
  const query = getOrderIdQuery(companyId);
  return cy.task('queryDb', query);
}

//Find order by ID: Test 2
export function getOrderById(orderId) {
  return apiRequest('GET', `/orders/${orderId}`);
}

//Creates a new order: Test 3
export function createCustomerOrder() {
  const requestBody = getCreateOrderPayload();

  return apiRequest('POST', '/orders', {
    body: requestBody,
    headers: { 'Content-Type': 'application/json' }
  });
}

//Update Payment method: Test 4
export function getPaymentUpdateLink(orderId) {
  return apiRequest('GET', `/orders/${orderId}/payment-update-link`);
}

// Get payment details
export function getPaymentDetails(orderId) {
  return apiRequest('GET', `/orders/${orderId}/payment-details`);
}

// Add note
export function postOrderNote(orderId, note) {
  return apiRequest('POST', `/orders/${orderId}/notes`, {
    body: note,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Process fulfill
export function fulfillOrders(orderIds) {
  return apiRequest('POST', '/orders/fulfill', {
    body: { order_ids: orderIds },
    headers: { 'Content-Type': 'application/json' }
  });
}

// Cancel order
export function cancelOrder(orderId) {
  return apiRequest('POST', `/orders/${orderId}/cancel`, {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Get chargeable order_id from DB (open, payment_required, stripe, cms) filtered by company
export function getChargeableOrderIdFromDB() {
  const companyId = getCompanyId();
  const query = getChargeableOrderIdQuery(companyId);
  return cy.task('queryDb', query);
}

// Charge order
export function chargeOrder(orderId) {
  return apiRequest('POST', `/orders/${orderId}/charge`);
}

// Get invoiceable order_id from DB (pending, has transaction with initial_invoice) filtered by company
export function getInvoiceableOrderIdFromDB() {
  const companyId = getCompanyId();
  const query = getInvoiceableOrderIdQuery(companyId);
  return cy.task('queryDb', query);
}

// Generate invoice for order
export function generateInvoice(orderId) {
  return apiRequest('POST', `/orders/${orderId}/generate-invoice`, {
    body: { send_email: true },
    headers: { 'Content-Type': 'application/json' }
  });
}

// Update order address
export function updateOrderAddress(orderId) {
  const requestBody = getUpdateAddressPayload();
  return apiRequest('PUT', `/orders/${orderId}/address`, {
    body: requestBody,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Update order Tag
export function tagOrder(orderId, tagPayload) {
  return apiRequest('PUT', `/orders/${orderId}/tag`, {
    body: tagPayload,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Get order status from DB
export function getOrderStatus(orderId) {
  const query = getOrderStatusQuery(orderId);
  return cy.task('queryDb', query).then((result) => {
    cy.log(`Order ${orderId} status: ${result[0]?.status}`);
  });
}

// Verify order status in DB matches expected value
export function verifyOrderStatusInDB(orderId, expectedStatus) {
  const query = getOrderStatusQuery(orderId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    expect(result[0].status).to.eq(expectedStatus);
    cy.log(`Order ${orderId} status verified: ${expectedStatus}`);
  });
}

// Delete stale jobs from rp and invoiceCharge queues
export function deleteStaleJobs() {
  const query = deleteStaleJobsQuery();
  return cy.task('queryDb', query).then(() => {
    cy.log('Stale jobs deleted (rp, invoiceCharge with 0 attempts)');
  });
}

// Disable all crons
export function disableAllCrons() {
  const query = disableAllCronsQuery();
  return cy.task('queryDb', query).then(() => {
    cy.log('All crons disabled');
  });
}

// Enable specific crons for customer API queue
export function enableSpecificCrons() {
  const query = enableSpecificCronsQuery();
  return cy.task('queryDb', query).then(() => {
    cy.log('Customer API queue cron enabled');
  });
}

// Reset all crons (disable all)
export function resetAllCrons() {
  const query = resetAllCronsQuery();
  return cy.task('queryDb', query).then(() => {
    cy.log('All crons reset (disabled)');
  });
}

// Check if order exists in DB
export function checkCustomerOrderExistsInDatabase(orderId) {
  const query = checkOrderExistsQuery(orderId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`Order ${orderId} exists in the database`);
  });
}

// Check if order items exist in DB
export function checkCustomerOrderItemExistsInDatabase(orderId) {
  const query = checkOrderItemExistsQuery(orderId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`Order items for ${orderId} exist in the database (${result.length} items)`);
  });
}
