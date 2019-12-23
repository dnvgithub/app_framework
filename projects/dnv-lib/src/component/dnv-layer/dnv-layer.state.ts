import { DnvFeatureLayer, DnvFieldFilter, DnvFieldMeta } from '../../models/DnvFeatureLayer';

// Visibility Status
export enum LayerType {
  Active,   // 0 - Shown
  Available // 1 - Hidden
}

export interface Layer {
  id: number; // ArcGIS Layer ID number - can change between executions
  uid: string; // An ID obtained from the ArcGIS Layer description that _should remain unchanged_
  name: string; // ArcGIS Layer Name - can change
  type: LayerType; // Determine if the layer is Shown on the map or Hidden
  minZoom: number; // The minimum zoom level at which the feature will show even if turned on
  // - used to prevent some features to clutter the map when zoomed out
  showLayerInfo: boolean; // toggleLayerInfo was removed from the html template in commit 73 but output is still in the ts class
  canFilter: boolean; // Show the "FILTER" button or not
  showFilterPanel: boolean; // Show the filter panel or not
  featureLayers: DnvFeatureLayer[]; // One layer for the user may be made of several ArcGIS layers
  fieldFilters?: DnvFieldFilter[]; // User managed Layer filter -> copied into each child DnvFeatureLayer
  whereClause?: string;
  featureCount?: number;
  loadingFilterCount?: boolean;
  meta?: DnvFieldMeta[];
  sequence?: number;
  tableLayers: any;
}

export interface LayerState {
  layers: Layer[];
  layersUrl: string;
  showFilterPanel: boolean;
  layersDrawingInfo: any;
  layersWithIcons: string[];
}

export const initialLayerState: LayerState = {
  layers: [],
  layersUrl: '', // 'assets/layers.json'
  showFilterPanel: false,
  layersDrawingInfo: [],
  layersWithIcons: []
};

export interface FeatureFilterUpdate {
  id: number;
  newFilters: DnvFieldFilter[];
  whereClause: string;
  layer: Layer; // This is the "old" layer, before the newFilters get applied
}

export function isLayerFilterActive(layer: Layer) {
  if (layer.fieldFilters && (layer.fieldFilters.length > 0)) {
    for (let index = 0; index < layer.fieldFilters.length; index++) {
      if ([].concat(layer.fieldFilters[index].filter).length > 0) {
        return true;
      }
    }
  }
  return false;
}

export interface LayerFeatureCount {
  count: number;
  id?: number;
  loading?: boolean;
}

export interface DnvDrawingInfo {
  val: string;
  iconUrl: string;
}
