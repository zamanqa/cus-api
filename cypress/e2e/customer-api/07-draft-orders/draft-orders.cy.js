import * as draftOrders from '../../../support/customer-api/draft-orders/draftOrdersCommands';

describe('Draft Orders API', () => {

  // Fetch a valid subscription product variant from DB before each test
  beforeEach(() => {
    draftOrders.getSubscriptionProductVariantFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      const variant = result[0];

      cy.log('DB product variant found:');
      cy.log('Product ID:', variant.product_id);
      cy.log('Variant ID:', variant.variant_id);
      cy.log('SKU:', variant.sku);
      cy.log('Shop Variant ID:', variant.shop_variant_id);
      cy.log('Price:', variant.price);
      cy.log('Product Name:', variant.product_name);

      Cypress.env('dbProductId', Number(variant.product_id));
      Cypress.env('dbVariantId', Number(variant.variant_id));
      Cypress.env('dbSku', variant.sku);
      Cypress.env('dbShopVariantId', variant.shop_variant_id);
      Cypress.env('dbPrice', variant.price);
      Cypress.env('dbProductName', `${variant.product_name} | ${variant.variant_name}`);
    });
  });

  it('Test 1: Create a new draft order with dynamic product data and verify in DB', () => {
    const productId = Cypress.env('dbProductId');
    const variantId = Cypress.env('dbVariantId');
    const sku = Cypress.env('dbSku');
    const shopVariantId = Cypress.env('dbShopVariantId');
    const price = Cypress.env('dbPrice');
    const productName = Cypress.env('dbProductName');

    const payload = draftOrders.getDraftOrderPayload(
      productId, variantId, sku, shopVariantId, price, productName
    );

    cy.log('Creating draft order with:');
    cy.log('Product ID:', productId);
    cy.log('Variant ID:', variantId);
    cy.log('SKU:', sku);
    cy.log('Price:', price);

    draftOrders.createDraftOrder(payload).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('order_checkout_link');

      const draftOrderId = response.body.id;
      const checkoutLink = response.body.order_checkout_link;

      cy.log('Draft Order created successfully');
      cy.log('Draft Order ID:', draftOrderId);
      cy.log('Checkout Link:', checkoutLink);

      Cypress.env('createdDraftOrderId', draftOrderId);

      // Verify draft order exists in DB
      draftOrders.verifyDraftOrderCreatedInDB(draftOrderId);
    });
  });

  it('Test 2: Fetch all draft orders and save the first ID', () => {
    draftOrders.getAllDraftOrders().then((response) => {
      expect(response.status).to.eq(200);

      const orders = response.body.data;
      expect(orders).to.be.an('array').and.have.length.greaterThan(0);

      const firstOrder = orders[0];

      cy.log('Total draft orders returned:', orders.length);
      cy.log('First Draft Order ID:', firstOrder.id);
      cy.log('First Draft Order Status:', firstOrder.status);
      cy.log('First Draft Order Checkout Link:', firstOrder.order_checkout_link);

      Cypress.env('savedDraftOrderId', firstOrder.id);
    });
  });

  it('Test 3: Fetch a specific draft order by ID', () => {
    const draftOrderId = Cypress.env('savedDraftOrderId');
    expect(draftOrderId, 'Draft Order ID should exist').to.exist;

    cy.log('Fetching draft order by ID:', draftOrderId);

    draftOrders.getDraftOrderById(draftOrderId).then((response) => {
      expect(response.status).to.eq(200);

      const order = response.body;
      expect(order).to.have.property('id', draftOrderId);
      expect(order).to.have.property('order_checkout_link');

      cy.log('Fetched Draft Order ID:', order.id);
      cy.log('Status:', order.status);
      cy.log('Checkout Link:', order.order_checkout_link);
      cy.log('Created At:', order.created_at);
    });
  });

  it('Test 4: Delete a specific draft order by ID and verify in DB', () => {
    const draftOrderId = Cypress.env('savedDraftOrderId');
    expect(draftOrderId, 'Draft Order ID should exist').to.exist;

    cy.log('Deleting draft order with ID:', draftOrderId);

    draftOrders.deleteDraftOrderById(draftOrderId).then((response) => {
      expect(response.status).to.eq(200);
      cy.log('Draft Order deleted successfully, ID:', draftOrderId);

      // Verify draft order is soft-deleted in DB
      draftOrders.verifyDraftOrderDeletedInDB(draftOrderId);
    });
  });
});
