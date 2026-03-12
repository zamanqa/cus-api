import * as recurringPayments from '../../../support/customer-api/recurring-payments/recurringPaymentsCommands';

describe('Customer Recurring Payments API', () => {

  // Fetch the latest recurring payment from DB before each test
  beforeEach(() => {
    recurringPayments.getRecurringPaymentFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      const rp = result[0];

      cy.log('DB recurring payment found:');
      cy.log('ID:', rp.id);
      cy.log('Subscription ID:', rp.subscription_id);
      cy.log('Billing Date:', rp.billing_date);
      cy.log('Status:', rp.status);
      cy.log('Amount:', rp.amount);

      Cypress.env('dbRecurringPaymentId', rp.id);
    });
  });

  it('Test 1: Fetch all recurring payments and log details', () => {
    recurringPayments.getRecurringPayments().then((response) => {
      expect(response.status).to.eq(200);

      const data = response.body.data;
      expect(data).to.be.an('array').and.have.length.greaterThan(0);

      const first = data[0];

      cy.log('Total recurring payments returned:', data.length);
      cy.log('First ID:', first.id);
      cy.log('First Status:', first.status);
      cy.log('First Amount:', first.amount);
      cy.log('First Billing Date:', first.billing_date);
      cy.log('First Subscription ID:', first.subscription_id);
    });
  });

  it('Test 2: Fetch single recurring payment by ID and verify in DB', () => {
    const recurringPaymentId = Cypress.env('dbRecurringPaymentId');
    expect(recurringPaymentId).to.exist;

    cy.log('Fetching recurring payment by ID:', recurringPaymentId);

    recurringPayments.getRecurringPaymentById(recurringPaymentId).then((response) => {
      expect(response.status).to.eq(200);

      const rp = response.body;
      cy.log('Fetched ID:', rp.id);
      cy.log('Status:', rp.status);
      cy.log('Amount:', rp.amount);
      cy.log('Billing Date:', rp.billing_date);
      cy.log('Subscription ID:', rp.subscription_id);
      cy.log('Enabled:', rp.enabled);
      cy.log('Payment Settled:', rp.payment_settled);
      cy.log('Created At:', rp.created_at);
    });

    // Verify recurring payment exists in DB
    recurringPayments.verifyRecurringPaymentInDB(recurringPaymentId);
  });
});
