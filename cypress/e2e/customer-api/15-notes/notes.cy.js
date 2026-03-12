import * as notes from '../../../support/customer-api/notes/noteCommands';

describe('Customer API - Notes', () => {

  // Fetch a note from DB before each test to get dynamic IDs
  beforeEach(() => {
    notes.getNoteFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      const note = result[0];

      cy.log('DB note found:');
      cy.log('Note ID:', note.id);
      cy.log('Author:', note.author);
      cy.log('Order ID:', note.order_id);
      cy.log('Customer ID:', note.customer_id);
      cy.log('Subscription ID:', note.subscription_id);
      cy.log('Message:', note.message);
      cy.log('Title:', note.title);

      Cypress.env('dbNoteId', note.id);
      Cypress.env('dbNoteOrderId', note.order_id);
      Cypress.env('dbNoteCustomerId', note.customer_id);
    });
  });

  it('Test 1: Fetch all notes and log details', () => {
    notes.getAllNotes().then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data').and.to.be.an('array');

      const data = response.body.data;
      expect(data.length).to.be.greaterThan(0);

      const first = data[0];

      cy.log('Total notes returned:', data.length);
      cy.log('First Note ID:', first.id);
      cy.log('First Author:', first.author);
      cy.log('First Message:', first.message);
      cy.log('First Order ID:', first.order_id);
      cy.log('First Customer ID:', first.customer_id);
    });
  });

  it('Test 2: Fetch note by ID and verify details', () => {
    const noteId = Cypress.env('dbNoteId');
    expect(noteId).to.exist;

    cy.log('Fetching note by ID:', noteId);

    notes.getNoteById(noteId).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('id');

      cy.log('Fetched Note ID:', response.body.id);
      cy.log('Author:', response.body.author);
      cy.log('Message:', response.body.message);
      cy.log('Title:', response.body.title);
      cy.log('Order ID:', response.body.order_id);
      cy.log('Customer ID:', response.body.customer_id);
      cy.log('Subscription ID:', response.body.subscription_id);
      cy.log('Transaction ID:', response.body.transaction_id);
    });
  });

  it('Test 3: Fetch notes filtered by order_id', () => {
    const orderId = Cypress.env('dbNoteOrderId');
    expect(orderId).to.exist;

    cy.log('Fetching notes for order_id:', orderId);

    notes.getNotesByOrderId(orderId).then((response) => {
      expect(response.status).to.eq(200);

      const data = Array.isArray(response.body) ? response.body : response.body.data;
      expect(data).to.be.an('array').and.have.length.greaterThan(0);

      cy.log('Notes found for order:', data.length);
      cy.log('First Note ID:', data[0].id);
      cy.log('First Message:', data[0].message);
    });
  });

  it('Test 4: Fetch notes filtered by customer_id', () => {
    const customerId = Cypress.env('dbNoteCustomerId');
    expect(customerId).to.exist;

    cy.log('Fetching notes for customer_id:', customerId);

    notes.getNotesByCustomerId(customerId).then((response) => {
      expect(response.status).to.eq(200);

      const data = Array.isArray(response.body) ? response.body : response.body.data;
      expect(data).to.be.an('array').and.have.length.greaterThan(0);

      cy.log('Notes found for customer:', data.length);
      cy.log('First Note ID:', data[0].id);
      cy.log('First Message:', data[0].message);
    });
  });

  it('Test 5: Fetch notes filtered by subscription_id', () => {
    notes.getNoteBySubscriptionFromDB().then((result) => {
      expect(result.length).to.be.greaterThan(0);
      const subscriptionId = result[0].subscription_id;

      cy.log('Fetching notes for subscription_id:', subscriptionId);

      notes.getNotesBySubscriptionId(subscriptionId).then((response) => {
        expect(response.status).to.eq(200);

        const data = Array.isArray(response.body) ? response.body : response.body.data;
        expect(data).to.be.an('array').and.have.length.greaterThan(0);

        cy.log('Notes found for subscription:', data.length);
        cy.log('First Note ID:', data[0].id);
        cy.log('First Message:', data[0].message);
      });
    });
  });
});
