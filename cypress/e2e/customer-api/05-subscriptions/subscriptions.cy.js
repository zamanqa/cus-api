import * as subscriptions from "../../../support/customer-api/subscriptions/subscriptionsCommands";
import dayjs from 'dayjs';

describe('Customer Subscriptions API', () => {

  // Fetch a fresh active subscription from DB before each test
  beforeEach(() => {
    subscriptions.getSubscriptionFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      const sub = result[0];
      cy.log('DB Subscription ID:', sub.subscription_id);
      Cypress.env('dbSubscriptionId', sub.subscription_id);
      Cypress.env('dbSubscriptionStatus', sub.status);
      Cypress.env('dbSubscriptionAutoRenew', sub.auto_renew);
    });
  });

  it('Test 1: Return a paginated list of subscriptions', () => {
    subscriptions.getCustomerSubscriptions().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');
      expect(response.body.data).to.be.an('array').and.have.length.greaterThan(0);
      cy.log('Total subscriptions:', response.body.data.length);
    });
  });

  it('Test 2: Fetch subscription by ID and verify in DB', () => {
    const subscriptionId = Cypress.env('dbSubscriptionId');

    subscriptions.getSubscriptionById(subscriptionId).then((response) => {
      expect(response.status).to.eq(200);
      cy.log('Fetched subscription:', subscriptionId);
    });

    // Verify subscription exists in DB
    subscriptions.verifySubscriptionInDB(subscriptionId);
  });

  it('Test 3: Create a subscription (Consumable) and verify in DB', () => {
    subscriptions.getConsumableOrderItemFromDB().then((result) => {
      if (!result || result.length === 0) {
        cy.log('No eligible consumable order item found. Test passed by default.');
        return;
      }

      const orderId = result[0].order_id;
      const id = result[0].order_item_id;
      const productId = result[0].sku;
      const subscriptionId = `${orderId}_${id}_${productId}`;
      const today = dayjs().format('DD-MM-YYYY');

      cy.log('DB Result — order_id:', orderId);
      cy.log('DB Result — order_item_id:', id);
      cy.log('DB Result — sku (product_id):', productId);
      cy.log('Constructed subscription_id:', subscriptionId);

      const payload = subscriptions.getConsumableSubscriptionPayload(orderId, id, productId, today);

      cy.log('Payload:', JSON.stringify(payload));
      cy.log('Creating consumable subscription:', subscriptionId);

      subscriptions.createSubscription(payload).then((response) => {
        expect(response.status === 200 || response.status === 201).to.be.true;
        cy.log('Subscription created successfully:', subscriptionId);
        cy.log('Response status:', response.status);

        // Wait for async DB persistence
        cy.wait(10000);

        // Verify subscription exists in DB
        subscriptions.verifySubscriptionCreatedInDB(subscriptionId);
      });
    });
  });

  it('Test 4: Create a subscription (Normal + Bundle) and verify in DB', () => {
    subscriptions.getNormalBundleOrderItemFromDB().then((result) => {
      if (!result || result.length === 0) {
        cy.log('No eligible normal bundle order item found. Test passed by default.');
        return;
      }

      const orderId = result[0].order_id;
      const id = result[0].order_item_id;
      const productId = result[0].sku;
      const bundleItemId = result[0].item_id;
      const subscriptionId = `${orderId}_${id}_${productId}`;
      const today = dayjs().format('DD-MM-YYYY');

      cy.log('DB Result — order_id:', orderId);
      cy.log('DB Result — order_item_id:', id);
      cy.log('DB Result — sku (product_id):', productId);
      cy.log('DB Result — item_id (bundle integer):', bundleItemId);
      cy.log('Constructed subscription_id:', subscriptionId);

      const payload = subscriptions.getNormalBundleSubscriptionPayload(orderId, id, productId, today, bundleItemId);

      cy.log('Payload:', JSON.stringify(payload));
      cy.log('Creating normal bundle subscription:', subscriptionId);

      subscriptions.createSubscription(payload).then((response) => {
        expect(response.status === 200 || response.status === 201).to.be.true;
        cy.log('Subscription created successfully:', subscriptionId);
        cy.log('Response status:', response.status);

        // Wait for async DB persistence
        cy.wait(10000);

        // Verify subscription exists in DB
        subscriptions.verifySubscriptionCreatedInDB(subscriptionId);
      });
    });
  });

  it('Test 5: Update real_end_date and verify in DB', () => {
    subscriptions.getActiveNormalSubscriptionFromDB().then((result) => {
      if (!result || result.length === 0) {
        cy.log('No active normal subscription found. Test passed by default.');
        return;
      }

      const subscriptionId = result[0].subscription_id;
      const randomMonths = Math.floor(Math.random() * 6) + 5;
      const futureDate = dayjs().add(randomMonths, 'month').format('YYYY-MM-DD');

      cy.log('Subscription ID:', subscriptionId);
      cy.log('Updating field: real_end_date');
      cy.log('New value:', futureDate);

      subscriptions.updateSubscription(subscriptionId, { real_end_date: futureDate }).then((response) => {
        expect(response.status).to.eq(200);
        cy.log('Updated real_end_date to', futureDate, 'for subscription:', subscriptionId);

        // Verify real_end_date in DB
        subscriptions.verifyRealEndDateInDB(subscriptionId);
      });
    });
  });

  it('Test 6: Add a note to a subscription', () => {
    const subscriptionId = Cypress.env('dbSubscriptionId');

    cy.log('Adding note to subscription:', subscriptionId);

    subscriptions.addSubscriptionNote(subscriptionId).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.success).to.be.true;
      expect(response.body.message).to.eq('Created');
      cy.log('Note added successfully for subscription:', subscriptionId);
    });
  });

  it('Test 7: Update serial_number and verify in DB', () => {
    const subscriptionId = Cypress.env('dbSubscriptionId');
    const randomSerial = `serial-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    cy.log('Subscription ID:', subscriptionId);
    cy.log('Updating field: serial_number');
    cy.log('New value:', randomSerial);

    subscriptions.updateSubscription(subscriptionId, { serial_number: randomSerial }).then((response) => {
      expect(response.status).to.eq(200);
      cy.log('Response status:', response.status);
      cy.log('Updated serial_number to:', randomSerial, 'for subscription:', subscriptionId);

      // Verify serial_number in DB
      subscriptions.verifySerialNumberInDB(subscriptionId, randomSerial);
    });
  });

  it('Test 8: End subscription in DB and reactivate via API, verify in DB', () => {
    const subscriptionId = Cypress.env('dbSubscriptionId');

    cy.log('Subscription ID:', subscriptionId);
    cy.log('Step 1: Setting status to "ended" in DB');

    // Set subscription status to 'ended' in DB
    subscriptions.setSubscriptionStatusInDB(subscriptionId, 'ended').then(() => {
      cy.log('DB update complete — status set to "ended" for subscription:', subscriptionId);
      cy.log('Step 2: Reactivating subscription via API');

      subscriptions.reactivateSubscription(subscriptionId).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.message).to.eq('Reactivated');
        cy.log('Response status:', response.status);
        cy.log('Reactivated subscription:', subscriptionId);
        cy.log('Step 3: Verifying status is back to "active" in DB');

        // Verify status is back to 'active' in DB
        subscriptions.verifySubscriptionStatusInDB(subscriptionId, 'active');
      });
    });
  });

  it('Test 9: Toggle auto_renew ON and verify in DB', () => {
    const subscriptionId = Cypress.env('dbSubscriptionId');

    cy.log('Subscription ID:', subscriptionId);
    cy.log('Updating field: auto_renew');
    cy.log('New value: true (ON)');

    subscriptions.toggleAutoRenew(subscriptionId, true).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.success).to.be.true;
      expect(response.body.message).to.eq('Updated');
      cy.log('Response status:', response.status);
      cy.log('Auto-renew toggled ON for subscription:', subscriptionId);

      // Verify auto_renew = true in DB
      subscriptions.verifyAutoRenewInDB(subscriptionId, true);
    });
  });

  it('Test 10: Toggle auto_renew OFF and verify in DB', () => {
    const subscriptionId = Cypress.env('dbSubscriptionId');

    subscriptions.toggleAutoRenew(subscriptionId, false).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.success).to.be.true;
      expect(response.body.message).to.eq('Updated');
      cy.log('Auto-renew toggled OFF for:', subscriptionId);

      // Verify auto_renew = false in DB
      subscriptions.verifyAutoRenewInDB(subscriptionId, false);
    });
  });

});
