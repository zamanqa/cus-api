import "../../../support/customer_api/cssCommands";

describe('Customer Self Service-CSS', () => {
  it('Test 1: Should fetch subscription deliveries and include billing_date in response', () => {
    const query = `
      SELECT subscription_id FROM subscriptions s
      WHERE company_id IN ('734f-4c766638po')
        AND (status IN ('active'))
        AND (subscription_type IN ('consumable'))
      ORDER BY created_at desc
      LIMIT 1;
    `;

    cy.task('queryDb', query).then((result) => {
      const subscriptionId = result[0].subscription_id;

      cy.getSubscriptionDeliveries(subscriptionId).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body[0]).to.have.property('billing_date');
      });
    });
  });


  it('Test 2: Should report an issue for a subscription and confirm success message', () => {
    const query = `
      SELECT subscription_id FROM subscriptions s
      WHERE company_id IN ('734f-4c766638po')
        AND (status IN ('active'))
        AND (subscription_type IN ('consumable'))
      ORDER BY created_at desc
      LIMIT 1;
    `;

    cy.task('queryDb', query).then((result) => {
      const subscriptionId = result[0].subscription_id;

      const issuePayload = {
        customer_email: "c.test2489@gmail.com",
        message: "reported an issue",
        appointment: {
          date: "2025-03-01",
          timeslot: {
            from: "10:00",
            to: "11:00"
          }
        }
      };

      cy.reportSubscriptionIssue(subscriptionId, issuePayload).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property(
          'message',
          'Issue reported, mail sent and note saved.'
        );
      });
    });
  });


  it('Test 3: Should update shipping date using deliveryId fetched from DB', () => {
    const query = `
      SELECT DISTINCT ON (r.subscription_id) r.id
FROM recurring_payments r
JOIN subscriptions s ON r.subscription_id = s.id
WHERE s.company_id = '734f-4c766638po'
  AND s.status = 'active'
  AND s.subscription_type = 'consumable'
  AND r.company_id = '734f-4c766638po'
  AND r.enabled = true
  AND r.deleted_at IS null
  AND r.payment_settled = false
  AND r.invoice_id IS null
ORDER BY r.subscription_id, r.id ASC
LIMIT 1;
    `;

    cy.task('queryDb', query).then((result) => {
      const deliveryId = result[0].id;
      const shippingDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      cy.log(`Fetched Delivery ID: ${deliveryId}`);
      expect(deliveryId).to.exist;

      cy.updateShippingDate(deliveryId, shippingDate).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('message', 'Updated');
      });
    });
  });


  it('Test 4: Should change subscription frequency using custom command', () => {
    const query = `
      SELECT subscription_id FROM subscriptions s
      WHERE company_id IN ('734f-4c766638po')
        AND (status IN ('active'))
        AND (subscription_type IN ('consumable'))
      ORDER BY created_at desc
      LIMIT 1;
    `;

    cy.task('queryDb', query).then((result) => {
      const subscriptionId = result[0].subscription_id;

      cy.changeSubscriptionFrequency(subscriptionId).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property(
          'message',
          'Subscription frequency / interval changed.'
        );
      });
    });
  });


  it('Test 5: Should perform bundle swap successfully', () => {
    const query = `
      SELECT subscription_id FROM subscriptions s
      WHERE company_id IN ('734f-4c766638po')
        AND (status IN ('active'))
        AND (subscription_type IN ('consumable'))
      ORDER BY created_at desc
      LIMIT 1;
    `;

    cy.task('queryDb', query).then((result) => {
      const subscriptionId = result[0].subscription_id;
      const productVariantId = '7823';

      cy.bundleSwap(subscriptionId, productVariantId).then((response) => {
        expect(response.status).to.eq(202);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('message', 'Bundle swapped');
      });
    });
  });


  it('Test 6: Should cancel a subscription with valid details', () => {
    const query = `
      SELECT subscription_id FROM subscriptions s
      WHERE company_id IN ('734f-4c766638po')
        AND id != 16039
        AND (status IN ('active'))
        AND (subscription_type IN ('normal'))
      ORDER BY created_at ASC
      LIMIT 1;
    `;

    cy.task('queryDb', query).then((result) => {
      const subscriptionId = result[0].subscription_id;

      const cancelPayload = {
        customer_email: "c.test2489@gmail.com",
        cancellation_reason: "Normal Cancellations",
        cancellation_type: "normal_cancellation",
        early_cancellation: false,
        message: "Test",
        pickup: {
          delivery_date: "2023-07-26",
          timeslot: {
            from: "08:00",
            to: "12:00"
          }
        }
      };

      cy.cancelSubscription(subscriptionId, cancelPayload);
    });
  });


  it.only('Test 8: Should create order by customer shopify', () => {
    const orderPayload = {
      send_to_shop: true,
      variant_id: "44668861579402",
      parent_order_id: "6577175068810",
      quantity: 2,
      subscription_type: "consumable",
      subscription_frequency: "monthly",
      subscription_frequency_interval: 1,
      subscription_start: "2027-03-02"
    };

    cy.createOrderByCustomerShopify(orderPayload).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.success).to.eq(true);
    });
  });


  it('Test 7: Should process buyout for a subscription with stripe payment provider', () => {
    const query = `
      SELECT s.subscription_id
      FROM subscriptions s
      LEFT JOIN orders o ON s.order_id = o.order_id
      WHERE s.company_id IN ('734f-4c766638po')
        AND s.id != 16039
        AND s.status IN ('active')
        AND s.subscription_type IN ('normal')
        AND s.payment_method_token NOT IN ('offlinegateway', 'invoice')
        AND o.payment_provider IN ('stripe')
        AND o.status IN ('open', 'TEST', 'fulfilled')
        AND o.payment_status IN ('paid')
      ORDER BY s.created_at DESC
      LIMIT 1;
    `;

    cy.task('queryDb', query).then((result) => {
      if (result && result.length > 0) {
        const subscriptionId = result[0].subscription_id;

        const buyoutPayload = {
          buyout_legal: [
            { tag: "TermsAndConditions", value: true },
            { tag: "newsletter", value: true }
          ]
        };

        cy.processBuyout(subscriptionId, buyoutPayload).then((response) => {
          expect(response.status).to.eq(200);
        });
      } else {
        throw new Error('No active subscription found with the specified criteria');
      }
    });
  });
});
