// In cypress/integration/createDraftOrder.cy.js

import '../../../support/customer_api/draftOrdersCommands';  // Import custom commands
import { customerApiConfig } from '../../../support/customer_api/config';  // Import API config for authentication

describe('Create, Delete Draft Order and Visit Checkout', () => {
  const draftOrderPayload = {
    "remarks": "",
    "charge_by_invoice": false,
    "customer": {
      "email": "christoph+58@circuly.io",
      "phone": "+4928388",
      "vat_number": "",
      "external_customer_id": "5000145",
      "default_locale": "de",
      "date_of_birth": null,
      "marketing_consent": false,
      "billing": {
        "address_addition": "12",
        "alpha2": "de",
        "alpha3": "",
        "city": "Frankfurt am Main",
        "company": "",
        "country": "Germany",
        "first_name": "Michael",
        "last_name": "Otto",
        "note": "",
        "postal_code": "60320",
        "region": null,
        "street": "Fritz Str.",
        "street_number": "21"
      },
      "shipping": {
        "address_addition": "12",
        "alpha2": "de",
        "alpha3": "",
        "city": "Frankfurt am Main",
        "company": "",
        "country": "Germany",
        "first_name": "Zaman",
        "last_name": "Zaman",
        "note": "",
        "postal_code": "60320",
        "region": null,
        "street": "Fritz Str.",
        "street_number": "21"
      }
    },
    "items": [
      {
        "discount_amount": 0,
        "expected_revenue": 0,
        "name": "Simple product no variant | Black / Small",
        "price": 299,
        "product_id": 11139,
        "quantity": 1,
        "sku": "43014354600074",
        "sku_name": "24890000",
        "subscription": true,
        "subscription_duration": 1,
        "subscription_duration_prepaid": 1,
        "subscription_end": "2025-02-12",
        "subscription_frequency": "monthly",
        "subscription_frequency_interval": 1,
        "subscription_start": "2025-01-13",
        "subscription_type": "normal",
        "thumbnail": "",
        "variant_id": 15756,
        "voucher_code": null,
        "shop_variant_id": "43014354600074"
      }
    ]
  };

  // Test 1: Create a new draft order and visit checkout link
  it('Test 1: should create a draft order and visit checkout link', () => {
    cy.createDraftOrder(draftOrderPayload).then(({ id, order_checkout_link }) => {
      cy.log(`Draft Order ID: ${id}`);
      cy.log(`Checkout Link: ${order_checkout_link}`);

      // Visit the checkout link
      cy.visit(order_checkout_link);
      cy.contains("Address & Payment").should("be.visible");
    });
  });

  // Test 2: Fetch all draft orders and save the first ID
  it('Test 2: should fetch all draft orders and save the first ID', () => {
    cy.getAllDraftOrders().then((firstOrder) => {
      expect(firstOrder, 'First draft order should exist').to.exist;
      expect(firstOrder.id, 'First draft order should have an ID').to.exist;

      // Log the saved ID and store it for later use
      cy.log(`Saved Draft Order ID: ${firstOrder.id}`);
      Cypress.env('savedDraftOrderId', firstOrder.id);  // Save the ID for later use
    });
  });

  // Test 3: Fetch a specific draft order by ID and validate its content
  it('Test 3: should fetch a specific draft order by ID', () => {
    const draftOrderId = Cypress.env('savedDraftOrderId');  // Retrieve the saved draft order ID

    // Ensure the ID exists
    expect(draftOrderId, 'Draft Order ID should exist').to.exist;

    // Send a GET request using the saved ID to fetch the specific draft order details
    cy.request({
      method: 'GET',
      url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/draft-orders/${draftOrderId}`,
      auth: customerApiConfig.auth,
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000
    }).then((response) => {
      expect(response.status).to.eq(200);  // Ensure the response status is 200 (OK)
      const order = response.body;

      // Assert that the draft order has the expected structure
      expect(order).to.have.property('id', draftOrderId);  // Ensure the fetched order ID matches the saved one
      expect(order).to.have.property('order_checkout_link');  // Ensure the order has the checkout link

      // Log the fetched draft order details
      cy.log(`Fetched Draft Order ID: ${order.id}`);
      cy.log(`Checkout Link: ${order.order_checkout_link}`);
    });
  });

it('Test 4: should delete a specific draft order by ID', () => {
  const draftOrderId = Cypress.env('savedDraftOrderId');  // Retrieve the saved draft order ID

  // Ensure the ID exists
  expect(draftOrderId, 'Draft Order ID should exist').to.exist;

  // Delete the draft order using the custom command with the updated 20-second timeout
  cy.deleteDraftOrderById(draftOrderId).then(() => {
    // Log the successful deletion (this happens after the DELETE request finishes)
    cy.log(`Draft Order with ID ${draftOrderId} deleted successfully.`);
  });
});

});
