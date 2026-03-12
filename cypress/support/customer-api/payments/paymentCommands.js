import { apiRequest, getCompanyId } from '../_shared/apiClient';
import {
  getPaymentEligibleOrderQuery,
  checkInvoiceCreatedForOrderQuery
} from './paymentQueries';
import { getOneTimePaymentPayload } from './paymentPayloads';

// Get payment-eligible order from DB
export function getPaymentEligibleOrderFromDB() {
  const companyId = getCompanyId();
  const query = getPaymentEligibleOrderQuery(companyId);
  return cy.task('queryDb', query);
}

// Issue a one-time payment for an order
export function issueOneTimePayment(orderId) {
  const payload = getOneTimePaymentPayload(orderId);
  return apiRequest('POST', '/payments/one-time-payments', {
    body: payload
  });
}

// GET refund payments: Test 2
export function getRefundPayments() {
  return apiRequest('GET', '/payments/refund-payments');
}

// Verify invoice was created for the order in DB
export function verifyInvoiceCreatedInDB(orderId) {
  const query = checkInvoiceCreatedForOrderQuery(orderId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`Invoice created in DB for order ${orderId}: invoice_number = ${result[0].invoice_number}`);
  });
}
