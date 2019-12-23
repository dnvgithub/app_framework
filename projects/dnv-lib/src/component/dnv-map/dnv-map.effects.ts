import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// In this context, switchMap seems appropriate as we would only ever be showing the information about the last clicked location
// but this may not always be appropriate.
import { switchMap, map, catchError, mergeMap } from 'rxjs/operators';



interface UnsafeAction extends Action {
  payload?: any;
}

@Injectable()
export class DnvMapEffects {

  constructor(
    private http: HttpClient,
    private actions$: Actions
  ) { }

}
