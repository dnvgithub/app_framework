import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SearchItem } from './dnv-search.state';

@Injectable()
export class DnvSearchService {

  constructor(
    private httpClient: HttpClient
  ) { }

  getSearchItems(url: string) {
    return this.httpClient
      .get<SearchItem[]>(url)
      .pipe<SearchItem[]>(catchError(this.handleError));
  }

  getSearchItemsResponse(url: string): Observable<HttpResponse<SearchItem[]>> {
    return this.httpClient.get<SearchItem[]>(url, { observe: 'response' });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an ErrorObservable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  }
}

