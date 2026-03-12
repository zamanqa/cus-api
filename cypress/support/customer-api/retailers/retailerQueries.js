// DB queries for Retailers module

// Get latest retailer from DB (beforeEach)
export function getRetailerByCompanyQuery(companyId) {
  return `
    SELECT id, location_id, name, enabled, created_at
    FROM public.retailers
    WHERE company_id = '${companyId}'
    ORDER BY created_at DESC
    LIMIT 1
  `;
}

// Verify retailer exists in DB by ID (Test 3, Test 4)
export function verifyRetailerByIdQuery(companyId, retailerId) {
  return `
    SELECT id, location_id, name, enabled, created_at
    FROM public.retailers
    WHERE company_id = '${companyId}'
      AND retailer_id = '${retailerId}'
  `;
}

// Verify retailer exists in DB by location_id (Test 2)
export function verifyRetailerByLocationIdQuery(companyId, locationId) {
  return `
    SELECT id, location_id, name, enabled, created_at
    FROM public.retailers
    WHERE company_id = '${companyId}'
      AND location_id = '${locationId}'
  `;
}
