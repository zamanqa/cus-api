import { apiRequest, getCompanyId } from '../_shared/apiClient';
import {
  getNoteByCompanyQuery,
  getNoteBySubscriptionQuery,
  getNoteByTransactionQuery,
} from './noteQueries';

// ── DB reads ──────────────────────────────────────────────

// Get a note from DB (beforeEach — provides note ID + order_id)
export function getNoteFromDB() {
  const companyId = getCompanyId();
  const query = getNoteByCompanyQuery(companyId);
  return cy.task('queryDb', query);
}

// Get a note with subscription_id from DB (Test 6)
export function getNoteBySubscriptionFromDB() {
  const companyId = getCompanyId();
  const query = getNoteBySubscriptionQuery(companyId);
  return cy.task('queryDb', query);
}

// Get a note with transaction_id from DB (Test 4)
export function getNoteByTransactionFromDB() {
  const companyId = getCompanyId();
  const query = getNoteByTransactionQuery(companyId);
  return cy.task('queryDb', query);
}

// ── API calls ─────────────────────────────────────────────

// GET all notes: Test 1
export function getAllNotes() {
  return apiRequest('GET', '/notes');
}

// GET note by ID: Test 2
export function getNoteById(noteId) {
  return apiRequest('GET', `/notes/${noteId}`);
}

// GET notes filtered by order_id: Test 3
export function getNotesByOrderId(orderId) {
  return apiRequest('GET', `/notes?order_id=${orderId}`);
}

// GET notes filtered by transaction_id: Test 4
export function getNotesByTransactionId(transactionId) {
  return apiRequest('GET', `/notes?transaction_id=${transactionId}`);
}

// GET notes filtered by customer_id: Test 5
export function getNotesByCustomerId(customerId) {
  return apiRequest('GET', `/notes?customer_id=${customerId}`);
}

// GET notes filtered by subscription_id: Test 6
export function getNotesBySubscriptionId(subscriptionId) {
  return apiRequest('GET', `/notes?subscription_id=${subscriptionId}`);
}
