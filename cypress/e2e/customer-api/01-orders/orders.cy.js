import * as orders from "../../../support/customer-api/orders/orderCommands";

describe('Customer Orders API - Separated Tests Using Commands', () => {

  // Fetch a fresh open order_id from DB before each test
  beforeEach(() => {
    orders.getOrderIdFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      cy.log('DB Order ID:', result[0].order_id);
      Cypress.env('dbOrderId', result[0].order_id);
    });
  });

  it('Test 1: Return a paginated list of orders', () => {
    orders.getCustomerOrders().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data.length).to.be.greaterThan(0);
      cy.log('Total Orders:', response.body.data.length);
    });
  });

  it('Test 2: Find order by ID from DB and verify via API', () => {
    orders.getOrderById(Cypress.env('dbOrderId')).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it('Test 3: Create a new order with random 12-digit order_id', () => {
    orders.createCustomerOrder().then((response) => {
      const createdOrderId = response.body.order_id;
      cy.log('Created Order ID:', createdOrderId);

      orders.checkCustomerOrderExistsInDatabase(createdOrderId);
    });
  });

  it('Test 4: Open payment update link for a specific order', () => {
    orders.getPaymentUpdateLink(Cypress.env('dbOrderId')).then((response) => {
      expect(response.status).to.eq(200);
      const link = response.body.link;

      cy.log('Opening link:', link);
      expect(link).to.be.a('string').and.not.to.be.empty;
    });
  });

  it('Test 5: Fetch payment details and verify provider', () => {
    orders.getPaymentDetails(Cypress.env('dbOrderId')).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('payment_provider', 'stripe');

      cy.log('Payment Provider:', response.body.payment_provider);
    });
  });

  it('Test 6: Create a note to order and verify success', () => {
    const notePayload = {
      author: "amine",
      message: "test",
      description: "test",
      pinned: false
    };

    orders.postOrderNote(Cypress.env('dbOrderId'), notePayload).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('success', true);

      cy.log('Note successfully posted.');
    });
  });

  it('Test 7: Fulfill order using DB order ID', { defaultCommandTimeout: 120000 }, () => {
    // Step 1: Delete stale jobs
    orders.deleteStaleJobs();

    // Step 2: Disable all crons
    orders.disableAllCrons();

    // Step 3: Enable specific cron for customer API queue
    orders.enableSpecificCrons();

    // Print status before fulfill
    orders.getOrderStatus(Cypress.env('dbOrderId'));

    // Step 3: Trigger fulfillment
    orders.fulfillOrders([Cypress.env('dbOrderId')]).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property(
        'message',
        '1:orders meet fulfillment criteria, process started.'
      );

      cy.log('Fulfillment triggered for order:', Cypress.env('dbOrderId'));
    });

    // Wait 90s for fulfillment to process
    cy.wait(90000);

    // Verify in DB that order status is fulfilled
    orders.verifyOrderStatusInDB(Cypress.env('dbOrderId'), 'fulfilled');

    // Reset all crons after test
    orders.resetAllCrons();
  });

  it('Test 8: Cancel order using DB order ID', () => {
    // Print status before cancel
    orders.getOrderStatus(Cypress.env('dbOrderId'));

    orders.cancelOrder(Cypress.env('dbOrderId')).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.deep.equal({
        success: true,
        message: 'Cancelled'
      });

      cy.log('Order cancelled:', Cypress.env('dbOrderId'));
    });

    // Verify in DB that order status is cancelled
    orders.verifyOrderStatusInDB(Cypress.env('dbOrderId'), 'cancelled');
  });

  it('Test 9: Tag order using DB order ID', () => {
    const tagPayload = {
      tag: 'lost',
      tag_date: '2025-03-13'
    };

    orders.tagOrder(Cypress.env('dbOrderId'), tagPayload).then((response) => {
      expect(response.status).to.eq(200);
      cy.log('Order tagged successfully:', response.body);
    });
  });

  it('Test 10: Charge order using chargeable order from DB', () => {
    orders.getChargeableOrderIdFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      const orderId = result[0].order_id;
      cy.log('Chargeable Order ID:', orderId);

      orders.chargeOrder(orderId).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  it('Test 11: Generate invoice for invoiceable order from DB', () => {
    orders.getInvoiceableOrderIdFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      const orderId = result[0].order_id;
      cy.log('Invoiceable Order ID:', orderId);

      orders.generateInvoice(orderId).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
      });
    });
  });

  it('Test 12: Update order address using DB order ID', () => {
    orders.updateOrderAddress(Cypress.env('dbOrderId')).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      cy.log('Order address updated for:', Cypress.env('dbOrderId'));
    });
  });

});
