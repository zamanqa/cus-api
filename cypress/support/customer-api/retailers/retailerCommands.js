import { apiRequest, getCompanyId } from '../_shared/apiClient';
import {
  getRetailerByCompanyQuery,
  verifyRetailerByIdQuery,
  verifyRetailerByLocationIdQuery,
} from './retailerQueries';

// ── DB reads ──────────────────────────────────────────────

// Get latest retailer from DB (beforeEach)
export function getRetailerFromDB() {
  const companyId = getCompanyId();
  const query = getRetailerByCompanyQuery(companyId);
  return cy.task('queryDb', query);
}

// ── API calls ─────────────────────────────────────────────

// Fetch all retailers: Test 1
export function getAllRetailers() {
  return apiRequest('GET', '/retailers');
}

// Fetch retailer by location_id: Test 2
export function getRetailerByLocationId(locationId) {
  return apiRequest('GET', `/retailers/${locationId}`);
}

// Create a new retailer: Test 3
export function createRetailer(retailerData) {
  return apiRequest('POST', '/retailers', {
    body: retailerData,
  });
}

// Update a retailer by ID: Test 4
export function updateRetailer(retailerId, updateData) {
  return apiRequest('PUT', `/retailers/${retailerId}`, {
    body: updateData,
  });
}

// ── DB verification ───────────────────────────────────────

// Verify retailer exists in DB by location_id (Test 2)
export function verifyRetailerByLocationIdInDB(locationId) {
  const companyId = getCompanyId();
  const query = verifyRetailerByLocationIdQuery(companyId, locationId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`DB verification -- retailer exists for location_id: ${locationId}`);
    cy.log(`DB retailer: id=${result[0].id}, name=${result[0].name}, enabled=${result[0].enabled}`);
  });
}

// Verify retailer exists in DB by ID (Test 3, Test 4)
export function verifyRetailerInDB(retailerId) {
  const companyId = getCompanyId();
  const query = verifyRetailerByIdQuery(companyId, retailerId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`DB verification -- retailer exists for id: ${retailerId}`);
    cy.log(`DB retailer: location_id=${result[0].location_id}, name=${result[0].name}, enabled=${result[0].enabled}`);
  });
}
