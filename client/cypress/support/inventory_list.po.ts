import { InventoryItem } from 'src/app/inventory/inventory_item';

export class ItemListPage {
  private readonly baseUrl = '/inventory';
  private readonly pageTitle = '.item-list-title';
  private readonly itemCardSelector = '.item-cards-container app-item-card';
  private readonly itemListItemsSelector = '.item-nav-list .item-list-item';
  private readonly profileButtonSelector = '[data-test=viewProfileButton]';
  private readonly radioButtonSelector = '[data-test=viewTypeRadio] mat-radio-button';
  private readonly itemDescDropdownSelector = '[data-test=itemRoleSelect]';
  private readonly dropdownOptionSelector = 'mat-option';
  private readonly addItemButtonSelector = '[data-test=addItemButton]';

  navigateTo() {
    return cy.visit(this.baseUrl);
  }

  /**
   * Gets the title of the app when visiting the `/users` page.
   *
   * @returns the value of the element with the ID `.user-list-title`
   */
  getItemTitle() {
    return cy.get(this.pageTitle);
  }

  /**
   * Get all the `app-user-card` DOM elements. This will be
   * empty if we're using the list view of the users.
   *
   * @returns an iterable (`Cypress.Chainable`) containing all
   *   the `app-user-card` DOM elements.
   */
  getItemCards() {
    return cy.get(this.itemCardSelector);
  }

  /**
   * Get all the `.user-list-item` DOM elements. This will
   * be empty if we're using the card view of the users.
   *
   * @returns an iterable (`Cypress.Chainable`) containing all
   *   the `.user-list-item` DOM elements.
   */
  getItemListItems() {
    return cy.get(this.itemListItemsSelector);
  }

  /**
   * Clicks the "view profile" button for the given user card.
   * Requires being in the "card" view.
   *
   * @param card The user card
   */
  clickViewProfile(card: Cypress.Chainable<JQuery<HTMLElement>>) {
    return card.find<HTMLButtonElement>(this.profileButtonSelector).click();
  }

  /**
   * Change the view of users.
   *
   * @param viewType Which view type to change to: "card" or "list".
   */
  changeView(viewType: 'card' | 'list') {
    return cy.get(`${this.radioButtonSelector}[value="${viewType}"]`).click();
  }

  /**
   * Selects a role to filter in the "Role" selector.
   *
   * @param string The role *value* to select, this is what's found in the mat-option "value" attribute.
   */
  selectDesc(string: InventoryItem) {
    // Find and click the drop down
    cy.get(this.itemDescDropdownSelector).click();
    // Select and click the desired value from the resulting menu
    return cy.get(`${this.dropdownOptionSelector}[string="${string}"]`).click();
  }

  addItemButton() {
    return cy.get(this.addItemButtonSelector);
  }
}
