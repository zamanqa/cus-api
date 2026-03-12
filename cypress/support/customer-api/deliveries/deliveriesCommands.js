import { apiRequest, getCompanyId } from '../_shared/apiClient';
import {
  getShippingDateFromDBQuery,
  verifyDeliveryByDateQuery
} from './deliveryQueries';

// ── DB reads ──────────────────────────────────────────────

// Get distinct shipping dates from DB (beforeEach)
export function getShippingDateFromDB() {
  const companyId = getCompanyId();
  const query = getShippingDateFromDBQuery(companyId);
  return cy.task('queryDb', query);
}

// ── API calls ─────────────────────────────────────────────

// Fetch all deliveries: Test 1
export function getAllDeliveries() {
  return apiRequest('GET', '/deliveries');
}

// Fetch deliveries by shipping date: Test 2
export function getDeliveryByDate(shippingDate) {
  return apiRequest('GET', `/deliveries/${encodeURIComponent(shippingDate)}`);
}

// ── DB verification ───────────────────────────────────────

// Verify delivery exists in DB for a shipping date (Test 2)
export function verifyDeliveryInDB(shippingDate) {
  const companyId = getCompanyId();
  const query = verifyDeliveryByDateQuery(companyId, shippingDate);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`DB verification — delivery exists for shipping date: ${shippingDate}`);
    cy.log(`DB record ID: ${result[0].id}, subscription_id: ${result[0].subscription_id}`);
  });
}
