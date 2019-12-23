
import { DnvLegendState, initialLegendState } from './dnv-legend.state';
import { LegendAction, legendActionType } from './dnv-legend.actions';

export function legendReducer(state: DnvLegendState = initialLegendState, action: LegendAction): DnvLegendState {
  switch (action.type) {
    case legendActionType.LOAD_LEGEND_LAYERS_SUCCESS:
    case legendActionType.SET_LEGEND_LAYERS:
        return Object.assign({}, state, {
          legendLayers: action.payload
        });

    case legendActionType.LOAD_LEGEND_LAYERS: {
      return Object.assign({}, state, { legendsUrl: action.payload });
    }

    case legendActionType.TOGGLE_LEGENDS: {
      return Object.assign({}, state, { hideLegends: !state.hideLegends });
    }

    case legendActionType.APPEND_ACTIVE_LEGEND_LAYERS: {
       return Object.assign({}, state, { legendLayers: [...state.legendLayers, ...action.payload] });
    }

    default:
      return state;
  }
}
