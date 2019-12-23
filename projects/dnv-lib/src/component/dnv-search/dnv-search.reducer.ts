
import { DnvSearchState, initialSearchState } from './dnv-search.state';
import { DnvSearchAction, dnvSearchActionType } from './dnv-search.actions';

export function dnvSearchReducer(state: DnvSearchState = initialSearchState, action: DnvSearchAction): DnvSearchState {
  switch (action.type) {
    case dnvSearchActionType.SET_SEARCH_ITEMS_URL: {
      return Object.assign({}, state, { searchItemsUrl: action.payload });
    }

    case dnvSearchActionType.SET_CURRENT_SEARCH_URL: {
      return Object.assign({}, state, { currentSearchUrl: action.payload });
    }

    case dnvSearchActionType.SET_ICONS_URL: {
      return Object.assign({}, state, { iconsUrl: action.payload });
    }

    case dnvSearchActionType.SET_SELECTED_ITEM: {
      return Object.assign({}, state, { selected: action.payload });
    }

    case dnvSearchActionType.SET_ICONS: {
      return Object.assign({}, state, { icons: action.payload });
    }

    case dnvSearchActionType.SET_SEARCH_ITEMS: {
      return Object.assign({}, state, {
        searchItems: action.payload
      });
    }

    case dnvSearchActionType.LOAD_ASSET_ID_SUCCESS: {
      const selected = Object.assign({}, state.selected, { assetId: action.payload });
      return Object.assign({}, state, { selected: selected });
    }

    default:
      return state;
  }
}
