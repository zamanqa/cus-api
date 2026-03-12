// DB queries for Deliveries module
// Note: API returns "shipping_date" but DB column is "billing_date" in recurring_payments table

// Get future billing dates from recurring_payments (ensures delivery data exists, avoids 404)
export function getShippingDateFromDBQuery(companyId) {
  return `
    SELECT DISTINCT TO_CHAR(rp.billing_date, 'YYYY-MM-DD') as shipping_date
    FROM public.recurring_payments rp
    WHERE rp.company_id = '${companyId}'
      AND rp.enabled = true
      AND rp.deleted_at IS NULL
      AND rp.billing_date IS NOT NULL
      AND rp.billing_date >= CURRENT_DATE
    ORDER BY shipping_date ASC
    LIMIT 5
  `;
}

// Verify delivery record exists for a billing_date (shipping_date in API)
export function verifyDeliveryByDateQuery(companyId, shippingDate) {
  return `
    SELECT rp.id, rp.subscription_id, TO_CHAR(rp.billing_date, 'YYYY-MM-DD') as shipping_date, rp.billing_date
    FROM public.recurring_payments rp
    WHERE rp.company_id = '${companyId}'
      AND TO_CHAR(rp.billing_date, 'YYYY-MM-DD') = '${shippingDate}'
      AND rp.enabled = true
      AND rp.deleted_at IS NULL
    LIMIT 1
  `;
}
