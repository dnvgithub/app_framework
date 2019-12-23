import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  dnvSearchActionType,
  LoadAssetId,
  LoadAssetIdSuccess,
  SetIconsUrl,
  SetIcons,
  SetCurrentSearchUrl,
  SetSearchItems,
} from './dnv-search.actions';

import { map, mergeMap, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Action } from '@ngrx/store';
import {
  Asset, SearchTypeInfo, // SearchItem
} from './dnv-search.state';
import { DnvSearchService } from './dnv-search.service';


@Injectable()
export class DnvSearchEffects {

  @Effect()
  loadAssetId$: Observable<Action> = this.actions$.pipe(
    ofType(dnvSearchActionType.LOAD_ASSET_ID),
    switchMap((action: LoadAssetId) =>
      this.http.get<Asset>(action.payload).pipe(
        map(data => new LoadAssetIdSuccess(data.asset_Id))
      )
    )
  );

  @Effect()
  setIconsUrl$: Observable<Action> = this.actions$.pipe(
    ofType(dnvSearchActionType.SET_ICONS_URL),
    mergeMap((action: SetIconsUrl) =>
      this.http
        .get<SearchTypeInfo[]>(action.payload)
        .pipe(map(data => new SetIcons(data)))
    )
  );

  @Effect()
  setCurrentSearchUrl$: Observable<Action> = this.actions$.pipe(
    ofType(dnvSearchActionType.SET_CURRENT_SEARCH_URL),
    mergeMap((action: SetCurrentSearchUrl) => {
      return this.dnvSearchService.getSearchItems(action.payload).pipe(
        map(data => {
          return new SetSearchItems(data);
        })
      );
    })
  );

  constructor(
    private http: HttpClient,
    private dnvSearchService: DnvSearchService,
    private actions$: Actions
  ) { }
}
