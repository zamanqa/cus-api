import * as vouchers from '../../../support/customer-api/vouchers/voucherCommands';

describe('Customer API - Vouchers', () => {

  // Fetch the first voucher from API before each test
  beforeEach(() => {
    vouchers.getAllVouchers().then((response) => {
      expect(response.status).to.eq(200);

      const data = response.body.data;
      expect(data).to.be.an('array').and.have.length.greaterThan(0);

      const v = data[0];

      cy.log('API voucher found:');
      cy.log('Voucher Code:', v.voucher_code);
      cy.log('Name:', v.name);
      cy.log('Discount Amount:', v.discount_amount);
      cy.log('Discount Percent:', v.discount_percent);
      cy.log('Valid:', v.valid);
      cy.log('Visible:', v.visible);

      Cypress.env('dbVoucherCode', v.voucher_code);
    });
  });

  it('Test 1: Fetch all vouchers and log details', () => {
    vouchers.getAllVouchers().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data').and.to.be.an('array');

      const data = response.body.data;
      expect(data.length).to.be.greaterThan(0);

      const first = data[0];

      cy.log('Total vouchers returned:', data.length);
      cy.log('First Voucher Code:', first.voucher_code);
      cy.log('First Name:', first.name);
      cy.log('First Discount Amount:', first.discount_amount);
      cy.log('First Valid:', first.valid);
      cy.log('First Visible:', first.visible);
    });
  });

  it('Test 2: Fetch voucher by code and verify details', () => {
    const voucherCode = Cypress.env('dbVoucherCode');
    expect(voucherCode).to.exist;

    cy.log('Fetching voucher by code:', voucherCode);

    vouchers.getVoucherByCode(voucherCode).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('voucher_code', voucherCode);

      cy.log('Fetched Voucher Code:', response.body.voucher_code);
      cy.log('Name:', response.body.name);
      cy.log('Description:', response.body.description);
      cy.log('Discount Amount:', response.body.discount_amount);
      cy.log('Discount Percent:', response.body.discount_percent);
      cy.log('Expiry Date:', response.body.expiry_date);
      cy.log('One Time Use:', response.body.one_time_use);
      cy.log('Valid:', response.body.valid);
    });
  });

  it('Test 3: Create a new voucher and verify via API', () => {
    const uniqueSuffix = Date.now();
    const voucherData = {
      description: 'E2E Test Voucher',
      discount_amount: '20',
      discount_percent: null,
      email: null,
      expiry_date: '2044-04-01 00:00:00',
      name: `Test Voucher ${uniqueSuffix}`,
      one_time_use: true,
      recurring_discount: true,
      valid: true,
      visible: true,
      voucher_code: `test-${uniqueSuffix}`,
      specify_variants: true,
    };

    cy.log('Creating voucher with code:', voucherData.voucher_code);
    cy.log('Voucher name:', voucherData.name);
    cy.log('Discount amount:', voucherData.discount_amount);

    vouchers.createVoucher(voucherData).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      expect(response.body).to.have.property('voucher_code');

      cy.log('Created Voucher Code:', response.body.voucher_code);
      cy.log('Created Name:', response.body.name);
      cy.log('Created Discount Amount:', response.body.discount_amount);

      Cypress.env('createdVoucherCode', response.body.voucher_code);
    });
  });

  it('Test 4: Fetch the created voucher by code and verify details', () => {
    const voucherCode = Cypress.env('createdVoucherCode');
    expect(voucherCode, 'createdVoucherCode must be set by Test 3').to.exist;

    cy.log('Fetching created voucher by code:', voucherCode);

    vouchers.getVoucherByCode(voucherCode).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('voucher_code', voucherCode);
      expect(response.body.valid).to.be.true;

      cy.log('Fetched Voucher Code:', response.body.voucher_code);
      cy.log('Name:', response.body.name);
      cy.log('Discount Amount:', response.body.discount_amount);
      cy.log('Valid:', response.body.valid);
      cy.log('One Time Use:', response.body.one_time_use);
      cy.log('Expiry Date:', response.body.expiry_date);
    });
  });

  it('Test 5: Update the created voucher and verify changes', () => {
    const voucherCode = Cypress.env('createdVoucherCode');
    expect(voucherCode, 'createdVoucherCode must be set by Test 3').to.exist;

    // Fetch current voucher first, then send only allowed fields
    vouchers.getVoucherByCode(voucherCode).then((getResponse) => {
      expect(getResponse.status).to.eq(200);

      const current = getResponse.body;
      const updateData = {
        voucher_code: current.voucher_code,
        name: `${current.name} Updated`,
        discount_percent: 10,
        one_time_use: false,
        recurring_discount: false,
        valid: false,
        visible: false,
      };

      const voucherId = current.id;
      cy.log('Updating voucher ID:', voucherId, 'code:', voucherCode);
      cy.log('New name:', updateData.name);
      cy.log('New discount percent:', updateData.discount_percent);
      cy.log('New valid:', updateData.valid);

      vouchers.updateVoucher(voucherId, updateData).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);

        cy.log('Updated Voucher Code:', response.body.voucher_code);
        cy.log('Updated Discount Percent:', response.body.discount_percent);
        cy.log('Updated Valid:', response.body.valid);
      });
    });
  });
});
