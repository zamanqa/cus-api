import "../../../support/customer_api/productCommands";

describe('Customer API - Products', () => {
  it('Should fetch products and save first variant ID for later use', () => {
    cy.getCustomerProducts().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data').and.to.be.an('array');

      const products = response.body.data;

      if (products.length > 0 && products[0].variants.length > 0) {
        const firstVariantId = products[0].variants[0].id;
        cy.log(`First variant ID: ${firstVariantId}`);
        Cypress.env('variantId', firstVariantId);
      } else {
        throw new Error('No variants found in the product response');
      }
    });
  });

  it('Should fetch variants and validate is_paginated is true', () => {
    cy.getCustomerVariants().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('is_paginated', true);
      expect(response.body).to.have.property('data').and.to.be.an('array');
    });
  });

  
  it('Should fetch product-specific variant details using variant ID', () => {
    cy.getCustomerProducts().then((response) => {
      expect(response.status).to.eq(200);
      const variantId = response.body.data?.[0]?.variants?.[0]?.id;
      expect(variantId).to.exist;
  
      cy.getCustomerProductVariantsByVariantId(variantId).then((variantResponse) => {
        expect(variantResponse.status).to.eq(200);
        expect(variantResponse.body).to.have.property('is_paginated');
      });
    });
  });
  


});
