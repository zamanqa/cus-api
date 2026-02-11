import '../../../support/customer_api/paymentCommands';

describe('Customer Payments API', () => {
  it('Issue a one-time payment with latest eligible order ID', () => {
    const query = `
      SELECT order_id FROM orders
      WHERE payment_provider = 'stripe'
        AND payment_method_token = 'visa'
        AND status = 'open'
        AND transaction_id IS NOT NULL
        AND company_id = '734f-4c766638po'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    cy.task('queryDb', query).then((result) => {
      expect(result.length).to.be.greaterThan(0);
      const orderId = result[0].order_id;
      Cypress.env('orderId', orderId);

      cy.issueOneTimePayment(orderId).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq("Invoice is created and sent successfully!");
        cy.log('One-time payment issued for order:', orderId);
      });
    });
  });
});
