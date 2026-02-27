import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { InventoryItem } from './inventory_item';
//import { Company } from '../company-list/company';
//import { Signal } from '@angular/core/rxjs-interop';

/**
 * Service that provides the interface for getting information
 * about `Users` from the server.
 */
@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  // The private `HttpClient` is *injected* into the service
  // by the Angular framework. This allows the system to create
  // only one `HttpClient` and share that across all services
  // that need it, and it allows us to inject a mock version
  // of `HttpClient` in the unit tests so they don't have to
  // make "real" HTTP calls to a server that might not exist or
  // might not be currently running.
  private httpClient = inject(HttpClient);

  // The URL for the users part of the server API.
  readonly inventoryUrl: string = `${environment.apiUrl}inventory`;
  //readonly usersByCompanyUrl: string = `${environment.apiUrl}usersByCompany`;

  private readonly nameKey = 'name';
  private readonly locationKey = 'location';
  private readonly typeKey = 'type';
  private readonly descKey = 'desc';
  private readonly stockedKey = 'stocked';

  /**
   * Get all the users from the server, filtered by the information
   * in the `filters` map.
   *
   * It would be more consistent with `UserListComponent` if this
   * only supported filtering on age and role, and left company to
   * just be in `filterUsers()` below. We've included it here, though,
   * to provide some additional examples.
   *
   * @param filters a map that allows us to specify a target role, age,
   *  or company to filter by, or any combination of those
   * @returns an `Observable` of an array of `InventoryItems`. Wrapping the array
   *  in an `Observable` means that other bits of of code can `subscribe` to
   *  the result (the `Observable`) and get the results that come back
   *  from the server after a possibly substantial delay (because we're
   *  contacting a remote server over the Internet).
   */
  getItems(filters?: { name?: string; stocked?: number; desc?: string; location?: string; type?: string; }): Observable<InventoryItem[]> {
    // `HttpParams` is essentially just a map used to hold key-value
    // pairs that are then encoded as "?key1=value1&key2=value2&…" in
    // the URL when we make the call to `.get()` below.
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.name) {
        httpParams = httpParams.set(this.nameKey, filters.name);
      }
      if (filters.stocked) {
        httpParams = httpParams.set(this.stockedKey, filters.stocked.toString());
      }
      if (filters.location) {
        httpParams = httpParams.set(this.locationKey, filters.location);
      }
      if (filters.desc) {
        httpParams = httpParams.set(this.descKey, filters.desc);
      }
      if (filters.type) {
        httpParams = httpParams.set(this.typeKey, filters.type);
      }
    }
    // Send the HTTP GET request with the given URL and parameters.
    // That will return the desired `Observable<User[]>`.
    return this.httpClient.get<InventoryItem[]>(this.inventoryUrl, {
      params: httpParams,
    });
  }

  /**
   * Get the `User` with the specified ID.
   *
   * @param id the ID of the desired user
   * @returns an `Observable` containing the resulting user.
   */
  getItemById(id: string): Observable<InventoryItem> {
    // The input to get could also be written as (this.userUrl + '/' + id)
    return this.httpClient.get<InventoryItem>(`${this.inventoryUrl}/${id}`);
  }

  /**
   * A service method that filters an array of `InventoryItems` using
   * the specified filters.
   *
   * Note that the filters here support partial matches. Since the
   * matching is done locally we can afford to repeatedly look for
   * partial matches instead of waiting until we have a full string
   * to match against.
   *
   * @param items the array of `InventoryItems` that we're filtering
   * @param filters the map of key-value pairs used for the filtering
   * @returns an array of `Users` matching the given filters
   */
  filterItems(items: InventoryItem[], filters: { name?: string; stocked?: number; desc?: string; location?: string; type?: string; }): InventoryItem[] { // skipcq: JS-0105
    let filteredItems = items; //.getValue();
    // let filteredItems: InventoryItem[] = [];

    //TODO, write sorting logic here!
    // Filter by name
    if (filters.name) {
      filters.name = filters.name.toLowerCase();
      filteredItems = filteredItems.filter(item => item.name.toLowerCase().indexOf(filters.name) !== -1);
    }

    // // Filter by company
    // if (filters.company) {
    //   filters.company = filters.company.toLowerCase();
    //   filteredUsers = filteredUsers.filter(user => user.company.toLowerCase().indexOf(filters.company) !== -1);
    // }

    return filteredItems;
  }

  // getCompanies(): Observable<Company[]> {
  //   return this.httpClient.get<Company[]>(`${this.usersByCompanyUrl}`);
  // }

  addItem(newItem: Partial<InventoryItem>): Observable<string> {
    // Send post request to add a new user with the user data as the body.
    // `res.id` should be the MongoDB ID of the newly added `User`.
    return this.httpClient.post<{id: string}>(this.inventoryUrl, newItem).pipe(map(response => response.id));
  }
}
