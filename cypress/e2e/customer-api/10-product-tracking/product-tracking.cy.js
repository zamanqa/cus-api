import * as productTracking from '../../../support/customer-api/product-tracking/productTrackingCommands';

describe('Customer Product Tracking API', () => {

  // Fetch the latest product tracking record and active subscription serial from DB before each test
  beforeEach(() => {
    productTracking.getProductTrackingFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      const pt = result[0];

      cy.log('DB product tracking record found:');
      cy.log('Serial Number:', pt.serial_number);
      cy.log('Product Name:', pt.product_name);
      cy.log('SKU:', pt.sku);
      cy.log('Location Status:', pt.location_status);
      cy.log('Location:', pt.location);
      cy.log('Customer Name:', pt.customer_name);
      cy.log('Subscription ID:', pt.subscription_id);

      Cypress.env('dbSerialNumber', pt.serial_number);
    });

    // Test 3: find a "rented out" serial with active subscription for repair
    productTracking.getActiveSubscriptionSerials().then((result) => {
      expect(result.length).to.be.greaterThan(0);

      const asset = result[0];
      cy.log('Active asset for repair test (Test 3):');
      cy.log('Serial Number:', asset.serial_number);
      cy.log('Location Status:', asset.location_status);
      cy.log('Product Name:', asset.product_name);
      cy.log('Subscription ID:', asset.subscription_id);
      Cypress.env('dbRepairSerial', asset.serial_number);
    });

    // Test 4: find a "to repair" serial with active subscription for stock
    productTracking.getRepairSerialForStock().then((result) => {
      if (result.length > 0) {
        const asset = result[0];
        cy.log('Repair asset for stock test (Test 4):');
        cy.log('Serial Number:', asset.serial_number);
        cy.log('Location Status:', asset.location_status);
        cy.log('Product Name:', asset.product_name);
        cy.log('Subscription ID:', asset.subscription_id);
        Cypress.env('dbStockSerial', asset.serial_number);
      } else {
        cy.log('No "to repair" serial found for Test 4 — will rely on Test 3 repaired serial');
      }
    });
  });

  it('Test 1: Fetch all product tracking records and log details', () => {
    productTracking.getAllProductTracking().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');

      const data = response.body.data;
      expect(data).to.be.an('array').and.have.length.greaterThan(0);

      const first = data[0];

      cy.log('Total product tracking records returned:', data.length);
      cy.log('First Serial Number:', first.serial_number);
      cy.log('First Product Name:', first.product_name);
      cy.log('First Location Status:', first.location_status);
      cy.log('First Location:', first.location);
    });
  });

  it('Test 2: Fetch product tracking by serial number and verify in DB', () => {
    const serialNumber = Cypress.env('dbSerialNumber');
    expect(serialNumber).to.exist;

    cy.log('Fetching product tracking for serial number:', serialNumber);

    productTracking.getProductTrackingBySerial(serialNumber).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('serial_number', serialNumber);

      cy.log('Fetched Serial Number:', response.body.serial_number);
      cy.log('Product Name:', response.body.product_name);
      cy.log('Location Status:', response.body.location_status);
      cy.log('Location:', response.body.location);
      cy.log('Customer Name:', response.body.customer_name);
      cy.log('Created At:', response.body.created_at);
    });

    // Verify product tracking record exists in DB
    productTracking.verifyProductTrackingInDB(serialNumber);
  });

  it('Test 3: Send repair request for product tracking', () => {
    const serialNumber = Cypress.env('dbRepairSerial');
    expect(serialNumber).to.exist;

    cy.log('Sending repair request for serial number:', serialNumber);

    productTracking.postRepairRequest(serialNumber).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.success).to.be.true;
      expect(response.body.message).to.eq('Updated');

      cy.log('Repair request successful for serial:', serialNumber);
      cy.log('Response success:', response.body.success);
      cy.log('Response message:', response.body.message);
    });

    // Verify location status changed to "to repair" in DB
    productTracking.verifyLocationStatusInDB(serialNumber, 'to repair');
  });

  it('Test 4: Send stock request for product tracking', () => {
    const serialNumber = Cypress.env('dbStockSerial');
    expect(serialNumber, 'dbStockSerial must exist — needs a "to repair" asset in DB').to.exist;

    cy.log('Sending stock request for serial number:', serialNumber);

    productTracking.postStockRequest(serialNumber).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body[0].success).to.be.true;
      expect(response.body[0].message).to.eq('Updated');

      cy.log('Stock request successful for serial:', serialNumber);
      cy.log('Response success:', response.body[0].success);
      cy.log('Response message:', response.body[0].message);
    });

    // Verify location status changed to "in stock" in DB
    productTracking.verifyLocationStatusInDB(serialNumber, 'in stock');
  });
});
