import { ItemListPage } from '../support/inventory_list.po';

const page = new ItemListPage();

describe('Item list', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getItemTitle().should('have.text', 'Items');
  });

  it('Should show 10 users in both card and list view', () => {
    page.getItemCards().should('have.length', 10);
    page.changeView('list');
    page.getItemListItems().should('have.length', 100);
  });

  it('Should type something in the name filter and check that it returned correct elements', () => {
    // Filter for item 'Yellow Pencils 12-Pack'
    cy.get('[data-test=userNameInput]').type('Yellow Pencils 12-Pack');

    // All of the user cards should have the name we are filtering by
    page.getItemCards().each(e => {
      cy.wrap(e).find('.item-card-name').should('have.text', 'Yellow Pencils 12-Pack');
    });

    // (We check this two ways to show multiple ways to check this)
    page.getItemCards().find('.item-card-name').each(el =>
      expect(el.text()).to.equal('Yellow Pencils 12-Pack')
    );
  });

  it('Should type something in the location filter and check that it returned correct elements', () => {
    // Filter for company 'Bin #3'
    cy.get('[data-test=itemLocationInput]').type('Tote #1');

    page.getItemCards().should('have.lengthOf.above', 0);

    // All of the item cards should have the location we are filtering by
    page.getItemCards().find('.item-card-location').each(card => {
      cy.wrap(card).should('have.text', 'Tote #1');
    });
  });


  it('Should type something partial in the type filter and check that it returned correct elements', () => {
    // Filter for types that contain 'pe'
    cy.get('[data-test=itemTypeInput]').type('pe');

    page.getItemCards().should('have.lengthOf', 2);

    // Each item card's type name should include the text we are filtering by
    page.getItemCards().each(e => {
      cy.wrap(e).find('.item-card-type').should('include.text', 'PE');
    });

    // Go through each of the cards that are being shown and get the names
    page.getItemCards().find('.item-card-name')
      // We should see these items that have pe in name
      .should('contain.text', 'Yellow Pencils 12-Pack')
      .should('contain.text', 'Colored Pencils 16-Pack')
      .should('contain.text', 'Pencil Box')
      // We shouldn't see these users
      .should('not.contain.text', 'Green Folders')
      .should('not.contain.text', 'Red Folders')
      .should('not.contain.text', 'Erasers 6-Pack');
  });

  it('Should type something in the stocked filter and check that it returned correct elements', () => {
    // Filter for items of stocked  '3'
    cy.get('[data-test=itemStockedInput]').type('3');

    page.getItemCards().should('have.lengthOf', 1);

    // Go through each of the cards that are being shown and get the names
    page.getItemCards().find('.item-card-name')
      // We should see these items that have pe in name
      .should('contain.text', 'Red Folders')
      .should('contain.text', 'Green Folders')
      // We shouldn't see these users
      .should('not.contain.text', 'Yellow Pencils 12-Pack')
      .should('not.contain.text', 'Colored Pencils 16-Pack')
      .should('not.contain.text', 'Erasers 6-Pack')
      .should('not.contain.text', 'Pencil Box');
  });


  it('Should change the view', () => {
    // Choose the view type "List"
    page.changeView('list');

    // We should not see any cards
    // There should be list items
    page.getItemCards().should('not.exist');
    page.getItemListItems().should('exist');

    // Choose the view type "Card"
    page.changeView('card');

    // There should be cards
    // We should not see any list items
    page.getItemCards().should('exist');
    page.getItemListItems().should('not.exist');
  });

  it('Should select a desc, switch the view, and check that it returned correct elements', () => {
    // Filter for desc 'Yellow #2 Ticonderoga pencils, sharpened, comes in packs of 12');
    page.selectDesc('Yellow #2 Ticonderoga pencils, sharpened, comes in packs of 12');

    // Choose the view type "List"
    page.changeView('list');

    // Some of the users should be listed
    page.getItemListItems().should('have.lengthOf.above', 0);

    // All of the user list items that show should have the role we are looking for
    page.getItemListItems().each(el => {
      cy.wrap(el).find('.item-list-desc').should('contain', 'Yellow #2 Ticonderoga pencils, sharpened, comes in packs of 12');
    });
  });

  it('Should click view profile on a item and go to the right URL', () => {
    page.getItemCards().first().then((card) => {
      const firstItemName = card.find('.item-card-name').text();
      const firstItemLocation = card.find('.item-card-location').text();
      const firstItemType = card.find('.type-card-company').text();

      // When the view profile button on the first user card is clicked, the URL should have a valid mongo ID
      page.clickViewProfile(page.getItemCards().first());

      // The URL should be '/users/' followed by a mongo ID
      cy.url().should('match', /\/inventory\/[0-9a-fA-F]{24}$/);

      // On this profile page we were sent to, the name and company should be correct
      cy.get('.item-card-name').first().should('have.text', firstItemName);
      cy.get('.item-card-location').first().should('have.text', firstItemLocation);
      cy.get('.item-card-type').first().should('have.text', firstItemType);
    });
  });

  it('Should click add item and go to the right URL', () => {
    // Click on the button for adding a new item
    page.addItemButton().click();

    // The URL should end with '/inventory/new'
    cy.url().should(url => expect(url.endsWith('/inventory/new')).to.be.true);

    // On the page we were sent to, We should see the right title
    cy.get('.add-item-title').should('have.text', 'New Item');
  });

});
