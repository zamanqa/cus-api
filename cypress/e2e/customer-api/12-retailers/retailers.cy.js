import * as retailers from '../../../support/customer-api/retailers/retailerCommands';

describe('Customer API - Retailers', () => {

  // Fetch the latest retailer from DB before each test
  beforeEach(() => {
    retailers.getRetailerFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      const retailer = result[0];

      cy.log('DB retailer found:');
      cy.log('ID:', retailer.id);
      cy.log('Location ID:', retailer.location_id);
      cy.log('Name:', retailer.name);
      cy.log('Enabled:', retailer.enabled);

      Cypress.env('dbRetailerId', retailer.id);
      Cypress.env('dbLocationId', retailer.location_id);
    });
  });

  it('Test 1: Fetch all retailers and log details', () => {
    retailers.getAllRetailers().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data').and.to.be.an('array');

      const data = response.body.data;
      expect(data.length).to.be.greaterThan(0);

      const first = data[0];

      cy.log('Total retailers returned:', data.length);
      cy.log('First ID:', first.id);
      cy.log('First Location ID:', first.location_id);
      cy.log('First Name:', first.name);
      cy.log('First Enabled:', first.enabled);
    });
  });

  it('Test 2: Fetch retailer by location_id and verify in DB', () => {
    const locationId = Cypress.env('dbLocationId');
    expect(locationId).to.exist;

    cy.log('Fetching retailer by location_id:', locationId);

    retailers.getRetailerByLocationId(locationId).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('location_id', locationId);

      cy.log('Fetched Location ID:', response.body.location_id);
      cy.log('Name:', response.body.name);
      cy.log('Enabled:', response.body.enabled);
    });

    // Verify retailer exists in DB
    retailers.verifyRetailerByLocationIdInDB(locationId);
  });

  it('Test 3: Create a new retailer and verify in DB', () => {
    const uniqueSuffix = Date.now();
    const retailerData = {
      name: `Test Retailer ${uniqueSuffix}`,
      password: 'password',
      enabled: true,
      location_id: `retailer-${uniqueSuffix}`,
      address: {
        company: 'Circuly Test',
        street: 'Hansaallee 139',
        postal_code: '60320',
        city: 'Frankfurt',
        country: 'Germany',
        alpha2: 'DE',
      },
    };

    cy.log('Creating retailer with location_id:', retailerData.location_id);
    cy.log('Retailer name:', retailerData.name);

    retailers.createRetailer(retailerData).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      const retailerId = response.body.id;
      expect(retailerId).to.exist;

      cy.log('Created Retailer ID:', retailerId);
      cy.log('Created Location ID:', response.body.location_id);
      cy.log('Created Name:', response.body.name);

      Cypress.env('createdRetailerId', retailerId);
    });

    // Verify retailer exists in DB
    cy.then(() => {
      const retailerId = Cypress.env('createdRetailerId');
      retailers.verifyRetailerInDB(retailerId);
    });
  });

  it('Test 4: Update retailer and verify in DB', () => {
    const retailerId = Cypress.env('createdRetailerId');
    expect(retailerId, 'createdRetailerId must be set by Test 3').to.exist;

    const updateData = {
      name: 'Updated Retailer',
      password: 'password',
      enabled: true,
      address: {
        company: 'Circuly Updated',
        street: 'Hansaallee 139',
        postal_code: '60320',
        city: 'Frankfurt',
        country: 'Germany',
        alpha2: 'DE',
      },
    };

    cy.log('Updating retailer ID:', retailerId);
    cy.log('New name:', updateData.name);

    retailers.updateRetailer(retailerId, updateData).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('id');
      expect(response.body.name).to.eq('Updated Retailer');

      cy.log('Updated Retailer ID:', response.body.id);
      cy.log('Updated Name:', response.body.name);
    });

    // Verify retailer exists in DB after update
    retailers.verifyRetailerInDB(retailerId);
  });
});
