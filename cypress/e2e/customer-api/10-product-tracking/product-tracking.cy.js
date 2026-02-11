import '../../../support/customer_api/productTrackingCommands';

describe('Customer Product Tracking API', () => {


  let serialNumber;

  before(() => {
    cy.getLatestSerialNumberForProductTracking().then((sn) => {
      serialNumber = sn;
      cy.log('Using serial number:', serialNumber);
    });
  });

  it('Test 1: should fetch product tracking information successfully', () => {
    cy.getProductTracking().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');
      cy.log('Product tracking data:', response.body.data);
    });
  });

  it('Test 2: should fetch product tracking by serial number', () => {
    cy.getSerialNumberFromDB().then((serialNumber) => {
      expect(serialNumber).to.be.a('string').and.not.to.be.empty;

      cy.getProductTrackingBySerial(serialNumber).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('serial_number', serialNumber);
        cy.log('Product Tracking Data:', response.body);
      });
    });
  });


  it('Test 4: Test Repair Request for Product Tracking', () => {
    cy.postRepairRequest(serialNumber).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.success).to.be.true;
      expect(response.body.message).to.eq('Updated');
    });
  });

  it('Test 4: Test Stock Request for Product Tracking', () => {
    cy.postStockRequest(serialNumber).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body[0].success).to.be.true;
      expect(response.body[0].message).to.eq('Updated');
    });
  });


});
