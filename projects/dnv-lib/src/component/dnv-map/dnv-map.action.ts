import { Action } from '@ngrx/store';
import {
  DnvLatLng, DnvBounds, DnvBasemap, DnvMarker, DnvMapState, DnvGeoJsonLayer, DnvDrawnShapes,
  FeatureClickType
} from './dnv-map.state';
import { DnvFeatureLayer } from '../../models/DnvFeatureLayer';

export const DnvMapActionType = {
  SetMapState: '[Map] SetMapState',
  SetMapBasemaps: '[Map] SetMapBasemaps',
  SetMapFeatureLayers: '[Map] SetMapFeatureLayers',
  SetMapGeoJsonLayers: '[Map] SetMapGeoJsonLayers',
  SetMarkers: '[Map] SetMarkers',
  CenterMap: '[Map] CenterMap',
  FitBounds: '[Map] FitBounds',
  SetBounds: '[Map] SetBounds',
  SetZoom: '[Map] SetZoom',
  ZoomToGeoJsonLayer: '[Map] ZoomToGeoJsonLayer',
  ZoomToFeatures: '[Map] ZoomToFeatures',
  AddFeatureLayers: '[Map] AddFeatureLayers',
  RemoveFeatureLayers: '[Map] RemoveFeatureLayers',
  DrawShapes: '[Map] DrawShapes',
  IsDrawing: '[Map] IsDrawing',
  EditShapes: '[Map] EditShapes',
  ToggleSelectShape: '[Map] ToggleSelectShape',
  SaveNote: '[Map] SaveNote',
  StartDraw: '[Map] StartDraw',
  SelectFeature: '[Map] SelectFeature',
  ConcatAdditionalFeature: '[Map] ConcatAdditionalFeature',
  DeleteFeature: '[MAP] DeleteFeature',
  UpdateFeature: '[MAP] UpdateFeature',
  AddedFeature: '[MAP] AddedFeature',
  UpdateShapesList: '[MAP] UpdateShapesList',
  UpdateConversionUnit: '[MAP] UpdateConversionUnit',
  ToggleFeaturePanel: '[MAP] ToggleFeaturePanel',
  SetSelectedFeatureLayer: '[MAP] SetSelectedFeatureLayer',
  SetHighlightFeature: '[MAP] SetHighlightFeature',
  SetSurroundingFeatureList: '[MAP] SetSurroundingFeatureList',
  SetSelectedSurroundingFeature: '[MAP] SetSelectedSurroundingFeature',
  SetFeatureClickedType: '[MAP] SetFeatureClickedType',
  ResetSelected: '[MAP] ResetSelected',
  SetFeatureTable: '[MAP] SetFeatureTable',
  MarkerClick: '[MAP] MarkerClick',
  ToggleMarkerActive: '[MAP] ToggleMarkerActive',
  ResetMarkersActive: '[MAP] ResetMarkersActive',
  ResizeMap: '[MAP] ResizeMap',
  CheckMarkerPosition: '[MAP] CheckMarkerPosition',
  SyncMarkersActive: '[MAP] SyncMarkersActive'
};

export class SetMapState implements Action {
  type = DnvMapActionType.SetMapState;

  constructor(public payload: DnvMapState) { }
}

export class SetMapBasemaps implements Action {
  type = DnvMapActionType.SetMapBasemaps;

  constructor(public payload: DnvBasemap[]) { }
}

export class SetMapFeatureLayers implements Action {
  type = DnvMapActionType.SetMapFeatureLayers;

  constructor(public payload: DnvFeatureLayer[]) { }
}

export class SetMapGeoJsonLayers implements Action {
  type = DnvMapActionType.SetMapGeoJsonLayers;

  constructor(public payload: DnvGeoJsonLayer[]) { }
}

export class AddFeatureLayers implements Action {
  type = DnvMapActionType.AddFeatureLayers;

  constructor(public payload: DnvFeatureLayer[]) { }
}

export class RemoveFeatureLayers implements Action {
  type = DnvMapActionType.RemoveFeatureLayers;

  constructor(public payload: DnvFeatureLayer[]) { }
}

export class SetMarkers implements Action {
  type = DnvMapActionType.SetMarkers;

  constructor(public payload: DnvMarker[]) { }
}

export class CenterMap implements Action {
  type = DnvMapActionType.CenterMap;

  constructor(public payload: DnvLatLng) { }
}

export class FitBounds implements Action {
  type = DnvMapActionType.FitBounds;

  constructor(public payload: DnvBounds) { }
}

export class SetBounds implements Action {
  type = DnvMapActionType.SetBounds;

  constructor(public payload: DnvBounds) { }
}

export class SetZoom implements Action {
  type = DnvMapActionType.SetZoom;

  constructor(public payload: number) { }
}

export class ZoomToGeoJsonLayer implements Action {
  type = DnvMapActionType.ZoomToGeoJsonLayer;

  constructor(public payload: string) { }
}

export class ZoomToFeatures implements Action {
  type = DnvMapActionType.ZoomToFeatures;

  constructor(public payload: DnvFeatureLayer[]) { }
}

export class DrawShapes implements Action {
  type = DnvMapActionType.DrawShapes;
  constructor(public payload: any) { }
}

export class IsDrawing implements Action {
  type = DnvMapActionType.IsDrawing;
  constructor(public payload: boolean) { }
}

export class EditShapes implements Action {
  type = DnvMapActionType.EditShapes;
  constructor(public payload: any) { }
}

export class ToggleSelectShape implements Action {
  type = DnvMapActionType.ToggleSelectShape;
  constructor(public payload: number) { }
}

export class SaveNote implements Action {
  type = DnvMapActionType.SaveNote;
  constructor(public payload: any) { }
}

export class StartDraw implements Action {
  type = DnvMapActionType.StartDraw;
  constructor(public payload: any) { }
}

export class SelectFeature implements Action {
  type = DnvMapActionType.SelectFeature;
  constructor(public payload: any) { }
}

export class ConcatAdditionalFeature implements Action {
  type = DnvMapActionType.ConcatAdditionalFeature;
  constructor(public payload: any) { }
}

export class DeleteFeature implements Action {
  type = DnvMapActionType.DeleteFeature;
  constructor(public payload: number) { }
}

export class UpdateFeature implements Action {
  type = DnvMapActionType.UpdateFeature;
  constructor(public payload: any) { }
}

export class AddedFeature implements Action {
  type = DnvMapActionType.AddedFeature;
  constructor(public payload: any) { }
}

export class UpdateShapesList implements Action {
  type = DnvMapActionType.UpdateShapesList;
  constructor(public payload: any) { }
}

export class UpdateConversionUnit implements Action {
  type = DnvMapActionType.UpdateConversionUnit;
  constructor(public payload: any) { }
}

export class ToggleFeaturePanel implements Action {
  type = DnvMapActionType.ToggleFeaturePanel;
  constructor(public payload: any = null) { }
}

export class SetSelectedFeatureLayer implements Action {
  type = DnvMapActionType.SetSelectedFeatureLayer;
  constructor(public payload: any = null) { }
}

export class SetHighlightFeature implements Action {
  type = DnvMapActionType.SetHighlightFeature;
  constructor(public payload: any = { url: '', objectId: 0 }) { }
}

export class SetSurroundingFeatureList implements Action {
  public type: string = DnvMapActionType.SetSurroundingFeatureList;
  constructor(public payload: any) { }
}

export class SetSelectedSurroundingFeature implements Action {
  public type: string = DnvMapActionType.SetSelectedSurroundingFeature;
  constructor(public payload: boolean) { }
}

export class SetFeatureClickedType implements Action {
  public type: string = DnvMapActionType.SetFeatureClickedType;
  constructor(public payload: FeatureClickType) { }
}

export class ResetSelected implements Action {
  type = DnvMapActionType.ResetSelected;
  constructor(public payload: any = null) { }
}

export class SetFeatureTable implements Action {
  type = DnvMapActionType.SetFeatureTable;
  constructor(public payload: any = null) { }
}

export class MarkerClick implements Action {
  type = DnvMapActionType.MarkerClick;
  constructor(public payload: any = null) { }
}

export class ToggleMarkerActive implements Action {
  type = DnvMapActionType.ToggleMarkerActive;
  constructor(public payload: any = null) { }
}

export class ResetMarkersActive implements Action {
  type = DnvMapActionType.ResetMarkersActive;
  constructor(public payload: any = null) { }
}

export class ResizeMap implements Action {
  type = DnvMapActionType.ResizeMap;
  constructor(public payload: any = null) { }
}

export class CheckMarkerPosition implements Action {
  type = DnvMapActionType.CheckMarkerPosition;
  constructor(public payload: any = null) { }
}

export class SyncMarkersActive implements Action {
  type = DnvMapActionType.SyncMarkersActive;
  constructor(public payload: any = null) { }
}

export type DnvMapAction =
  SetMapState |
  SetMapBasemaps |
  SetMapFeatureLayers |
  SetMapGeoJsonLayers |
  SetMarkers |
  CenterMap |
  FitBounds |
  SetBounds |
  SetZoom |
  ZoomToGeoJsonLayer |
  ZoomToFeatures |
  AddFeatureLayers |
  RemoveFeatureLayers |
  DrawShapes |
  IsDrawing |
  ToggleSelectShape |
  SaveNote |
  StartDraw |
  SelectFeature |
  ConcatAdditionalFeature |
  DeleteFeature |
  AddedFeature |
  UpdateFeature |
  UpdateShapesList |
  UpdateConversionUnit |
  ToggleFeaturePanel |
  SetSelectedFeatureLayer |
  SetHighlightFeature |
  SetSurroundingFeatureList |
  SetSelectedSurroundingFeature |
  SetFeatureClickedType |
  ResetSelected |
  SetFeatureTable |
  MarkerClick |
  ToggleMarkerActive |
  ResetMarkersActive |
  ResizeMap |
  CheckMarkerPosition |
  SyncMarkersActive;

