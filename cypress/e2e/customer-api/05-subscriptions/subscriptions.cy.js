import "../../../support/customer_api/subscriptionsCommands"
import dayjs from 'dayjs'; // Make sure this is installed in your project

describe('Customer Subscriptions API', () => {
    before(() => {
        Cypress.env('subscriptionId', '5927291617418_67efe30b47597_43014354567306');
      });
      

  it('Test 1: Fetch all subscriptions and store first subscription ID', () => {
    cy.getCustomerSubscriptions().then((response) => {
      expect(response.status).to.eq(200);
      const firstSubscriptionId = response.body.data[0].id;
      Cypress.env('subscriptionId', firstSubscriptionId);
      cy.log('Stored Subscription ID:', firstSubscriptionId);
    });
  });

  it('Test 2: TestFetch single subscription using stored subscription ID', () => {
    const subscriptionId = Cypress.env('subscriptionId');

    cy.getSubscriptionById(subscriptionId).then((response) => {
      expect(response.status).to.eq(200);
      cy.log('Fetched Subscription:', response.body);
    });
  });

  it('Test 3: Create a subscription (Consumable + Bundle) and delete it from DB', () => {
    const orderId = '5954734686346';
    const id = '67fe1bf433c2e';
    const productId = '44341709570186';
    const subscriptionId = `${orderId}_${id}_${productId}`;
    const today = new Date();
    const subscriptionStart = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    const subscriptionData = {
      order_id: orderId,
      id: id,
      product_id: productId,
      serial_number: '333333ddd333311',subscription_start: subscriptionStart,
      status: 'active',
      //subscription_start: '28-04-2025'
      subscription_start: subscriptionStart,
    };

    cy.createSubscription(subscriptionData).then((response) => {
      expect(response.status === 200 || response.status === 201).to.be.true;
      cy.log('Subscription created:', subscriptionId);
      cy.wait(10000);

      // Clean up from DB
      cy.deleteSubscriptionFromDb(subscriptionId);
    });
  });

it('Test 4: Create a subscription (Normal + Bundle) and delete it from DB', () => {
  const orderId = '5954734686346';
  const id = '67fe1bf433a4e';
  const productId = '44660477493386';
  const subscriptionId = `${orderId}_${id}_${productId}`;

  const subscriptionData = {
    order_id: orderId,
    id: id,
    product_id: productId,
    serial_number: null,
    status: 'active',
    bundle_id: null,
    subscription_start: '25-01-2025',
    bundle_data: [
      {
        id: 14063,
        serial_number: 'fac1c6e3-11b1-4036-8b17-e3ac852da58c1111222',
        frame_number: 'f22222'
      },
      {
        id: 14064,
        serial_number: 'fac1c6e3-11b1-4036-8b17-e3ac852da599911',
        frame_number: 'f22222211'
      }
    ]
  };

  cy.createSubscription(subscriptionData).then((response) => {
    expect(response.status === 200 || response.status === 201).to.be.true;
    cy.log(`Subscription created: ${subscriptionId}`);

    // wait for async DB persistence
    cy.wait(10000);

    // Clean up from DB
    cy.deleteSubscriptionFromDb(subscriptionId);
  });
});


it('Test 5: Update real_end_date for a specific subscription', () => {
  const randomMonths = Math.floor(Math.random() * 6) + 5; // Random between 5 and 10
  const futureDate = dayjs().add(randomMonths, 'month').format('YYYY-MM-DD');

  cy.getLatestActiveNormalSubscriptionId().then((subscriptionId) => {
    cy.log(`Using subscription_id: ${subscriptionId}`);

    cy.updateSubscription(subscriptionId, {
      real_end_date: futureDate
    }).then((response) => {
      expect(response.status).to.eq(200);
      cy.log(`Updated real_end_date to: ${futureDate}`);
    });
  });
});


  // Add Note

it('Test 6: Add a note to a subscription', () => {
    const subscriptionId = Cypress.env('subscriptionId');

  const notePayload = {
    author: 'amine',
    message: 'test',
    description: 'test',
    serial_number: 'na',
    pinned: false,
    include_order_id: false
  };

  cy.addSubscriptionNote(subscriptionId, notePayload).then((response) => {
    expect(response.status).to.eq(201);
    expect(response.body.success).to.be.true;
    expect(response.body.message).to.eq('Created');
    cy.log('Subscription note added:', response.body);
  });
});

// Update serial number

it('test 7: Update serial_number with a random value for a specific subscription', () => {
    const subscriptionId = Cypress.env('subscriptionId');

    // Generate random serial number
    const randomSerial = `serial-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    cy.updateSubscription(subscriptionId, {
      serial_number: randomSerial
    }).then((response) => {
      expect(response.status).to.eq(200);
      cy.log('Updated serial_number to:', randomSerial);
    });
  });


  it('Test 8: Ends the subscription in DB and reactivates it via API', () => {
    const subscriptionId = Cypress.env('subscriptionId');
    const updateQuery = `
      UPDATE public.subscriptions
      SET status = 'ended'
      WHERE subscription_id = '${subscriptionId}'
    `;

    cy.task('queryDb', updateQuery).then(() => {
      cy.log('Set subscription to ended in DB');

      cy.reactivateSubscription(subscriptionId).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.message).to.eq("Reactivated");
        cy.log('Reactivated subscription ID:', subscriptionId);
      });
    });
  });




});