import { BaseMapState, initialBaseMapState } from './dnv-basemap.state';
import { DnvBaseMapAction, DnvBaseMapActionType } from './dnv-basemap.actions';
import { DnvBasemap } from '../dnv-map/dnv-map.state';
import { State } from '@ngrx/store';

function updateBaseMapSelected(basemaps: DnvBasemap[], name: DnvBasemap) {
  return basemaps.map((basemap: DnvBasemap) => {
    return Object.assign({}, basemap, { selected: basemap.name === name.name ? true : false });
  });
}

export function baseMapReducer(state: BaseMapState = initialBaseMapState, action: DnvBaseMapAction): BaseMapState {
  switch (action.type) {

    case DnvBaseMapActionType.SetBaseMaps:
      return Object.assign({}, state, {
        basemap: action.payload
      });

    case DnvBaseMapActionType.SetBaseMapSelected:
      return Object.assign({}, state, {
        basemap: updateBaseMapSelected(state.basemap, action.payload)
      });

    case DnvBaseMapActionType.ToggleBasemaps:
      return Object.assign({}, state, {
        showBasemaps: !state.showBasemaps
      });

    case DnvBaseMapActionType.CloseBasemaps:
      return Object.assign({}, state, {
        showBasemaps: false
      });

    default:
      return state;
  }
}
