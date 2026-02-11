import { customerApiConfig } from './config';
//Return a paginated list of orders: Test 1
Cypress.Commands.add('getCustomerOrders', () => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/orders`,
    auth: customerApiConfig.auth
  }).then((response) => {
    return cy.wait(5000).then(() => response);
  });
});

//Find order by ID: Test 2
Cypress.Commands.add('getOrderById', (orderId) => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/orders/${orderId}`,
    auth: customerApiConfig.auth
  }).then((response) => {
    return cy.wait(5000).then(() => response);
  });
});

//Creates a new order: Test 3
Cypress.Commands.add('createCustomerOrder', () => {
  const randomOrderId = Math.floor(100000000000 + Math.random() * 900000000000); // 12-digit random number

  const requestBody = {
    order_id: `${randomOrderId}`,
    discount: 0,
    shipping_amount: 5,
    tax_amount: 2.22,
    tax_percent: 19,
    amount: 13.91,
    total_item_count: 0,
    currency: "EUR",
    payment_provider: "stripe",
    payment_method_token: "visa",
    payment_method: "card",
    status: "open",
    payment_status: "payment_required",
    stripe_customer_id: "cus_S834yW7AJkxpzJ",
    history: {},
    transaction_id: "pi_3RDmxtK2HSLAqiWw1KPzpmzd",
    psp_object: {},
    tag: null,
    tag_date: null,
    replace_order_id: null,
    order_name: "2489",
    email: "test@circuly.io",
    phone: "+49123456789",
    billing: {
      first_name: "Shahiduz",
      last_name: "Zaman",
      street: "Hansaallee",
      postal_code: "00136",
      city: "Frankfurt",
      country: "Germany",
      company: "test",
      note: ""
    },
    shipping: {
      first_name: "Shahiduz",
      last_name: "Zaman",
      street: "Hansaallee",
      postal_code: "00136",
      city: "Frankfurt",
      country: "Germany",
      company: "test",
      note: ""
    },
    items: [
      {
        product_id: "5371732131978",
        name: "Simple product no variant",
        sku: "43014354567306",
        thumbnail: "https://cdn.shopify.com/s/files/1/0371/7631/1946/products/783px-Test-Logo_svg.png?v=1695297223",
        voucher_code: null,
        quantity: 1,
        price: 8.91,
        discount_amount: 0,
        row_total_incl_tax: 8.91,
        row_total: 7.49,
        row_total_incl_discount: 80.00,
        tax_amount: 1.42,
        tax_percent: 19,
        base_price_incl_tax: "8.91",
        base_price: 7.49,
        delivery_date: null,
        subscription_duration: 5,
        expected_revenue: 44.55,
        subscription: true,
        subscription_id: "sub_0000012345",
        subscription_start: "18-09-2024",
        subscription_end: "2025-04-26",
        subscription_frequency: "monthly",
        original_price: 0,
        subscription_duration_prepaid: 1,
        subscription_type: "normal",
        subscription_frequency_interval: 1
      }
    ]
  };

  return cy.request({
    method: 'POST',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/orders`,
    auth: customerApiConfig.auth,
    body: requestBody,
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    return cy.wait(10000).then(() => response);
  });
});

//Update Payment method: Test 4
Cypress.Commands.add('getPaymentUpdateLink', (orderId) => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/orders/${orderId}/payment-update-link`,
    auth: customerApiConfig.auth
  }).then((response) => {
    return cy.wait(5000).then(() => response);
  });
});

// Get payment details
Cypress.Commands.add('getPaymentDetails', (orderId) => {
  return cy.request({
    method: 'GET',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/orders/${orderId}/payment-details`,
    auth: customerApiConfig.auth
  }).then((response) => {
    return cy.wait(5000).then(() => response);
  });
});

// Add note
Cypress.Commands.add('postOrderNote', (orderId, note) => {
  return cy.request({
    method: 'POST',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/orders/${orderId}/notes`,
    auth: customerApiConfig.auth,
    body: note,
    headers: {
      'Content-Type': 'application/json'
    },
    failOnStatusCode: false // optional, in case you want to handle failures manually
  }).then((response) => {
    return cy.wait(10000).then(() => response);
  });
});

// Process fulfill
Cypress.Commands.add('fulfillOrders', (orderIds) => {
  return cy.request({
    method: 'POST',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/orders/fulfill`,
    auth: customerApiConfig.auth,
    body: {
      order_ids: orderIds
    },
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    return cy.wait(10000).then(() => response);
  });
});

// cancell order
Cypress.Commands.add('cancelOrder', (orderId) => {
  return cy.request({
    method: 'POST',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/orders/${orderId}/cancel`,
    auth: customerApiConfig.auth,
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    return cy.wait(10000).then(() => response);
  });
});

// Update order Tag
Cypress.Commands.add('tagOrder', (orderId, tagPayload) => {
  return cy.request({
    method: 'PUT',
    url: `${customerApiConfig.baseUrl}/api/${customerApiConfig.apiVersion}/orders/${orderId}/tag`,
    auth: customerApiConfig.auth,
    body: tagPayload,
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    return cy.wait(10000).then(() => response);
  });
});
