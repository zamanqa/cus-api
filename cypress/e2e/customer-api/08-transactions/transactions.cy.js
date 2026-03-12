import * as transactions from '../../../support/customer-api/transactions/transactionsCommands';

describe('Customer Transactions API', () => {

  // Fetch the latest transaction from DB before each test
  beforeEach(() => {
    transactions.getTransactionFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      const txn = result[0];

      cy.log('DB transaction found:');
      cy.log('Transaction ID:', txn.transaction_id);
      cy.log('Type:', txn.type);
      cy.log('Status:', txn.status);
      cy.log('Amount Paid:', txn.amount_paid);
      cy.log('Invoice Number:', txn.invoice_number);
      cy.log('Order ID:', txn.order_id);

      Cypress.env('dbTransactionId', txn.transaction_id);
    });
  });

  it('Test 1: Fetch all transactions and log details', () => {
    transactions.getCustomerTransactions().then((response) => {
      expect(response.status).to.eq(200);

      const data = response.body.data;
      expect(data).to.be.an('array').and.have.length.greaterThan(0);

      const first = data[0];

      cy.log('Total transactions returned:', data.length);
      cy.log('First Transaction ID:', first.transaction_id || first.id);
      cy.log('First Type:', first.type);
      cy.log('First Status:', first.status);
      cy.log('First Amount Paid:', first.amount_paid);
      cy.log('First Invoice Number:', first.invoice_number);
    });
  });

  it('Test 2: Fetch single transaction by ID and verify in DB', () => {
    const transactionId = Cypress.env('dbTransactionId');
    expect(transactionId).to.exist;

    cy.log('Fetching transaction by ID:', transactionId);

    transactions.getTransactionById(transactionId).then((response) => {
      expect(response.status).to.eq(200);

      const txn = response.body;
      cy.log('Fetched Transaction ID:', txn.transaction_id || txn.id);
      cy.log('Type:', txn.type);
      cy.log('Status:', txn.status);
      cy.log('Amount Paid:', txn.amount_paid);
      cy.log('Invoice Number:', txn.invoice_number);
      cy.log('Order ID:', txn.order_id);
      cy.log('Created At:', txn.created_at);
    });

    // Verify transaction exists in DB
    transactions.verifyTransactionInDB(transactionId);
  });
});
