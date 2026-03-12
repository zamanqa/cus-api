// DB queries for Product Variants module
// products.id is bigint, product_variants.id is bigint

// Get latest active product from DB (beforeEach)
export function getProductByCompanyQuery(companyId) {
  return `
    SELECT p.id, p.title, p.sku, p.stock, p.msrp, p.purchase_price,
           p.buyout_retail_price, p.brand, p.category, p.type,
           p.allow_order_create, p.active, p.created_at
    FROM public.products p
    WHERE p.company_id = '${companyId}'
      AND p.active = true
    ORDER BY p.created_at DESC
    LIMIT 1
  `;
}

// Get latest active variant with product info from DB (beforeEach)
export function getVariantByCompanyQuery(companyId) {
  return `
    SELECT pv.id, pv.product_id, pv.sku, pv.title, pv.price, pv.stock,
           pv.condition, pv.frequency, pv.duration, pv.active,
           pv.subscription_item, pv.buyout_retail_price,
           pv.allow_order_create, pv.created_at,
           pr.title AS product_title
    FROM public.product_variants pv
    JOIN public.products pr ON pr.id = pv.product_id
    WHERE pv.company_id = '${companyId}'
      AND pv.active = true
    ORDER BY pv.created_at DESC
    LIMIT 1
  `;
}

// Verify a specific product exists in DB by id
export function verifyProductByIdQuery(companyId, productId) {
  return `
    SELECT p.id, p.title, p.sku, p.stock, p.brand, p.category,
           p.type, p.active, p.created_at
    FROM public.products p
    WHERE p.company_id = '${companyId}'
      AND p.id = ${productId}
  `;
}

// Verify a specific variant exists in DB by id
export function verifyVariantByIdQuery(companyId, variantId) {
  return `
    SELECT pv.id, pv.product_id, pv.sku, pv.title, pv.price, pv.stock,
           pv.condition, pv.frequency, pv.duration, pv.active,
           pv.subscription_item, pv.created_at
    FROM public.product_variants pv
    WHERE pv.company_id = '${companyId}'
      AND pv.id = ${variantId}
  `;
}

// Verify variant stock value in DB
export function verifyVariantStockQuery(companyId, variantId) {
  return `
    SELECT pv.id, pv.stock, pv.title
    FROM public.product_variants pv
    WHERE pv.company_id = '${companyId}'
      AND pv.id = ${variantId}
  `;
}

// Get latest product_id from product_variants (for creating a variant)
export function getLatestProductIdQuery(companyId) {
  return `
    SELECT pv.product_id
    FROM public.product_variants pv
    WHERE pv.company_id = '${companyId}'
    ORDER BY pv.created_at DESC
    LIMIT 1
  `;
}

// Get latest variant id from DB (for update tests)
export function getLatestVariantIdQuery(companyId) {
  return `
    SELECT pv.id, pv.title, pv.sku, pv.stock
    FROM public.product_variants pv
    WHERE pv.company_id = '${companyId}'
    ORDER BY pv.created_at DESC
    LIMIT 1
  `;
}
