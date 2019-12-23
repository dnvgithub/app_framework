import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { dnvNavActionType, LoadButtonsSuccess, LoadButtons } from './dnv-nav.actions';
import { DnvButton } from './dnv-nav.state';
import { map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Action } from '@ngrx/store';

@Injectable()
export class DnvNavEffects {

  @Effect() loadButtons$: Observable<Action> = this.actions$.pipe(
    ofType(dnvNavActionType.LOAD_BUTTONS),
    switchMap(
      (action: LoadButtons) => this.http
        .get<DnvButton[]>(action.payload)
        .pipe(
          map(data => new LoadButtonsSuccess(data))
        )
    )
  );

  constructor(
    private http: HttpClient,
    private actions$: Actions
  ) { }
}
