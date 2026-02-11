import "../../../support/customer_api/databaseUtil";
import "../../../support/customer_api/orderCommands";

describe('Customer Orders API - Separated Tests Using Commands', () => {
  
  it('Test 1: Return a paginated list of orders and store first order ID', () => {
    cy.getCustomerOrders().then((response) => {
      const firstOrderId = response.body.data[0].id;
      // Log the orderId in the first test
      cy.log('First Order ID:', firstOrderId);
      
      // Store the orderId in Cypress environment variables
      Cypress.env('orderId', firstOrderId);
    });
  });

  it('Test 2: Find order by ID and verify it matches', () => {
    const orderId = Cypress.env('orderId');
    
    // Log the stored orderId
    cy.log('Stored Order ID:', orderId);
    
    // Assert that the orderId passed from the first test is the same
    cy.getCustomerOrders().then((response) => {
      const firstOrderId = response.body.data[0].id;
      
      // Verify that the orderId passed is the same as the one from the first test
      expect(orderId).to.eq(firstOrderId, 'The order IDs should match');
    });
    
    cy.getOrderById(orderId).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it('Test 3: Create a new order with random 12-digit order_id', () => {
    cy.createCustomerOrder().then((response) => {
      const orderId = response.body.order_id; // or wherever it's returned
      cy.log('Created Order ID:', orderId);
      Cypress.env('orderId', orderId);
    });
  
    cy.checkCustomerOrderExistsInDatabase();
    cy.checkCustomerOrderItemExistsInDatabase();
  });

  it('Test 4: Open payment update link for a specific order', () => {
    const orderId = '5953662091402';
  
    cy.getPaymentUpdateLink(orderId).then((response) => {
      expect(response.status).to.eq(200);
      const link = response.body.link;
  
      cy.log('Opening link:', link);
      expect(link).to.be.a('string').and.not.to.be.empty;
    });
  });

  it('Test 5: Fetch payment details and verify provider', () => {
    const orderId = '5953662091402';
  
    cy.getPaymentDetails(orderId).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('payment_provider', 'stripe');
  
      cy.log('Payment Provider:', response.body.payment_provider);
    });
  });
  
  it('Test 6: Create a note to order and verify success', () => {
    const orderId = '5953662091402';
  
    const notePayload = {
      author: "amine",
      message: "test",
      description: "test",
      pinned: false
    };
  
    cy.postOrderNote(orderId, notePayload).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('success', true);
  
      cy.log('Note successfully posted.');
    });
  });

  it('Test 7: Fulfill order using stored order ID', () => {
    const orderId = Cypress.env('orderId'); // should already be set from a previous test
  
    cy.fulfillOrders([orderId]).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property(
        'message',
        '1:orders meet fulfillment criteria, process started.'
      );
  
      cy.log('Fulfillment triggered for order:', orderId);
    });
  });

  it('Test 8:  Cancel order using stored order ID', () => {
    const orderId = Cypress.env('orderId');
    cy.cancelOrder(orderId).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.deep.equal({
        success: true,
        message: 'Cancelled'
      });
  
      cy.log('Order cancelled:', orderId);
    });
  });


it('Test 9: Tag order using stored order ID', () => {
  const orderId = Cypress.env('orderId');

  const tagPayload = {
    tag: 'lost',
    tag_date: '2025-03-13'
  };

  cy.tagOrder(orderId, tagPayload).then((response) => {
    expect(response.status).to.eq(200);
    cy.log('Order tagged successfully:', response.body);
  });
});




  
});
