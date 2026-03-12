import { apiRequest, getCompanyId } from '../_shared/apiClient';
import {
  getProductTrackingByCompanyQuery,
  getActiveSubscriptionSerialsQuery,
  getRepairSerialForStockQuery,
  verifyProductTrackingBySerialQuery,
  verifyLocationStatusQuery,
} from './productTrackingQueries';

// ── DB reads ──────────────────────────────────────────────

// Get latest product tracking record from DB (beforeEach)
export function getProductTrackingFromDB() {
  const companyId = getCompanyId();
  const query = getProductTrackingByCompanyQuery(companyId);
  return cy.task('queryDb', query);
}

// Get 1 serial from active subscription for repair→stock sequential tests (beforeEach)
export function getActiveSubscriptionSerials() {
  const companyId = getCompanyId();
  const query = getActiveSubscriptionSerialsQuery(companyId);
  return cy.task('queryDb', query);
}

// Get 1 serial with "to repair" status for stock test (beforeEach — Test 4)
export function getRepairSerialForStock() {
  const companyId = getCompanyId();
  const query = getRepairSerialForStockQuery(companyId);
  return cy.task('queryDb', query);
}

// ── API calls ─────────────────────────────────────────────

// Fetch all product tracking records: Test 1
export function getAllProductTracking() {
  return apiRequest('GET', '/product-tracking');
}

// Fetch product tracking by serial number: Test 2
export function getProductTrackingBySerial(serialNumber) {
  return apiRequest('GET', `/product-tracking/${serialNumber}`);
}

// Send repair request for a serial number: Test 3
export function postRepairRequest(serialNumber) {
  return apiRequest('POST', `/product-tracking/${serialNumber}/repair`, {
    body: { delete_rps: true },
  });
}

// Send stock request for a serial number: Test 4
export function postStockRequest(serialNumber) {
  return apiRequest('POST', `/product-tracking/${serialNumber}/stock?do_not_restock=false`, {
    body: { location: 'Berlin' },
  });
}

// ── DB verification ───────────────────────────────────────

// Verify product tracking record exists in DB by serial number (Test 2)
export function verifyProductTrackingInDB(serialNumber) {
  const companyId = getCompanyId();
  const query = verifyProductTrackingBySerialQuery(companyId, serialNumber);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`DB verification -- product tracking exists for serial: ${serialNumber}`);
    cy.log(`DB product: ${result[0].product_name}, location_status: ${result[0].location_status}, location: ${result[0].location}`);
  });
}

// Verify location status updated correctly in DB after repair/stock request (Test 3, Test 4)
export function verifyLocationStatusInDB(serialNumber, expectedStatus) {
  const companyId = getCompanyId();
  const query = verifyLocationStatusQuery(companyId, serialNumber);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    expect(result[0].location_status).to.eq(expectedStatus);
    cy.log(`DB verification -- location status for serial: ${serialNumber}`);
    cy.log(`Expected: ${expectedStatus}, Actual: ${result[0].location_status}`);
    cy.log(`DB location: ${result[0].location}, updated_at: ${result[0].updated_at}`);
  });
}
