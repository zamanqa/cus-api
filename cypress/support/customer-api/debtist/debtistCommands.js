import { apiRequest, getCompanyId } from '../_shared/apiClient';
import {
  getDebtistClaimQuery,
  verifyDebtistClaimQuery,
  getClaimableInvoiceQuery,
  prepareInvoiceForClaimQuery,
  verifyClaimCreatedForInvoiceQuery,
} from './debtistQueries';

// ── DB reads ──────────────────────────────────────────────

// Get a debtist claim from DB (beforeEach)
export function getDebtistClaimFromDB() {
  const companyId = getCompanyId();
  const query = getDebtistClaimQuery(companyId);
  return cy.task('queryDb', query);
}

// Get an eligible invoice for filing a claim (Test 4)
export function getClaimableInvoiceFromDB() {
  const companyId = getCompanyId();
  const query = getClaimableInvoiceQuery(companyId);
  return cy.task('queryDb', query);
}

// ── DB mutations ──────────────────────────────────────────

// Set invoice + transaction dates to now-3days and status to failed (Test 4 setup)
export function prepareInvoiceForClaim(transactionId) {
  const companyId = getCompanyId();
  const query = prepareInvoiceForClaimQuery(companyId, transactionId);
  return cy.task('queryDb', query);
}

// ── API calls ─────────────────────────────────────────────

// GET all claims: Test 1
export function getAllClaims() {
  return apiRequest('GET', '/debtist/claims');
}

// GET claim by ID: Test 2
export function getClaimById(claimId) {
  return apiRequest('GET', `/debtist/claims/${claimId}`);
}

// GET claim by invoice number: Test 3
export function getClaimByInvoice(invoiceId) {
  return apiRequest('GET', `/debtist/invoice/${invoiceId}/claim`);
}

// POST file claim for invoice: Test 4
export function fileClaimForInvoice(invoiceId) {
  return apiRequest('POST', `/debtist/invoice/${invoiceId}/claim`);
}

// GET debtist invoices: Test 5
export function getDebtistInvoices() {
  return apiRequest('GET', '/debtist/invoices');
}

// GET debtist customers: Test 6
export function getDebtistCustomers() {
  return apiRequest('GET', '/debtist/customers');
}

// ── DB verification ───────────────────────────────────────

// Verify claim exists in DB by claim_id
export function verifyDebtistClaimInDB(claimId) {
  const companyId = getCompanyId();
  const query = verifyDebtistClaimQuery(companyId, claimId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`DB verification -- claim_id: ${claimId}`);
    cy.log(`Status: ${result[0].status}, Stage: ${result[0].stage}`);
    cy.log(`Amount due: ${result[0].original_amount_due}`);
  });
}

// Verify claim was created for a specific invoice
export function verifyClaimCreatedForInvoiceInDB(invoiceId) {
  const companyId = getCompanyId();
  const query = verifyClaimCreatedForInvoiceQuery(companyId, invoiceId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`DB verification -- claim created for invoice: ${invoiceId}`);
    cy.log(`Claim ID: ${result[0].claim_id}, Status: ${result[0].status}`);
  });
}
