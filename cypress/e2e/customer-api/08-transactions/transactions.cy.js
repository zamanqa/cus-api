import "../../../support/customer_api/databaseUtil";
import "../../../support/customer_api/orderCommands";
import "../../../support/customer_api/transactionsCommands";

describe('Customer Transactions API', () => {
  it('Test 1: Fetch all transactions and store first transaction ID', () => {
    cy.getCustomerTransactions().then((response) => {
      expect(response.status).to.eq(200);
      const firstTransactionId = response.body.data[0].id;
      Cypress.env('transactionId', firstTransactionId);
      cy.log('Stored Transaction ID:', firstTransactionId);
    });
  });

  it('Test 2: Fetch single transaction using stored transaction ID', () => {
    const transactionId = Cypress.env('transactionId');
    expect(transactionId).to.be.a('string').and.not.to.be.empty;

    cy.getTransactionById(transactionId).then((response) => {
      expect(response.status).to.eq(200);
      cy.log('Fetched Transaction:', response.body);
    });
  });
});