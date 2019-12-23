import { Action } from '@ngrx/store';
import { Layer, FeatureFilterUpdate, LayerFeatureCount } from './dnv-layer.state';

export enum DnvLayerActionType {
  LOAD_LAYERS = '[layer] LOAD_LAYERS',
  LOAD_LAYERS_SUCCESS = '[layer] LOAD_LAYERS_SUCCESS',
  SET_ACTIVE_LAYER = '[layer] SET_ACTIVE_LAYER',
  SET_AVAILABLE_LAYER = '[layer] SET_AVAILABLE_LAYER',
  TOGGLE_LAYER_INFO = '[layer] TOGGLE_LAYER_INFO',
  ToggleShowFilterPanel = '[layer] ToggleShowFilterPanel',
  UpdateLayerFilter = '[layer] UpdateLayerFilter',
  QueryLayerFeatureCount = '[layer] QueryLayerFeatureCount',
  UpdateLayerFeatureCount = '[layer] UpdateLayerFeatureCount',
  UPDATE_LAYER_TYPE = '[layer] UPDATE_LAYER_TYPE',
  SET_LAYERS = '[layer] SET_LAYERS',
  FeatureClicked = '[layer] FEATURE_CLICKED',
  HideFilterPanel = '[layer] HideFilterPanel',
  CheckInspection = '[layer] CHECK_INSPECTION',
  GetInspection = '[layer] GET_INSPECTION',
  GetInspAttachment = '[layer] GET_INSPECTIONATTACHMENT',
  GetInspectionFields = '[layer] GET_INSPECTIONFIELDS',
  SetInspFields = '[layer] SET_INSPECTIONFIELDS',
  GetDrawingInfo = '[layer] GET_DRAWINGINFO',
  SetDrawingInfo = '[layer] SET_DRAWINGINFO',
  GetLayersWithIcons = '[layer] GET_LAYERSWITHICONS',
  InspectionClicked = '[layer] INSPECTION_CLICKED'
}

export class LoadLayers implements Action {
  readonly type = DnvLayerActionType.LOAD_LAYERS;
  constructor(public payload: string) { }
}

export class LoadLayersSuccess implements Action {
  readonly type = DnvLayerActionType.LOAD_LAYERS_SUCCESS;
  constructor(public payload: Layer[]) { }
}

export class SetActiveLayer implements Action {
  readonly type = DnvLayerActionType.SET_ACTIVE_LAYER;
  constructor(public payload: Layer) { }
}

export class SetAvailableLayer implements Action {
  readonly type = DnvLayerActionType.SET_AVAILABLE_LAYER;
  constructor(public payload: Layer) { }
}

export class ToggleShowFilterPanel implements Action {
  readonly type = DnvLayerActionType.ToggleShowFilterPanel;
  constructor(public payload: Layer) { }
}

export class UpdateLayerFilter implements Action {
  readonly type = DnvLayerActionType.UpdateLayerFilter;
  constructor(public payload: FeatureFilterUpdate) { }
}

export class QueryLayerFeatureCount implements Action {
  readonly type = DnvLayerActionType.QueryLayerFeatureCount;
  constructor(public payload: FeatureFilterUpdate) { }
}

export class UpdateLayerFeatureCount implements Action {
  readonly type = DnvLayerActionType.UpdateLayerFeatureCount;
  constructor(public payload: LayerFeatureCount) { }
}

export class UpdateLayerType implements Action {
  readonly type = DnvLayerActionType.UPDATE_LAYER_TYPE;
  constructor(public payload: Layer) { }
}

export class SetLayers implements Action {
  readonly type = DnvLayerActionType.SET_LAYERS;
  constructor(public payload: Layer[]) { }
}

export class FeatureClicked implements Action {
  public type: string = DnvLayerActionType.FeatureClicked;
  constructor(public payload: any = null) { }
}

export class HideFilterPanel implements Action {
  public type: string = DnvLayerActionType.HideFilterPanel;
  constructor(public payload: any = null) { }
}

export class CheckInspection implements Action {
  public type: string = DnvLayerActionType.CheckInspection;
  constructor(public payload: any = null) { }
}

export class GetInspection implements Action {
  public type: string = DnvLayerActionType.GetInspection;
  constructor(public payload: any = null) { }
}

export class GetInspAttachment implements Action {
  public type: string = DnvLayerActionType.GetInspAttachment;
  constructor(public payload: any = null) { }
}

export class SetInspFields implements Action {
  public type: string = DnvLayerActionType.SetInspFields;
  constructor(public payload: any = null) { }
}

export class GetDrawingInfo implements Action {
  type = DnvLayerActionType.GetDrawingInfo;
  constructor(public payload: any = null) { }
}

export class SetDrawingInfo implements Action {
  type = DnvLayerActionType.SetDrawingInfo;
  constructor(public payload: any = null) { }
}

export class GetLayersWithIcons implements Action {
  type = DnvLayerActionType.GetLayersWithIcons;
  constructor(public payload: any = null) { }
}

export class InspectionClicked implements Action {
  public type: string = DnvLayerActionType.InspectionClicked;
  constructor(public payload: any = null) { }
}

export type LayerAction =
  LoadLayers |
  LoadLayersSuccess |
  ToggleShowFilterPanel |
  UpdateLayerFilter |
  QueryLayerFeatureCount |
  UpdateLayerFeatureCount |
  SetActiveLayer |
  SetAvailableLayer |
  UpdateLayerType |
  SetLayers |
  FeatureClicked |
  HideFilterPanel |
  CheckInspection |
  GetInspection |
  GetInspAttachment |
  SetInspFields |
  GetDrawingInfo |
  SetDrawingInfo |
  GetLayersWithIcons |
  InspectionClicked;
