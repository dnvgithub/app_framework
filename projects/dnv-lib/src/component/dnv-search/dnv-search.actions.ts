import { Action } from '@ngrx/store';
import { SearchItem, SearchTypeInfo } from './dnv-search.state';

export enum dnvSearchActionType {
  SET_SEARCH_ITEMS_URL = 'SET_SEARCH_ITEMS_URL',
  SET_CURRENT_SEARCH_URL = 'SET_CURRENT_SEARCH_URL',
  SET_SEARCH_ITEMS = 'SET_SEARCH_ITEMS',
  SET_ICONS_URL = 'SET_ICONS_URL',
  SET_ICONS = 'SET_ICONS',
  LOAD_ASSET_ID = 'LOAD_ASSET_ID',
  LOAD_ASSET_ID_SUCCESS = 'LOAD_ASSET_ID_SUCCESS',
  SET_SELECTED_ITEM = 'SET_SELECTED_ITEM'
}

export class SetSearchItemsUrl implements Action {
  readonly type = dnvSearchActionType.SET_SEARCH_ITEMS_URL;
  constructor(public payload: string) { }
}

export class SetCurrentSearchUrl implements Action {
  readonly type = dnvSearchActionType.SET_CURRENT_SEARCH_URL;
  constructor(public payload: string) { }
}

export class SetSelectedItem implements Action {
  readonly type = dnvSearchActionType.SET_SELECTED_ITEM;
  constructor(public payload: SearchItem) { }
}

export class SetSearchItems implements Action {
  readonly type = dnvSearchActionType.SET_SEARCH_ITEMS;
  constructor(public payload: SearchItem[]) { }
}

export class SetIconsUrl implements Action {
  readonly type = dnvSearchActionType.SET_ICONS_URL;
  constructor(public payload: string) { }
}

export class SetIcons implements Action {
  readonly type = dnvSearchActionType.SET_ICONS;
  constructor(public payload: SearchTypeInfo[]) { }
}

export class LoadAssetId implements Action {
  readonly type = dnvSearchActionType.LOAD_ASSET_ID;
  constructor(public payload: string) { }
}

export class LoadAssetIdSuccess implements Action {
  readonly type = dnvSearchActionType.LOAD_ASSET_ID_SUCCESS;
  constructor(public payload: string) { }
}

export type DnvSearchAction =
  SetSearchItems |
  SetSearchItemsUrl |
  SetCurrentSearchUrl |
  LoadAssetId |
  LoadAssetIdSuccess |
  SetIconsUrl |
  SetIcons |
  SetSelectedItem;
