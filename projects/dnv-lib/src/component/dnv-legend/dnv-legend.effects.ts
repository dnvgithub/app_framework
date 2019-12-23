import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Actions, Effect, ofType } from '@ngrx/effects';

import {
  // catchError,
  map, mergeMap, concatMap
} from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Action } from '@ngrx/store';
import {
  legendActionType, LoadLegendLayers, LoadLegendLayersSuccess, AppendActiveLegendLayers,
  LoadActiveLegendLayers
} from './dnv-legend.actions';
import { LegendInfo } from './dnv-legend.state';

@Injectable()
export class DnvLegendEffects {

  @Effect() loadLegendLayers$: Observable<Action> = this.actions$.pipe(
    ofType(legendActionType.LOAD_LEGEND_LAYERS),
    mergeMap((action: LoadLegendLayers) => this.http.get<LegendInfo>(action.payload).pipe(
      map(data => new LoadLegendLayersSuccess(data.layers)),
    ))
  );

  @Effect() loadActiveLegendLayers$: Observable<Action> = this.actions$.pipe(
    ofType(legendActionType.LOAD_ACTIVE_LEGEND_LAYERS),
    concatMap((action: LoadActiveLegendLayers) => this.http.get<LegendInfo>(action.payload).pipe(
      map(data => new AppendActiveLegendLayers(data.layers)),
    ))
  );

  constructor(
    private http: HttpClient,
    private actions$: Actions
  ) { }
}
