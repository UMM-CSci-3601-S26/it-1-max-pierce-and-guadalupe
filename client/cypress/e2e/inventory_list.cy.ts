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
    page.getItemListItems().should('have.length', 10);
  });

  it('Should type something in the name filter and check that it returned correct elements', () => {
    cy.get('[data-test=nameInput]').type('Yellow Pencils 12-Pack');

    page.getItemCards().each(e => {
      cy.wrap(e).find('.item-card-name').should('have.text', 'Yellow Pencils 12-Pack');
    });

    page.getItemCards().find('.item-card-name').each(el =>
      expect(el.text()).to.equal('Yellow Pencils 12-Pack')
    );
  });

  it('Should type something in the location filter and check that it returned correct elements', () => {
    cy.get('[data-test=locationInput]').type('Tote #1');

    page.getItemCards().should('have.lengthOf.above', 0);

    page.getItemCards().find('.item-card-location').each(card => {
      cy.wrap(card).should('have.text', 'Tote #1');
    });
  });

  it('Should type something partial in the type filter and check that it returned correct elements', () => {
    cy.get('[data-test=typeSelect]').type('pe');

    page.getItemCards().should('have.length', 3);

    page.getItemCards().each(e => {
      cy.wrap(e).find('.item-card-type').invoke('text').then(text => {
        expect(text.toLowerCase()).to.include('pe');
      });
    });

    page.getItemCards().find('.item-card-name')
      .should('contain.text', 'Yellow Pencils 12-Pack')
      .should('contain.text', 'Colored Pencils 16-Pack')
      .should('contain.text', 'Pencil Box')
      .should('not.contain.text', 'Green Folders')
      .should('not.contain.text', 'Red Folders')
      .should('not.contain.text', 'Erasers 6-Pack');
  });

  it('Should type something in the stocked filter and check that it returned correct elements', () => {
    cy.get('[data-test=stockedInput]').type('3');

    page.getItemCards().should('have.length', 2);

    page.getItemCards().find('.item-card-name')
      .should('contain.text', 'Red Folders')
      .should('contain.text', 'Green Folders')
      .should('not.contain.text', 'Yellow Pencils 12-Pack')
      .should('not.contain.text', 'Colored Pencils 16-Pack')
      .should('not.contain.text', 'Erasers 6-Pack')
      .should('not.contain.text', 'Pencil Box');
  });

  it('Should change the view', () => {
    page.changeView('list');

    page.getItemCards().should('not.exist');
    page.getItemListItems().should('exist');

    page.changeView('card');

    page.getItemCards().should('exist');
    page.getItemListItems().should('not.exist');
  });

  it('Should type something in the description filter, switch the view, and check that it returned correct elements', () => {
    cy.get('[data-test=descInput]')
      .type('Yellow #2 Ticonderoga pencils, sharpened, comes in packs of 12');

    page.changeView('list');

    page.getItemListItems().should('have.lengthOf.above', 0);

    page.getItemListItems().each(el => {
      cy.wrap(el)
        .find('.item-list-desc')
        .should('contain',
          'Yellow #2 Ticonderoga pencils, sharpened, comes in packs of 12'
        );
    });
  });

  it('Should click view profile on a item and go to the right URL', () => {
    page.getItemCards().first().then((card) => {
      const firstItemName = card.find('.item-card-name').text();
      const firstItemLocation = card.find('.item-card-location').text();
      const firstItemType = card.find('.item-card-type').text();

      page.clickViewProfile(page.getItemCards().first());

      cy.url().should('match', /\/inventory\/[0-9a-fA-F]{24}$/);

      cy.get('.item-card-name').first().should('have.text', firstItemName);
      cy.get('.item-card-location').first().should('have.text', firstItemLocation);
      cy.get('.item-card-type').first().should('have.text', firstItemType);
    });
  });

  it('Should click add item and go to the right URL', () => {
    page.addItemButton().click();

    cy.url().should(url => expect(url.endsWith('/inventory/new')).to.be.true);

    cy.get('.add-item-title').should('have.text', 'New Item');
  });

});
