import "../../../support/customer_api/databaseUtil";
import "../../../support/customer_api/orderCommands";
import "../../../support/customer_api/transactionsCommands";
import "../../../support/customer_api/invoiceCommands";

describe('Customer Invoices API', () => {
  it('Test 1: Fetches invoices and validates the response', () => {
    cy.getCustomerInvoices().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');

      const invoices = response.body.data;
      expect(invoices).to.be.an('array').and.have.length.greaterThan(0);

      const invoiceIds = invoices.map(inv => inv.id);
      const lastInvoiceId = invoiceIds[invoiceIds.length - 1];

      cy.log(`Last Invoice ID: ${lastInvoiceId}`);
      Cypress.env('lastInvoiceId', lastInvoiceId);
    });
  });

  it('Test 2: Fetches the last invoice using its ID', () => {
    const lastInvoiceId = Cypress.env('lastInvoiceId');
    expect(lastInvoiceId).to.exist;

    cy.getInvoiceById(lastInvoiceId).then((response) => {
      expect(response.status).to.eq(200);
      cy.log(`Fetched invoice with ID: ${lastInvoiceId}`);
    });
  });

  it('Test 3: Should settle the latest unpaid invoice successfully', () => {
    cy.settleLatestUnpaidInvoice().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('message').that.is.oneOf([
      'Invoice is settled successfully!',
      'No unpaid invoice found'
    ]);;
    });
  });

  it('Test 4: Should refund the latest paid invoice successfully', () => {
    cy.refundLatestPaidInvoice().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('message', 'Refund Payment Success');
    });
  });
});
