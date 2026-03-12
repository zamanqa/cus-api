import { apiRequest, getCompanyId } from '../_shared/apiClient';
import {
  getProductByCompanyQuery,
  getVariantByCompanyQuery,
  getLatestProductIdQuery,
  getLatestVariantIdQuery,
  verifyProductByIdQuery,
  verifyVariantByIdQuery,
  verifyVariantStockQuery,
} from './productVariantQueries';

// ── DB reads ──────────────────────────────────────────────

// Get latest active product from DB (beforeEach)
export function getProductFromDB() {
  const companyId = getCompanyId();
  const query = getProductByCompanyQuery(companyId);
  return cy.task('queryDb', query);
}

// Get latest active variant from DB (beforeEach)
export function getVariantFromDB() {
  const companyId = getCompanyId();
  const query = getVariantByCompanyQuery(companyId);
  return cy.task('queryDb', query);
}

// Get latest product_id from product_variants (for creating a variant)
export function getLatestProductIdFromDB() {
  const companyId = getCompanyId();
  const query = getLatestProductIdQuery(companyId);
  return cy.task('queryDb', query);
}

// Get latest variant id from DB (for update tests)
export function getLatestVariantIdFromDB() {
  const companyId = getCompanyId();
  const query = getLatestVariantIdQuery(companyId);
  return cy.task('queryDb', query);
}

// ── API calls ─────────────────────────────────────────────

// Fetch all products: Test 1
export function getProducts() {
  return apiRequest('GET', '/products');
}

// Fetch all variants: Test 2
export function getVariants() {
  return apiRequest('GET', '/variants');
}

// Fetch variants for a specific product by product ID: Test 3
export function getVariantsByProductId(productId) {
  return apiRequest('GET', `/products/${productId}/variants`);
}

// Create a new product: Test 4
export function createProduct(productData) {
  return apiRequest('POST', '/products', {
    body: productData,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Create a variant for a product: Test 5
export function createVariant(productId, variantData) {
  return apiRequest('POST', `/products/${productId}/variants`, {
    body: variantData,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Update a variant by ID: Test 6
export function updateVariant(variantId, updateData) {
  return apiRequest('PUT', `/variants/${variantId}`, {
    body: updateData,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── DB verification ───────────────────────────────────────

// Verify product exists in DB by id (Test 4)
export function verifyProductInDB(productId) {
  const companyId = getCompanyId();
  const query = verifyProductByIdQuery(companyId, productId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`DB verification — product exists with ID: ${productId}`);
    cy.log(`DB title: ${result[0].title}, sku: ${result[0].sku}, stock: ${result[0].stock}`);
  });
}

// Verify variant exists in DB by id (Test 5)
export function verifyVariantInDB(variantId) {
  const companyId = getCompanyId();
  const query = verifyVariantByIdQuery(companyId, variantId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    cy.log(`DB verification — variant exists with ID: ${variantId}`);
    cy.log(`DB title: ${result[0].title}, sku: ${result[0].sku}, price: ${result[0].price}`);
  });
}

// Verify variant stock matches expected value in DB (Test 6)
export function verifyVariantStockInDB(variantId, expectedStock) {
  const companyId = getCompanyId();
  const query = verifyVariantStockQuery(companyId, variantId);
  return cy.task('queryDb', query).then((result) => {
    expect(result.length).to.be.greaterThan(0);
    expect(Number(result[0].stock)).to.eq(expectedStock);
    cy.log(`DB verification — variant ${variantId} stock is ${expectedStock}`);
    cy.log(`DB title: ${result[0].title}`);
  });
}
