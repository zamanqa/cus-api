import '../../../support/customer_api/customerCommands';

describe('Customer API', () => {

  const customerId = 'cus_Rnx5s6erx9iwx9';
  let referralCode = '';

  it('Test 1: Return a paginated list of customers and store first customer ID', () => {
    cy.getAllCustomers().then((response) => {
      expect(response.status).to.eq(200);
      const firstCustomerId = response.body.data[0].id;
      Cypress.env('customerId', firstCustomerId);
      cy.log('Stored Customer ID:', firstCustomerId);
    });
  });


  it('Test 2:Fetch customer using stored customer ID', () => {
    const customerId = Cypress.env('customerId');
    expect(customerId).to.be.a('string').and.not.to.be.empty;

    cy.getCustomerById(customerId).then((response) => {
      expect(response.status).to.eq(200);
      cy.log('Fetched Customer:', response.body);
    });
  });

  it('Test 3:Shows customer balance using stored customer ID', () => {
    const customerId = Cypress.env('customerId');
    expect(customerId).to.be.a('string').and.not.to.be.empty;
  
    cy.getCustomerBalance(customerId).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('remaining_amount');
      cy.log('Customer Balance:', response.body.remaining_amount);
    });
  });

  it('Test 4: Update customer balance and verify updated remaining_amount', () => {
    const customerId = Cypress.env('customerId');
  
    const amountToAdd = 100;
  
    cy.addCustomerBalance(customerId, amountToAdd).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('remaining_amount');
      cy.log('Updated Customer Balance:', response.body.remaining_amount);
    });
  });
  
  it('Test 5: Update customer external_customer_id with a random 4-digit number', () => {
    const customerId = Cypress.env('customerId');
  
    const randomExternalId = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit number
  
    cy.updateCustomerExternalId(customerId, randomExternalId).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('message', 'Updated');
      cy.log('Updated external_customer_id to:', randomExternalId);
    });
  });

  it('Deletes referral code To create new code', () => {
    cy.deleteReferralByEmail('zaman.test@gmail.com');
  });
  
  
  it('Test 6: Create referral code for customer', () => {
    cy.createCustomerReferralCode(customerId).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('referral_code');

      referralCode = response.body.referral_code;
      Cypress.env('referralCode', referralCode);
      cy.log('Referral code created:', referralCode);
    });
  });

  it('Test 7: Get referral code and match with created one', () => {
    cy.getCustomerReferralCode(customerId).then((response) => {
      expect(response.status).to.eq(200);
      const fetchedCode = response.body.referral_code;
      expect(fetchedCode).to.eq(Cypress.env('referralCode'));
      cy.log('Referral code fetched:', fetchedCode);
    });
  });

  it('Delete referral code from database for next run', () => {
    const codeToDelete = Cypress.env('referralCode');
    expect(codeToDelete).to.be.a('string').and.not.be.empty;

    cy.deleteReferralCodeFromDB(codeToDelete);
  });

it('Test 8: Create a new customer with random external_customer_id and email', () => {
  // Call the custom command to create the customer with a random email and external_customer_id
  cy.createCustomer().then((response) => {
    // Assert the response status is 201 (created)
    expect(response.status).to.eq(201);
    cy.log('Customer created:', response.body);
  });
});



});

