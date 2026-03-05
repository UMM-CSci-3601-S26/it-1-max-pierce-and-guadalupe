import { InventoryItem } from 'src/app/inventory/inventory_item';

export class AddItemPage {

  private readonly url = '/inventory/new';
  private readonly title = '.add-inventory-title';
  private readonly button = '[data-test=confirmAddItemButton]';
  private readonly snackBar = '.mat-mdc-simple-snack-bar';
  private readonly nameFieldName = 'name';
  private readonly locationFieldName = 'location';
  private readonly typeFieldName = 'type';
  private readonly stockedFieldName = 'stocked';
  private readonly formFieldSelector = 'mat-form-field';
  private readonly dropDownSelector = 'mat-option';

  navigateTo() {
    return cy.visit(this.url);
  }

  getTitle() {
    return cy.get(this.title);
  }

  addItemButton() {
    return cy.get(this.button);
  }

  selectMatSelectValue(select: Cypress.Chainable, value: string) {
    select.click();
    return cy.get('mat-option').contains(value).click();
  }

  getFormField(fieldName: string) {
    return cy.get(`${this.formFieldSelector} [formcontrolname=${fieldName}]`);
  }

  getSnackBar() {
    // Since snackBars are often shown in response to errors,
    // we'll add a timeout of 10 seconds to help increase the likelihood that
    // the snackbar becomes visible before we might fail because it
    // hasn't (yet) appeared.
    return cy.get(this.snackBar, { timeout: 10000 });
  }

  addItem(newItem: InventoryItem) {
    this.getFormField(this.nameFieldName).type(newItem.name);
    this.getFormField(this.stockedFieldName).type(newItem.stocked.toString());
    if (newItem.type) {
      this.getFormField(this.typeFieldName).type(newItem.type);
    }
    if (newItem.location) {
      this.getFormField(this.locationFieldName).type(newItem.location);
    }
    if (newItem.desc) {
      this.getFormField('desc').type(newItem.desc);
    }
    return this.addItemButton().click();
  }
}
