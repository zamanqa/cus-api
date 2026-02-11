// cypress/integration/voucherTests.cy.js

import '../../../support/customer_api/voucherCommands'; // Import the custom command
import { customerApiConfig } from '../../../support/customer_api/config';

describe('Voucher API Tests', () => {

  let voucherCode;

  // Test Case 1: Fetch All Vouchers and Save the First Voucher Code
  it('Test 1: should fetch all vouchers and save the voucher code', () => {
    cy.getAllVouchers().then((firstVoucher) => {
      expect(firstVoucher, 'First voucher should exist').to.exist;
      expect(firstVoucher.voucher_code, 'First voucher should have a voucher code').to.exist;

      // Log and save the voucher code
      cy.log(`Saved Voucher Code: ${firstVoucher.voucher_code}`);
      voucherCode = firstVoucher.voucher_code; // Save the voucher code
      Cypress.env('savedVoucherCode', voucherCode); // Store it in Cypress environment for future use
    });
  });

  // Test Case 2: Fetch Voucher by Saved Voucher Code
  it('Test 2: should fetch a specific voucher by voucher code', () => {
    const savedVoucherCode = Cypress.env('savedVoucherCode'); // Retrieve the saved voucher code

    // Ensure the voucher code exists
    expect(savedVoucherCode, 'Voucher Code should exist').to.exist;

    // Fetch the specific voucher using the saved voucher code
    cy.request({
      method: 'GET',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/vouchers/${savedVoucherCode}`,
      auth: customerApiConfig.auth,
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000
    }).then((response) => {
      expect(response.status).to.eq(200);
      const voucher = response.body;

      // Assert the voucher has the correct code and other properties
      expect(voucher).to.have.property('voucher_code', savedVoucherCode);
      cy.log(`Fetched Voucher Code: ${voucher.voucher_code}`);
    });
  });

it('should create a new voucher with a random code', () => {
    cy.createVoucher().then((voucher) => {
      expect(voucher).to.have.property('voucher_code');
      cy.log(`Created Voucher Code: ${voucher.voucher_code}`);
    });
  });

  it('should fetch the newly created voucher by code', () => {
    const savedVoucherCode = Cypress.env('savedVoucherCode');
    expect(savedVoucherCode, 'Saved voucher code must exist').to.exist;

    cy.request({
      method: 'GET',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/vouchers/${savedVoucherCode}`,
      auth: customerApiConfig.auth,
      headers: { 'Content-Type': 'application/json' },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.voucher_code).to.eq(savedVoucherCode);
    });
  });






});
