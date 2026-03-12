import { apiRequest, getCompanyId } from '../_shared/apiClient';
import {
  getTransactionByCompanyQuery,
  verifyTransactionByIdQuery,
} from './transactionQueries';

// ── DB reads ──────────────────────────────────────────────

// Get latest transaction from DB (beforeEach)
export function getTransactionFromDB() {
  const companyId = getCompanyId();
  const query = getTransactionByCompanyQuery(companyId);
  return cy.task('queryDb', query);
}

// ── API calls ─────────────────────────────────────────────

// Fetch all transactions: Test 1
export function getCustomerTransactions() {
  return apiRequest('GET', '/transactions');
}

// Fetch a specific transaction by ID: Test 2
export function getTransactionById(transactionId) {
  return apiRequest('GET', `/transactions/${transactionId}`);
}

// ── DB verification ───────────────────────────────────────

// Verify transaction exists in DB by transaction_id (Test 2)
export function verifyTransactionInDB(transactionId) {
  const companyId = getCompanyId();
  const query = verifyTransactionByIdQuery(companyId, transactionId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`DB verification — transaction exists with ID: ${transactionId}`);
    cy.log(`DB type: ${result[0].type}, status: ${result[0].status}, amount: ${result[0].amount_paid}`);
  });
}
