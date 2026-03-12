// DB queries for Subscriptions module

// beforeEach: get latest active subscription for the company
export function getSubscriptionByCompanyQuery(companyId) {
  return `
    SELECT subscription_id, order_id, product_id, status, auto_renew,
           serial_number, real_end_date, subscription_type
    FROM public.subscriptions
    WHERE company_id = '${companyId}'
      AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1
  `;
}

// Test 2: verify subscription exists in DB
export function verifySubscriptionQuery(subscriptionId) {
  return `
    SELECT subscription_id, status, order_id, product_id
    FROM public.subscriptions
    WHERE subscription_id = '${subscriptionId}'
  `;
}

// Test 3: get eligible consumable order item for creating subscription
export function getConsumableOrderItemQuery(companyId) {
  return `
    SELECT
      oi.order_id,
      oi.order_item_id,
      oi.sku,
      oi.subscription_id,
      oi.company_id
    FROM order_items oi
    JOIN orders o
      ON o.order_id = oi.order_id
      AND o.company_id = oi.company_id
    WHERE oi.subscription = true
      AND oi.subscription_frequency IN ('monthly')
      AND oi.subscription_duration_prepaid IN (1)
      AND oi.is_bundle = false
      AND oi.subscription_type IN ('consumable')
      AND o.payment_status IN ('paid')
      AND o.parent_id IS NULL
      AND o.origin IN ('checkout')
      AND o.payment_method_token IN ('visa')
      AND o.status IN ('open')
      AND o.transaction_id IS NOT NULL
      AND o.company_id = '${companyId}'
      AND NOT EXISTS (
        SELECT 1
        FROM subscriptions s
        WHERE s.subscription_id = oi.order_id || '_' || oi.order_item_id || '_' || oi.sku
          AND s.company_id = oi.company_id
      )
    LIMIT 1
  `;
}

// Test 4: get eligible normal bundle order item for creating subscription
export function getNormalBundleOrderItemQuery(companyId) {
  return `
    SELECT
      oi.id as item_id,
      oi.order_id,
      oi.order_item_id,
      oi.sku,
      oi.subscription_id,
      oi.company_id
    FROM order_items oi
    JOIN orders o
      ON o.order_id = oi.order_id
      AND o.company_id = oi.company_id
    WHERE oi.subscription = true
      AND oi.subscription_frequency IN ('monthly')
      AND oi.subscription_duration_prepaid IN (1)
      AND oi.is_bundle = false
      AND oi.subscription_type IN ('normal')
      AND o.payment_status IN ('paid')
      AND o.parent_id IS NULL
      AND o.origin IN ('checkout')
      AND o.payment_method_token IN ('visa')
      AND o.status IN ('open')
      AND o.transaction_id IS NOT NULL
      AND o.company_id = '${companyId}'
      AND NOT EXISTS (
        SELECT 1
        FROM subscriptions s
        WHERE s.subscription_id = oi.order_id || '_' || oi.order_item_id || '_' || oi.sku
          AND s.company_id = oi.company_id
      )
    LIMIT 1
  `;
}

// Tests 3 & 4: verify subscription was created in DB
export function verifySubscriptionCreatedQuery(subscriptionId) {
  return `
    SELECT subscription_id, status, order_id, product_id, serial_number
    FROM public.subscriptions
    WHERE subscription_id = '${subscriptionId}'
  `;
}

// Tests 3 & 4: delete subscription from DB (cleanup)
export function deleteSubscriptionQuery(subscriptionId, companyId) {
  return `
    DELETE FROM public.subscriptions
    WHERE subscription_id = '${subscriptionId}'
      AND company_id = '${companyId}'
  `;
}

// Test 5: get active normal subscription with no real_end_date
export function getActiveNormalSubscriptionQuery(companyId) {
  return `
    SELECT subscription_id
    FROM public.subscriptions
    WHERE company_id = '${companyId}'
      AND real_end_date IS NULL
      AND subscription_type = 'normal'
      AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1
  `;
}

// Test 5: verify real_end_date was updated
export function verifyRealEndDateQuery(subscriptionId) {
  return `
    SELECT subscription_id, real_end_date
    FROM public.subscriptions
    WHERE subscription_id = '${subscriptionId}'
  `;
}

// Test 7: verify serial_number was updated
export function verifySerialNumberQuery(subscriptionId) {
  return `
    SELECT subscription_id, serial_number
    FROM public.subscriptions
    WHERE subscription_id = '${subscriptionId}'
  `;
}

// Test 8: set subscription status (for reactivation test setup)
export function setSubscriptionStatusQuery(subscriptionId, status) {
  return `
    UPDATE public.subscriptions
    SET status = '${status}'
    WHERE subscription_id = '${subscriptionId}'
  `;
}

// Test 8: verify subscription status
export function verifySubscriptionStatusQuery(subscriptionId) {
  return `
    SELECT subscription_id, status
    FROM public.subscriptions
    WHERE subscription_id = '${subscriptionId}'
  `;
}

// Tests 9 & 10: verify auto_renew value
export function verifyAutoRenewQuery(subscriptionId) {
  return `
    SELECT subscription_id, auto_renew
    FROM public.subscriptions
    WHERE subscription_id = '${subscriptionId}'
  `;
}
