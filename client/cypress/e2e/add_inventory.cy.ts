import { InventoryItem } from 'src/app/inventory/inventory_item';
import { AddItemPage } from '../support/add_inventory.po';

describe('Add item', () => {
  const page = new AddItemPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTitle().should('have.text', 'New Item');
  });

  it('Should enable and disable the add item button', () => {
    // ADD Item button should be disabled until all the necessary fields
    // are filled. Once the last (`#emailField`) is filled, then the button should
    // become enabled.
    page.addItemButton().should('be.disabled');
    page.getFormField('name').type('Yellow Pencils 12-Pack');
    page.addItemButton().should('be.disabled');
    page.getFormField('stocked').type('0');
    page.addItemButton().should('be.disabled');
    page.selectMatSelectValue(page.getFormField('type'),'pencil');
    page.addItemButton().should('be.disabled');
    page.getFormField('location').type('tote #1');
    page.addItemButton().should('be.disabled');
    page.getFormField('desc').type('Yellow #2 Ticonderoga pencils, sharpened, comes in pack of 12');
    page.addItemButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs', () => {
    // Name errors
    cy.get('[data-test=nameError]').should('not.exist');
    page.getFormField('name').click().blur();
    cy.get('[data-test=nameError]').should('exist').and('be.visible');
    page.getFormField('name').type('J').blur();
    cy.get('[data-test=nameError]').should('exist').and('be.visible');
    page.getFormField('name').clear().type('A very long item name that exceeds fifty characters for testing').blur();
    cy.get('[data-test=nameError]').should('exist').and('be.visible');
    page.getFormField('name').clear().type('Yellow Pencils 12-Pack').blur();
    cy.get('[data-test=nameError]').should('not.exist');

    // Stocked errors
    cy.get('[data-test=stockedError]').should('not.exist');
    page.getFormField('stocked').click().blur();
    cy.get('[data-test=stockedError]').should('exist').and('be.visible');
    page.getFormField('stocked').type('-5').blur();
    cy.get('[data-test=stockedError]').should('exist').and('be.visible');
    page.getFormField('stocked').clear().type('abc').blur();
    cy.get('[data-test=stockedError]').should('exist').and('be.visible');
    page.getFormField('stocked').clear().type('0').blur();
    cy.get('[data-test=stockedError]').should('not.exist');
  });

  describe('Adding a new item', () => {
    beforeEach(() => {
      cy.task('seed:database');
    });

    it('Should go to the right page, and have the right info', () => {
      const item: InventoryItem = {
        _id: null,
        name: 'Red Folders',
        type: 'folder',
        desc: 'Red plastic folders, GreatValue',
        location: 'Tote #2',
        stocked: 3,
      };

      cy.intercept('POST', '/api/inventory').as('addItem');
      page.addItem(item);
      cy.wait('@addItem');

      // New URL should end in the 24 hex character Mongo ID of the newly added user.
      // We'll wait up to five full minutes for this these `should()` assertions to succeed.
      // Hopefully that long timeout will help ensure that our Cypress tests pass in
      // GitHub Actions, where we're often running on slow VMs.
      cy.url({ timeout: 300000 })
        .should('match', /\/inventory\/[0-9a-fA-F]{24}$/)
        .should('not.match', /\/inventory\/new$/);

      // The new user should have all the same attributes as we entered
      cy.get('.user-card-name').should('have.text', item.name);
      cy.get('.user-card-type').should('have.text', item.type);
      cy.get('.user-card-desc').should('have.text', item.desc);
      cy.get('.user-card-location').should('have.text', item.location);
      cy.get('.user-card-stocked').should('have.text', item.stocked.toString());

      // We should see the confirmation message at the bottom of the screen
      page.getSnackBar().should('contain', `Added item ${item.name}`);
    });

    it('Should fail with no location', () => {
      const item: InventoryItem = {
        _id: null,
        name: 'Bad Item',
        type: 'eraser',
        location: null, // The company being set to null means nothing will be typed for it
        desc: 'missing location',
        stocked: 5,
      };

      // Here we're _not_ expecting to route to `/api/users` since adding this
      // user should fail. So we don't add `cy.intercept()` and `cy.wait()` calls
      // around this `page.addUser(user)` call. If we _did_ add them, the test wouldn't
      // actually fail because a `cy.wait()` that times out isn't considered a failure,
      // although we could catch the timeout and turn it into a failure if we needed to.
      page.addItem(item);

      // We should get an error message
      page.getSnackBar().should('contain', 'Tried to add an illegal new item');

      // We should have stayed on the new user page
      cy.url()
        .should('not.match', /\/inventory\/[0-9a-fA-F]{24}$/)
        .should('match', /\/inventory\/new$/);

      // The things we entered in the form should still be there
      page.getFormField('name').should('have.value', item.name);
      page.getFormField('type').should('have.value', item.type);
      page.getFormField('desc').should('have.value', item.desc);
      page.getFormField('stocked').should('have.value', item.stocked.toString());
    });
  });
});
