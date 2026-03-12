// DB queries for Notes module
// Table: public.notes
// Columns: id, author, customer_id, order_id, subscription_id, transaction_id,
//          message, pinned, company_id, created_at, updated_at,
//          title, subtitle, description, serial_number

// Get a note from DB for beforeEach (provides note ID + related IDs for filtering tests)
export function getNoteByCompanyQuery(companyId) {
  return `
    SELECT id, author, customer_id, order_id, subscription_id, transaction_id,
           message, pinned, title, subtitle, description, serial_number,
           created_at, updated_at
    FROM public.notes
    WHERE company_id = '${companyId}'
      AND order_id IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1
  `;
}

// Get a note with subscription_id for Test 6 (filter by subscription)
export function getNoteBySubscriptionQuery(companyId) {
  return `
    SELECT id, author, customer_id, subscription_id, message, title, created_at
    FROM public.notes
    WHERE company_id = '${companyId}'
      AND subscription_id IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1
  `;
}

// Get a note with transaction_id for Test 4 (filter by transaction)
export function getNoteByTransactionQuery(companyId) {
  return `
    SELECT id, author, transaction_id, message, title, created_at
    FROM public.notes
    WHERE company_id = '${companyId}'
      AND transaction_id IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1
  `;
}
