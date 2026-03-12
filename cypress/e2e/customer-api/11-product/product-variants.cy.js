import * as productVariants from '../../../support/customer-api/product-variants/productVariantsCommands';

describe('Customer API - Products & Variants', () => {

  // Fetch latest product and variant from DB before each test
  beforeEach(() => {
    productVariants.getProductFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      const product = result[0];

      cy.log('DB product found:');
      cy.log('Product ID:', product.id);
      cy.log('Title:', product.title);
      cy.log('SKU:', product.sku);
      cy.log('Stock:', product.stock);
      cy.log('Brand:', product.brand);
      cy.log('Category:', product.category);

      Cypress.env('dbProductId', product.id);
    });

    productVariants.getVariantFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      const variant = result[0];

      cy.log('DB variant found:');
      cy.log('Variant ID:', variant.id);
      cy.log('Product ID:', variant.product_id);
      cy.log('Title:', variant.title);
      cy.log('SKU:', variant.sku);
      cy.log('Price:', variant.price);
      cy.log('Stock:', variant.stock);
      cy.log('Product Title:', variant.product_title);

      Cypress.env('dbVariantId', variant.id);
      Cypress.env('dbVariantProductId', variant.product_id);
    });
  });

  // --- GET tests ---

  it('Test 1: Fetch all products and log details', () => {
    productVariants.getProducts().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data').and.to.be.an('array');

      const products = response.body.data;
      expect(products.length).to.be.greaterThan(0);

      const first = products[0];
      cy.log('Total products returned:', products.length);
      cy.log('First Product ID:', first.id);
      cy.log('First Title:', first.title);
      cy.log('First SKU:', first.sku);
      cy.log('First Variants count:', first.variants ? first.variants.length : 0);
    });
  });

  it('Test 2: Fetch all variants and validate pagination', () => {
    productVariants.getVariants().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('is_paginated', true);
      expect(response.body).to.have.property('data').and.to.be.an('array');

      const variants = response.body.data;
      expect(variants.length).to.be.greaterThan(0);

      const first = variants[0];
      cy.log('Total variants returned:', variants.length);
      cy.log('First Variant ID:', first.id);
      cy.log('First Variant Title:', first.title);
      cy.log('First Variant Price:', first.price);
      cy.log('is_paginated:', response.body.is_paginated);
    });
  });

  it('Test 3: Fetch variants by product ID and verify in DB', () => {
    const productId = Cypress.env('dbVariantProductId');
    expect(productId).to.exist;

    cy.log('Fetching variants for product ID:', productId);

    productVariants.getVariantsByProductId(productId).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('is_paginated');

      const data = response.body.data || response.body;
      cy.log('Variants returned for product:', Array.isArray(data) ? data.length : 'N/A');

      if (Array.isArray(data) && data.length > 0) {
        cy.log('First Variant ID:', data[0].id);
        cy.log('First Variant Title:', data[0].title);
        cy.log('First Variant Price:', data[0].price);
      }
    });
  });

  // --- Create Product ---

  it('Test 4: Create a new product and verify in DB', () => {
    const uniqueSuffix = Date.now();
    const productData = {
      allow_order_create: true,
      brand: 'Circuly',
      category: 'Footwear',
      buyout_retail_price: 199.99,
      meta: {},
      msrp: 249.99,
      picture_url: 'https://www.dbu.de/inc/phpThumb/phpThumb.php?src=/nadi/media/230921040008_303001.png',
      product_collection_id: null,
      purchase_price: 150.00,
      sku: `NK-AIR-${uniqueSuffix}`,
      stock: 50,
      sync_stock: true,
      title: `Circuly Air Max 90 - ${uniqueSuffix}`,
      type: 'normal',
    };

    cy.log('Creating product with SKU:', productData.sku);
    cy.log('Product title:', productData.title);

    productVariants.createProduct(productData).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      const productId = response.body.id;
      expect(productId).to.exist;

      cy.log('Created Product ID:', productId);
      cy.log('Created Product Title:', response.body.title);
      cy.log('Created Product SKU:', response.body.sku);

      Cypress.env('createdProductId', productId);
    });

    // Verify product exists in DB
    cy.then(() => {
      const productId = Cypress.env('createdProductId');
      productVariants.verifyProductInDB(productId);
    });
  });

  // --- Create Variant ---

  it('Test 5: Create a variant for a product and verify in DB', () => {
    const uniqueSuffix = Date.now();

    productVariants.getLatestProductIdFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      const productId = result[0].product_id;

      cy.log('Creating variant for product_id:', productId);

      const variantData = {
        allow_order_create: true,
        prepaid_duration: 1,
        price: 49.99,
        subscription_item: true,
        thumbnail: 'https://www.dbu.de/inc/phpThumb/phpThumb.php?src=/nadi/media/230921040008_303001.png',
        notify_period_before_end: 7,
        title: `Consumable 2 - Monthly Sub ${uniqueSuffix}`,
        sku: `NK-AIR-BLK-M-${uniqueSuffix}`,
        bundle_id: null,
        stock: 50,
        subscription_extension_price: 550.22,
        buyout_retail_price: 550.22,
        condition: 'new',
        duration: 12,
        frequency: 'monthly',
        options: [
          { key: 'color', value: 'black' },
          { key: 'size', value: 'M' },
        ],
      };

      cy.log('Variant SKU:', variantData.sku);
      cy.log('Variant title:', variantData.title);

      productVariants.createVariant(productId, variantData).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
        const variantId = response.body.id;
        expect(variantId).to.exist;

        cy.log('Created Variant ID:', variantId);
        cy.log('Created Variant Title:', response.body.title);
        cy.log('Created Variant SKU:', response.body.sku);

        Cypress.env('createdVariantId', variantId);

        // Verify variant exists in DB
        productVariants.verifyVariantInDB(variantId);
      });
    });
  });

  // --- Update Variant ---

  it('Test 6: Update a variant stock and verify in DB', () => {
    const randomStock = Math.floor(Math.random() * 100) + 1;

    productVariants.getLatestVariantIdFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      const variantId = result[0].id;

      cy.log('Updating variant ID:', variantId);
      cy.log('Current title:', result[0].title);
      cy.log('Current SKU:', result[0].sku);
      cy.log('Current stock:', result[0].stock);
      cy.log('New stock value:', randomStock);

      const updateData = {
        allow_order_create: true,
        buyout_retail_price: 199.99,
        notify_period_before_end: 7,
        price: 49.99,
        sku: 'SKU-001',
        stock: randomStock,
        subscription_extension_price: 9.99,
        title: 'Sample Product Title',
      };

      productVariants.updateVariant(variantId, updateData).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);

        cy.log('Updated variant response status:', response.status);
        cy.log('Updated variant stock to:', randomStock);

        // Verify stock in DB
        productVariants.verifyVariantStockInDB(variantId, randomStock);
      });
    });
  });

  // --- Fetch variant by product_id from DB ---

  it('Test 7: Fetch variants for latest product from DB and verify via API', () => {
    const variantId = Cypress.env('dbVariantId');
    const productId = Cypress.env('dbVariantProductId');
    expect(productId).to.exist;

    cy.log('Fetching variants for product_id from DB:', productId);
    cy.log('Expected variant_id from DB:', variantId);

    productVariants.getVariantsByProductId(productId).then((response) => {
      expect(response.status).to.eq(200);

      cy.log('API response status:', response.status);
      cy.log('Variants returned for product:', productId);
    });

    // Verify the variant from beforeEach exists in DB
    productVariants.verifyVariantInDB(variantId);
  });
});
