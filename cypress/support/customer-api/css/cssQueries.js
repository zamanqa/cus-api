// DB queries for CSS (Customer Self Service) module

// Get active consumable subscription (Tests 1–5: deliveries, report-issue, shipping-date, frequency, bundle-swap)
export function getActiveConsumableSubscriptionQuery(companyId) {
  return `
    SELECT subscription_id, order_id, product_id, status, subscription_type,
           subscription_frequency, serial_number
    FROM public.subscriptions
    WHERE company_id = '${companyId}'
      AND status = 'active'
      AND subscription_type = 'consumable'
    ORDER BY created_at DESC
    LIMIT 1
  `;
}

// Get active normal subscription (Test 6: cancel)
export function getActiveNormalSubscriptionQuery(companyId) {
  return `
    SELECT subscription_id, order_id, product_id, status, subscription_type
    FROM public.subscriptions
    WHERE company_id = '${companyId}'
      AND status = 'active'
      AND subscription_type = 'normal'
    ORDER BY created_at ASC
    LIMIT 1
  `;
}

// Get delivery ID from recurring_payments for a consumable subscription (Test 3: update shipping date)
export function getDeliveryIdQuery(companyId) {
  return `
    SELECT DISTINCT ON (r.subscription_id) r.id, r.subscription_id, r.billing_date
    FROM public.recurring_payments r
    JOIN public.subscriptions s ON r.subscription_id = s.id
    WHERE s.company_id = '${companyId}'
      AND s.status = 'active'
      AND s.subscription_type = 'consumable'
      AND r.company_id = '${companyId}'
      AND r.enabled = true
      AND r.deleted_at IS NULL
      AND r.payment_settled = false
      AND r.invoice_id IS NULL
    ORDER BY r.subscription_id, r.id ASC
    LIMIT 1
  `;
}

// Get product variant ID for bundle swap (Test 5)
export function getProductVariantIdQuery(companyId) {
  return `
    SELECT pv.id AS variant_id, pv.title, pv.sku, pv.product_id
    FROM public.product_variants pv
    JOIN public.products p ON p.id = pv.product_id AND p.company_id = pv.company_id
    WHERE pv.company_id = '${companyId}'
      AND pv.stock > 0
    ORDER BY pv.created_at DESC
    LIMIT 1
  `;
}

// Get active normal subscription with stripe payment provider (Test 7: buyout)
export function getStripeBuyoutSubscriptionQuery(companyId) {
  return `
    SELECT s.subscription_id, s.order_id, s.status, s.subscription_type,
           o.payment_provider
    FROM public.subscriptions s
    LEFT JOIN public.orders o ON s.order_id = o.order_id
    WHERE s.company_id = '${companyId}'
      AND s.status = 'active'
      AND s.subscription_type = 'normal'
      AND s.payment_method_token NOT IN ('offlinegateway', 'invoice')
      AND s.payment_method_token NOT ILIKE '%paypal%'
      AND o.payment_provider = 'stripe'
      AND o.status IN ('open', 'TEST', 'fulfilled')
      AND o.payment_status = 'paid'
    ORDER BY s.created_at DESC
    LIMIT 1
  `;
}

// Get variant and parent order for creating order by customer (Test 8)
export function getOrderVariantQuery(companyId) {
  return `
    SELECT oi.order_id AS parent_order_id, pv.shop_variant_id AS variant_id,
           oi.sku, pv.title AS variant_title
    FROM public.order_items oi
    JOIN public.orders o ON o.order_id = oi.order_id AND o.company_id = oi.company_id
    JOIN public.product_variants pv ON pv.sku = oi.sku AND pv.company_id = oi.company_id
    WHERE oi.company_id = '${companyId}'
      AND oi.subscription = true
      AND oi.subscription_type = 'consumable'
      AND o.payment_status = 'paid'
      AND o.status IN ('open', 'fulfilled')
      AND pv.stock > 0
    ORDER BY o.created_at DESC
    LIMIT 1
  `;
}
