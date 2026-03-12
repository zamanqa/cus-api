// DB queries for Product Tracking module
// Note: product_trackings table stores per-item tracking with location_status, serial_number, etc.
// Repair/Stock endpoints require a serial_number from an active subscription.

// Get latest product tracking record from DB (beforeEach)
export function getProductTrackingByCompanyQuery(companyId) {
  return `
    SELECT pt.id, pt.serial_number, pt.product_name, pt.sku, pt.location_status,
           pt.location, pt.subscription_id, pt.customer_id, pt.customer_name,
           pt.cost, pt.purchase_price, pt.blocked, pt.created_at
    FROM public.product_trackings pt
    WHERE pt.company_id = '${companyId}'
      AND pt.location_status = 'rented out'
    ORDER BY pt.created_at DESC
    LIMIT 1
  `;
}

// Get 1 serial from product_trackings that is "rented out" AND has an active subscription
// JOINs on subscription_id (not serial_number) — matches how the API resolves subscriptions
// Test 3 repairs this serial, then Test 4 returns the same serial to stock (sequential flow)
export function getActiveSubscriptionSerialsQuery(companyId) {
  return `
    SELECT pt.serial_number, pt.location_status, pt.product_name, pt.subscription_id,
           s.status AS subscription_status
    FROM public.product_trackings pt
    JOIN public.subscriptions s
      ON s.subscription_id = pt.subscription_id
      AND s.company_id = pt.company_id
      AND s.status = 'active'
    WHERE pt.company_id = '${companyId}'
      AND pt.location_status = 'rented out'
      AND pt.serial_number IS NOT NULL
      AND pt.serial_number != ''
      AND pt.subscription_id IS NOT NULL
    ORDER BY pt.created_at DESC
    LIMIT 1
  `;
}

// Get 1 serial from product_trackings that is "to repair"
// No subscription JOIN needed — repair already ended the subscription, stock just needs the asset
// Test 4 (stock) returns this asset back to stock
export function getRepairSerialForStockQuery(companyId) {
  return `
    SELECT pt.serial_number, pt.location_status, pt.product_name, pt.subscription_id
    FROM public.product_trackings pt
    WHERE pt.company_id = '${companyId}'
      AND pt.location_status IN ('to repair')
      AND pt.serial_number IS NOT NULL
      AND pt.serial_number != ''
    ORDER BY pt.updated_at DESC
    LIMIT 1
  `;
}

// Verify a specific product tracking record exists in DB by serial_number
export function verifyProductTrackingBySerialQuery(companyId, serialNumber) {
  return `
    SELECT pt.id, pt.serial_number, pt.product_name, pt.sku, pt.location_status,
           pt.location, pt.subscription_id, pt.customer_id, pt.customer_name,
           pt.blocked, pt.created_at
    FROM public.product_trackings pt
    WHERE pt.company_id = '${companyId}'
      AND pt.serial_number = '${serialNumber}'
  `;
}

// Verify location_status changed after repair/stock request
// Orders by updated_at DESC LIMIT 1 — serial may have multiple records, we want the latest
export function verifyLocationStatusQuery(companyId, serialNumber) {
  return `
    SELECT pt.serial_number, pt.location_status, pt.location, pt.updated_at
    FROM public.product_trackings pt
    WHERE pt.company_id = '${companyId}'
      AND pt.serial_number = '${serialNumber}'
    ORDER BY pt.updated_at DESC
    LIMIT 1
  `;
}
