import { apiRequest, getCompanyId } from '../_shared/apiClient';
import {
  getInvoiceByCompanyQuery,
  getInvoiceByNumberQuery,
  getUnpaidInvoiceQuery,
  getRefundableInvoiceQuery,
  getDownloadableInvoiceQuery,
  checkInvoicePaidQuery,
  checkRefundedTransactionQuery
} from './invoiceQueries';
import { getRefundPayload } from './invoicePayloads';

// Get latest invoice from DB by company_id
export function getInvoiceFromDB() {
  const companyId = getCompanyId();
  const query = getInvoiceByCompanyQuery(companyId);
  return cy.task('queryDb', query);
}

// Return a paginated list of invoices: Test 1
export function getCustomerInvoices() {
  return apiRequest('GET', '/invoices');
}

// Get invoice by ID: Test 2
export function getInvoiceById(invoiceId) {
  return apiRequest('GET', `/invoices/${invoiceId}`);
}

// Settle invoice by invoice number
export function settleInvoice(invoiceNumber) {
  return apiRequest('POST', `/invoices/${invoiceNumber}/settle`);
}

// Refund invoice by invoice number
export function refundInvoice(invoiceNumber) {
  const payload = getRefundPayload();
  return apiRequest('POST', `/invoices/${invoiceNumber}/refund`, {
    body: payload,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Get unpaid invoice from DB for settle test
export function getUnpaidInvoiceFromDB() {
  const companyId = getCompanyId();
  const query = getUnpaidInvoiceQuery(companyId);
  return cy.task('queryDb', query);
}

// Get refundable invoice from DB for refund test
export function getRefundableInvoiceFromDB() {
  const companyId = getCompanyId();
  const query = getRefundableInvoiceQuery(companyId);
  return cy.task('queryDb', query);
}

// Verify invoice is paid in DB
export function verifyInvoicePaidInDB(invoiceNumber) {
  const query = checkInvoicePaidQuery(invoiceNumber);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    expect(result[0].paid).to.eq(true);
    cy.log(`Invoice ${invoiceNumber} verified as paid in DB`);
  });
}

// Verify invoice exists in DB by invoice_number
export function verifyInvoiceInDB(invoiceNumber) {
  const query = getInvoiceByNumberQuery(invoiceNumber);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`Invoice ${invoiceNumber} exists in DB`);
  });
}

// Get detailed invoices list: Test 5
export function getDetailedInvoices() {
  return apiRequest('GET', '/invoices/detailed');
}

// Download invoice as PDF: Test 6
export function downloadInvoice(invoiceId) {
  return apiRequest('GET', `/invoices/${invoiceId}/download`, {
    failOnStatusCode: false
  });
}

// Get a downloadable (paid) invoice from DB
export function getDownloadableInvoiceFromDB() {
  const companyId = getCompanyId();
  const query = getDownloadableInvoiceQuery(companyId);
  return cy.task('queryDb', query);
}

// Get invoice with items: Test 7
export function getInvoiceWithItems(invoiceId) {
  return apiRequest('GET', `/invoices-with-items/${invoiceId}`);
}

// Verify refunded_transaction_id is set in transactions table
export function verifyRefundInDB(transactionId) {
  const query = checkRefundedTransactionQuery(transactionId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    expect(result[0].refunded_transaction_id).to.eq(transactionId);
    cy.log(`Refund verified in DB: refunded_transaction_id = ${transactionId}`);
  });
}
