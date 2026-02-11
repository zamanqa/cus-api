import "../../../support/customer_api/retailerCommands";

describe('Retailers - Customer API', () => {
  let savedLocationId;

  it('Test 1: Should fetch all retailers and save a location_id', () => {
    cy.getAllRetailers().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.be.an('array').and.not.be.empty;

      const retailer = response.body.data.find(r => r.location_id);
      expect(retailer).to.have.property('location_id');

      savedLocationId = retailer.location_id;
      cy.wrap(savedLocationId).as('locationId'); // Save for next test
    });
  });

  it('Test 2: Should fetch a single retailer by location_id', function () {
    cy.getRetailerByLocationId(this.locationId).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('location_id', this.locationId);
    });
  });

  it('Should create a retailer successfully', () => {
    cy.createRetailer().then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('location_id');
  
      // Save the retailerId and locationId for the next test
      const retailerId = response.body.id;
      const locationId = response.body.location_id;
  
      Cypress.env('retailerId', retailerId);
      Cypress.env('locationId', locationId);
    });
  });

  
  it('Should update the created retailer successfully', () => {
    const retailerId = Cypress.env('retailerId');
    if (!retailerId) {
      throw new Error('Retailer ID not found. Make sure to run the create retailer test case first.');
    }
  
    cy.updateRetailer().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('id');
      expect(response.body.name).to.eq('test1');
    });
  });
  





});


