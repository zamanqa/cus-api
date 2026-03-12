import { apiRequest, getCompanyId } from '../_shared/apiClient';
import {
  getRecurringPaymentByCompanyQuery,
  verifyRecurringPaymentByIdQuery,
} from './recurringPaymentQueries';

// ── DB reads ──────────────────────────────────────────────

// Get latest recurring payment from DB (beforeEach)
export function getRecurringPaymentFromDB() {
  const companyId = getCompanyId();
  const query = getRecurringPaymentByCompanyQuery(companyId);
  return cy.task('queryDb', query);
}

// ── API calls ─────────────────────────────────────────────

// Fetch all recurring payments: Test 1
export function getRecurringPayments() {
  return apiRequest('GET', '/recurring-payments');
}

// Fetch a specific recurring payment by ID: Test 2
export function getRecurringPaymentById(id) {
  return apiRequest('GET', `/recurring-payments/${id}`);
}

// ── DB verification ───────────────────────────────────────

// Verify recurring payment exists in DB by id (Test 2)
export function verifyRecurringPaymentInDB(recurringPaymentId) {
  const query = verifyRecurringPaymentByIdQuery(recurringPaymentId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`DB verification — recurring payment exists with ID: ${recurringPaymentId}`);
    cy.log(`DB status: ${result[0].status}, amount: ${result[0].amount}, enabled: ${result[0].enabled}`);
  });
}
