// cypress/support/customer_api/voucherCommands.js
import { customerApiConfig } from './config';

Cypress.Commands.add('getAllVouchers', () => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/vouchers`,
    auth: customerApiConfig.auth,
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000
  }).then((response) => {
    return cy.wait(5000).then(() => {
      expect(response.status).to.eq(200);

      // Check if 'data' exists and it's an array
      const vouchers = response.body.data;
      if (Array.isArray(vouchers) && vouchers.length > 0) {
        // Return the first voucher object
        return vouchers[0];
      } else {
        throw new Error('No vouchers found.');
      }
    });
  });
});


function generateRandomVoucherCode() {
  const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
  return `test${randomDigits}`;
}

Cypress.Commands.add('createVoucher', () => {
  const voucherCode = generateRandomVoucherCode();

  return cy.request({
    method: 'POST',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/vouchers`,
    auth: customerApiConfig.auth,
    headers: { 'Content-Type': 'application/json' },
    body: {
      description: 'Test Voucher',
      discount_amount: '20',
      discount_percent: null,
      email: null,
      expiry_date: '2044-04-01 00:00:00',
      name: 'Test_1234',
      one_time_use: true,
      recurring_discount: true,
      valid: true,
      visible: true,
      voucher_code: voucherCode,
      specify_variants: true
    },
    failOnStatusCode: false
  }).then((response) => {
    return cy.wait(10000).then(() => {
      expect(response.status).to.eq(200);
      Cypress.env('savedVoucherCode', response.body.voucher_code);
      return response.body;
    });
  });
});
