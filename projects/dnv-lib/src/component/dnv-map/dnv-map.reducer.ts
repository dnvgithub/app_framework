import { ActionReducer, State } from '@ngrx/store';
import { DnvLatLng, DnvBounds, DnvBasemap, DnvMarker, DnvMapState, initialDnvMapState, DnvGeoJsonLayer } from './dnv-map.state';
import { DnvMapActionType, DnvMapAction } from './dnv-map.action';
import { DnvFeatureLayer } from '../../models/DnvFeatureLayer';

declare var L: any;

const ToggleSelect = (state: any, id: any) => {
  const index = state.features.findIndex(f => f.leafletId === id);
  return [...state.features.slice(0, index),
  Object.assign({}, state.features[index], { properties: { isSelected: !state.features[index].properties.isSelected } }),
  ...state.features.slice(index + 1)];
};

const SaveNoteToState = (state: any, shapeObj: any) => {
  const index = state.features.findIndex(f => f.leafletId === shapeObj.leafletId);
  return [...state.features.slice(0, index),
  Object.assign({}, state.features[index], {
    properties: {
      note: shapeObj.note
    }
  }),
  ...state.features.slice(index + 1)];
};

const AddToSelectedFeatureLayer = (state: any, payload: number) => {
  const selectedFL = {
    url: state.selectedFeatureLayer.url,
    allow_inspections: state.selectedFeatureLayer.allow_inspections,
    writeUrl: state.selectedFeatureLayer.writeUrl,
    selectedFeatureTable: payload
  };

  return selectedFL;
};

export function dnvMapReducer(state: DnvMapState = initialDnvMapState, action: DnvMapAction): DnvMapState {
  switch (action.type) {
    case DnvMapActionType.SetMapState:
      return action.payload as DnvMapState;

    case DnvMapActionType.SetMapBasemaps:
      return Object.assign({}, state, {
        basemaps: action.payload as DnvBasemap[]
      });

    case DnvMapActionType.SetMapFeatureLayers:
      return Object.assign({}, state, {
        featureLayers: action.payload as DnvFeatureLayer[]
      });

    case DnvMapActionType.SetMapGeoJsonLayers:
      return Object.assign({}, state, {
        geoJsonLayers: action.payload as DnvGeoJsonLayer[]
      });

    case DnvMapActionType.AddFeatureLayers:
      return Object.assign({}, state, {
        featureLayers: state.featureLayers.concat(action.payload as DnvFeatureLayer[])
      });

    case DnvMapActionType.RemoveFeatureLayers:
      return Object.assign({}, state, {
        featureLayers: state.featureLayers.filter(x => !(action.payload as DnvFeatureLayer[]).includes(x))
      });

    case DnvMapActionType.SetMarkers:
      return Object.assign({}, state, {
        markers: action.payload as DnvMarker[]
      });

    case DnvMapActionType.CenterMap:
      return Object.assign({}, state, {
        centerPoint: action.payload as DnvLatLng,
        zoomToGeoJsonUrl: ''
      });

    case DnvMapActionType.FitBounds:
      return Object.assign({}, state, {
        requestFitBounds: action.payload as DnvBounds
      });

    case DnvMapActionType.SetBounds:
      return Object.assign({}, state, {
        northWestBound: (action.payload as DnvBounds).northWestBound,
        southEastBound: (action.payload as DnvBounds).southEastBound
      });

    case DnvMapActionType.SetZoom:
      return Object.assign({}, state, {
        zoomLevel: action.payload,
        zoomToGeoJsonUrl: ''
      });

    case DnvMapActionType.ZoomToGeoJsonLayer:
      return Object.assign({}, state, {
        zoomToGeoJsonUrl: action.payload
      });

    case DnvMapActionType.ZoomToFeatures:
      return Object.assign({}, state, {
        zoomToFeatures: action.payload
      });

    case DnvMapActionType.DrawShapes:
      const shapes = [];
      if (state.features.length > 0) {
        for (let x = 0; x < state.features.length; x++) {
          shapes.push(state.features[x]);
        }
      }

      for (let i = 0; i < action.payload.length; i++) {
        const inArr = state.features.filter(obj => obj.shapeId === action.payload[i].shapeId);
        if (inArr.length === 0) {
          shapes.push(action.payload[i]);
        }
      }

      return Object.assign({}, state, { features: shapes });

    case DnvMapActionType.IsDrawing:
      return Object.assign({}, state, {
        isDrawing: action.payload
      });

    case DnvMapActionType.EditShapes:
      return Object.assign({}, state, {
        features: action.payload
      });

    case DnvMapActionType.ToggleSelectShape:
      return Object.assign({}, state, {
        features: ToggleSelect(state, action.payload)
      });

    case DnvMapActionType.SaveNote:
      return Object.assign({}, state, {
        features: SaveNoteToState(state, action.payload)
      });

    case DnvMapActionType.StartDraw:
      return Object.assign({}, state, {
        startDraw: action.payload
      });

    case DnvMapActionType.SelectFeature:
      return Object.assign({}, state, {
        selectedFeature: action.payload
      });

    case DnvMapActionType.ConcatAdditionalFeature:
      return Object.assign({}, state, {
        selectedFeature: state.selectedFeature ? state.selectedFeature.concat(action.payload) : state.selectedFeature
      });

    case DnvMapActionType.DeleteFeature:
      const index = state.features.findIndex(f => f.leafletId === action.payload.feature.leafletId);
      return Object.assign({}, state, {
        features: [...state.features.slice(0, index),
        ...state.features.slice(index + 1)]
      });

    case DnvMapActionType.UpdateFeature:
      const idx = state.features.findIndex(f => f.leafletId === action.payload.leafletId);
      let coords = [];

      switch (state.features[idx].geometry.type) {
        case 'LineString': // Polyline
          coords = [...action.payload.latlngs];
          break;
        case 'Point':
          coords = [action.payload.latlngs.lng, action.payload.latlngs.lat];
          break;
        case 'Polygon': // and MultiLineString use array of array of coordinates
          coords = action.payload.latlngs.map((innerArray: any[]) => [...innerArray]);
          // coords = [[...action.payload.latlngs]];
          break;
        default: // MultiPolygon use one extra level of array nesting - not handled yet
          console.error('Unexpected geometry type in UpdateFeature', state.features[idx].geometry.type);
          break;
      }

      const feature = Object.assign({}, state.features[idx], {
        shapeId: state.features[idx].shapeId,
        properties: state.features[idx].properties,
        type: state.features[idx].type,
        isMetric: state.features[idx].isMetric ? state.features[idx].isMetric : false,
        isLatLng: state.features[idx].isLatLng ? state.features[idx].isLatLng : false,
        geometry: {
          radius: state.features[idx].geometry.radius,
          type: state.features[idx].geometry.type,
          coordinates: coords
        }
      });

      return Object.assign({}, state, {
        features:
          [...state.features.slice(0, idx),
          Object.assign({}, state.features[idx], feature),
          ...state.features.slice(idx + 1)]
      });

    case DnvMapActionType.UpdateConversionUnit:
      const i = state.features.findIndex(f => f.leafletId === action.payload.leafletId);
      const newFeature = Object.assign({}, state.features[i], {});
      if (action.payload.hasOwnProperty('isMetric')) {
        newFeature.isMetric = action.payload.isMetric;
      }
      if (action.payload.hasOwnProperty('isLatLng')) {
        newFeature.isLatLng = action.payload.isLatLng;
      }

      return Object.assign({}, state, {
        features: [...state.features.slice(0, i),
          newFeature,
        ...state.features.slice(i + 1)]
      });

    case DnvMapActionType.ToggleFeaturePanel:
      return Object.assign({}, state, {
        expandFeaturePanel: !state.expandFeaturePanel
      });

    case DnvMapActionType.SetSelectedFeatureLayer:
      return Object.assign({}, state, {
        selectedFeatureLayer: action.payload
      });

    case DnvMapActionType.SetHighlightFeature:
      return Object.assign({}, state, {
        highlightFeature: JSON.stringify(state.highlightFeature) === JSON.stringify(action.payload) ? null : action.payload
      });

    case DnvMapActionType.SetFeatureTable:
      return Object.assign({}, state, {
        selectedFeatureLayer: AddToSelectedFeatureLayer(state, action.payload)
      });

    case DnvMapActionType.SetSurroundingFeatureList:
      return Object.assign({}, state, {
        surroundingFeatureList: action.payload
      });

    case DnvMapActionType.SetSelectedSurroundingFeature:
      return Object.assign({}, state, {
        selectedSurroundingFeature: action.payload
      });

    case DnvMapActionType.SetFeatureClickedType:
      return Object.assign({}, state, {
        featureClickType: action.payload
      });

    case DnvMapActionType.ToggleMarkerActive:
      const markerIdx = state.markers.findIndex(m => m.id === action.payload);
      if (markerIdx > -1 && state.markers[markerIdx].isActive !== null) {
        return Object.assign({}, state, {
          markers: [...state.markers.slice(0, markerIdx),
          Object.assign({}, state.markers[markerIdx], { isActive: !state.markers[markerIdx].isActive }),
          ...state.markers.slice(markerIdx + 1)]
        });
      } else {
        return state;
      }

    case DnvMapActionType.ResetMarkersActive:
      const mIdx = state.markers.findIndex(m => m.isActive === true);
      if (mIdx > -1 && state.markers[mIdx].isActive !== null) {
        return Object.assign({}, state, {
          markers: [...state.markers.slice(0, mIdx),
          Object.assign({}, state.markers[mIdx], { isActive: false }),
          ...state.markers.slice(mIdx + 1)]
        });
      } else {
        return state;
      }
    case DnvMapActionType.ResizeMap:
      return Object.assign({}, state, {
        resize: action.payload
      });

    case DnvMapActionType.CheckMarkerPosition:
      return Object.assign({}, state, {
        checkMarker: action.payload
      });

    case DnvMapActionType.SyncMarkersActive:
      const x = state.markers.findIndex(m => m.id === action.payload);
      if (x > -1 && state.markers[x].isActive !== null) {
        return Object.assign({}, state, {
          markers: [...state.markers.slice(0, x),
          Object.assign({}, state.markers[x], { isActive: true }),
          ...state.markers.slice(x + 1)]
        });
      } else {
        return state;
      }

    default:
      return state;
  }
}
