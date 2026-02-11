import '../../../support/customer_api/recurringPaymentsCommands';

describe('Customer Recurring Payments API', () => {

  it('Test 1: Fetch all recurring payments and store first recurring payment ID', () => {
    cy.getRecurringPayments().then((response) => {
      expect(response.status).to.eq(200);
      const firstRecurringPaymentId = response.body.data[0].id;
      Cypress.env('recurringPaymentId', firstRecurringPaymentId);
      cy.log('Stored Recurring Payment ID:', firstRecurringPaymentId);
    });
  });

  it('Test 2: Fetch recurring payment by stored ID', () => {
    const recurringPaymentId = Cypress.env('recurringPaymentId');
    expect(recurringPaymentId).to.be.a('string').and.not.to.be.empty;

    cy.getRecurringPaymentById(recurringPaymentId).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.id).to.eq(recurringPaymentId);
      cy.log('Recurring Payment Details:', response.body);
    });
  });

});
