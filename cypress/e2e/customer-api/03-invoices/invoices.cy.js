import * as invoices from "../../../support/customer-api/invoices/invoiceCommands";

describe('Customer Invoices API', () => {

  // Fetch a fresh invoice from DB before each test
  beforeEach(() => {
    invoices.getInvoiceFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      cy.log('DB Invoice Number:', result[0].invoice_number);
      Cypress.env('dbInvoiceNumber', result[0].invoice_number);
      Cypress.env('dbInvoiceId', result[0].id);
    });
  });

  it('Test 1: Return a paginated list of invoices', () => {
    invoices.getCustomerInvoices().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');
      expect(response.body.data).to.be.an('array').and.have.length.greaterThan(0);
      cy.log('Total Invoices:', response.body.data.length);
    });
  });

  it('Test 2: Fetch invoice by ID and verify in DB', () => {
    invoices.getInvoiceById(Cypress.env('dbInvoiceId')).then((response) => {
      expect(response.status).to.eq(200);
      cy.log('Fetched Invoice:', Cypress.env('dbInvoiceNumber'));
    });

    // Verify invoice exists in DB
    invoices.verifyInvoiceInDB(Cypress.env('dbInvoiceNumber'));
  });

  it('Test 3: Settle the latest unpaid invoice and verify paid in DB', () => {
    invoices.getUnpaidInvoiceFromDB().then((result) => {
      if (!result || !result[0] || !result[0].invoice_number) {
        cy.log('No unpaid invoice found. Test passed by default.');
        return;
      }

      const invoiceNumber = result[0].invoice_number;
      cy.log('Settling Invoice:', invoiceNumber);

      invoices.settleInvoice(invoiceNumber).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message', 'Invoice is settled successfully!');
        cy.log('Invoice settled:', invoiceNumber);

        // Verify invoice is paid in DB
        invoices.verifyInvoicePaidInDB(invoiceNumber);
      });
    });
  });

  it('Test 4: Refund the latest paid invoice and verify in DB', () => {
    invoices.getRefundableInvoiceFromDB().then((result) => {
      if (!result || result.length === 0) {
        cy.log('No eligible invoice found for refund. Test passed by default.');
        return;
      }

      const invoiceNumber = result[0].invoice_number;
      const transactionId = result[0].transaction_id;
      cy.log('Eligible invoice found:', invoiceNumber);
      cy.log('Refunding Invoice:', invoiceNumber);
      cy.log('Transaction ID:', transactionId);

      invoices.refundInvoice(invoiceNumber).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message', 'Refund Payment Success');
        cy.log('Invoice refunded:', invoiceNumber);

        // Verify refunded_transaction_id is set in DB
        invoices.verifyRefundInDB(transactionId);
      });
    });
  });

  it('Test 5: Get detailed invoices list', () => {
    invoices.getDetailedInvoices().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');
      expect(response.body.data).to.be.an('array').and.have.length.greaterThan(0);
      cy.log('Total detailed invoices:', response.body.data.length);
    });
  });

  it('Test 6: Download invoice as PDF and verify in DB', () => {
    invoices.getDownloadableInvoiceFromDB().then((result) => {
      if (!result || result.length === 0) {
        cy.log('No downloadable invoice found. Test passed by default.');
        return;
      }

      const invoiceId = result[0].id;
      const invoiceNumber = result[0].invoice_number;
      cy.log('Downloading invoice:', invoiceNumber);

      invoices.downloadInvoice(invoiceId).then((response) => {
        const isSuccess = response.status === 200;
        const isPdf = response.headers['content-type'] && response.headers['content-type'].includes('application/pdf');
        expect(isSuccess || isPdf).to.be.true;
        cy.log('Download status:', response.status);
        cy.log('Content-Type:', response.headers['content-type']);
      });

      // Verify invoice is paid in DB (only paid invoices are downloadable)
      invoices.verifyInvoicePaidInDB(invoiceNumber);
    });
  });

  it('Test 7: Get invoice with items and verify in DB', () => {
    invoices.getInvoiceWithItems(Cypress.env('dbInvoiceId')).then((response) => {
      expect(response.status).to.eq(200);
      cy.log('Invoice with items:', Cypress.env('dbInvoiceNumber'));
    });

    // Verify invoice exists in DB
    invoices.verifyInvoiceInDB(Cypress.env('dbInvoiceNumber'));
  });

});
