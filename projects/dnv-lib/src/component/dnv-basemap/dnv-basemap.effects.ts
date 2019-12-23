import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  catchError,
  map, mergeMap, flatMap
} from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { DnvBaseMapActionType, LoadBaseMaps, SetBaseMaps } from './dnv-basemap.actions';
import { SetMapBasemaps } from '../dnv-map/dnv-map.action';
import { DnvBasemap } from '../dnv-map/dnv-map.state';

@Injectable()
export class BaseMapEffects {

  @Effect() loadBaseMaps$: Observable<Action> = this.actions$.pipe(
    ofType(DnvBaseMapActionType.LoadBaseMaps),
    mergeMap((action: LoadBaseMaps) => this.http.get<DnvBasemap[]>(action.payload)
      .pipe(
        catchError(() => of({ type: 'LoadBaseMaps_Failed' })),
        map((data: DnvBasemap[]) => data)
      )),

    flatMap((basemaps) => [
      new SetBaseMaps(basemaps),
      new SetMapBasemaps(basemaps.filter(basemap => basemap.selected === true))
    ])
  );

  constructor(
    private http: HttpClient,
    private actions$: Actions
  ) { }
}
