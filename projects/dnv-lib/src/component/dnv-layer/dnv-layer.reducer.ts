import { Layer, LayerType, LayerState, initialLayerState, FeatureFilterUpdate, LayerFeatureCount } from './dnv-layer.state';
import { LayerAction, DnvLayerActionType } from './dnv-layer.actions';
import { DnvFeatureLayer } from '../../models/DnvFeatureLayer';

function updateLayerType(layers: Layer[], index: number, newType: LayerType) {
  const lyr = layers.filter(m => m.sequence !== 999 && m.sequence != null);
  let seq = 999;

  if (newType === 0) { // if active
    if (lyr.length === 0) {
      seq = 1;
    } else {
      seq = lyr.length + 1;
    }
  }

  return [...layers.slice(0, index),
  Object.assign({}, layers[index], { type: newType, sequence: seq }),
  ...layers.slice(index + 1)].sort((a, b) => a.sequence - b.sequence);
}
function updateLayerInfo(layers: Layer[], index: number) {
  return [...layers.slice(0, index),
  Object.assign({}, layers[index], { showLayerInfo: !layers[index].showLayerInfo }),
  ...layers.slice(index + 1)];
}
function hideAllFilterPanel(layers: Layer[], index: number) {
  const visiblePanelIndex = layers.findIndex(layer => layer.showFilterPanel);
  if (visiblePanelIndex >= 0 && visiblePanelIndex !== index) {
    return updateLayerShowFilterPanel(layers, visiblePanelIndex);
  }
  return layers;
}
function updateLayerShowFilterPanel(layers: Layer[], index: number) {
  return [...layers.slice(0, index),
  Object.assign({}, layers[index], { showFilterPanel: !layers[index].showFilterPanel }),
  ...layers.slice(index + 1)];
}
function updateFeatureLayerFieldFilter(featureLayers: DnvFeatureLayer[], featureFilterUpdate: FeatureFilterUpdate): DnvFeatureLayer[] {
  return featureLayers.map((featureLayer: DnvFeatureLayer) => {
    return Object.assign({}, featureLayer, { fieldFilters: featureFilterUpdate.newFilters, whereClause: featureFilterUpdate.whereClause });
  });
}
function updateLayerFilter(layers: Layer[], index: number, featureFilterUpdate: FeatureFilterUpdate): Layer[] {
  const newFeatureLayers: DnvFeatureLayer[] = updateFeatureLayerFieldFilter(layers[index].featureLayers, featureFilterUpdate);

  return [...layers.slice(0, index),
  Object.assign({}, layers[index]
    , {
      fieldFilters: featureFilterUpdate.newFilters
      , featureLayers: newFeatureLayers
      , whereClause: featureFilterUpdate.whereClause
    })
    , ...layers.slice(index + 1)];
}

function updateLayerFeatureCount(layers: Layer[], index: number, count: number, loading: boolean): Layer[] {

  return [...layers.slice(0, index),
  Object.assign({}, layers[index]
    , {
      featureCount: count
      , loadingFilterCount: loading
    })
    , ...layers.slice(index + 1)];
}

export function layerReducer(state: LayerState = initialLayerState, action: LayerAction): LayerState {
  switch (action.type) {
    case DnvLayerActionType.LOAD_LAYERS_SUCCESS:
    case DnvLayerActionType.SET_LAYERS:
        return Object.assign({}, state, {
          layers: action.payload
        });

    case DnvLayerActionType.LOAD_LAYERS: {
      return Object.assign({}, state, { layersUrl: action.payload });
    }


    case DnvLayerActionType.ToggleShowFilterPanel: {
      const selectedLayer = action.payload as Layer;
      const selectedLayerIndex = state.layers.findIndex(layer => layer.id === selectedLayer.id);

      // If any *other* panel is shown, hide it
      const tmpLayersWithNoFilterPanel: Layer[] = hideAllFilterPanel(state.layers, selectedLayerIndex);

      const newLayers = updateLayerShowFilterPanel(tmpLayersWithNoFilterPanel, selectedLayerIndex);
      const showFilterPanel = newLayers
        .filter(layer => layer.canFilter && layer.showFilterPanel)
        .length > 0;

      return Object.assign({}, state, {
        layers: newLayers,
        showFilterPanel: showFilterPanel
      });
    }

    case DnvLayerActionType.SET_ACTIVE_LAYER: {
      const selectedlayer = action.payload as Layer;
      Object.assign({}, state, {
        layers: updateLayerType(state.layers
          , state.layers.findIndex(layer => layer.id === selectedlayer.id)
          , LayerType.Active)
      });

      return Object.assign({}, state, {
        layers: updateLayerType(state.layers
          , state.layers.findIndex(layer => layer.id === selectedlayer.id)
          , LayerType.Active)
      });
    }

    case DnvLayerActionType.SET_AVAILABLE_LAYER: {
      const selectedlayer = action.payload as Layer;
      return Object.assign({}, state, {
        layers: updateLayerType(state.layers
          , state.layers.findIndex(layer => layer.id === selectedlayer.id)
          , LayerType.Available)
      });
    }

    case DnvLayerActionType.UpdateLayerFilter: {
      const featureFilterUpdate: FeatureFilterUpdate = action.payload as FeatureFilterUpdate;
      return Object.assign({}, state, {
        layers: updateLayerFilter(state.layers
          , state.layers.findIndex(layer => layer.id === featureFilterUpdate.id)
          , featureFilterUpdate)
      });
    }

    case DnvLayerActionType.QueryLayerFeatureCount: {
      const featureFilterUpdate: FeatureFilterUpdate = action.payload as FeatureFilterUpdate;
      return Object.assign({}, state, {
        layers: updateLayerFeatureCount(state.layers
          , state.layers.findIndex(layer => layer.id === featureFilterUpdate.id)
          , -1
          , true)
      });

    }

    case DnvLayerActionType.UpdateLayerFeatureCount: {
      const layerFeatureCount: LayerFeatureCount = action.payload as LayerFeatureCount;
      return Object.assign({}, state, {
        layers: updateLayerFeatureCount(state.layers
          , state.layers.findIndex(layer => layer.id === layerFeatureCount.id)
          , layerFeatureCount.count
          , false)
      });

    }

    case DnvLayerActionType.HideFilterPanel: {
      const visiblePanelIndex = state.layers.findIndex(layer => layer.showFilterPanel);
      const modifiedLayers = [...state.layers.slice(0, visiblePanelIndex),
      Object.assign({}, state.layers[visiblePanelIndex]
        , { showFilterPanel: !state.layers[visiblePanelIndex].showFilterPanel })
        , ...state.layers.slice(visiblePanelIndex + 1)];

      return Object.assign({}, state, {
        layers: modifiedLayers,
        showFilterPanel: false
      });
    }

    case DnvLayerActionType.SetDrawingInfo: {
      return Object.assign({}, state, { layersDrawingInfo: [...state.layersDrawingInfo, ...action.payload] });
    }

    default:
      return state;
  }
}
