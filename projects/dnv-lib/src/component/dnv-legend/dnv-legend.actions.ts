import { Action } from '@ngrx/store';
import { LegendLayer } from './dnv-legend.state';
import { Layer } from '../dnv-layer/dnv-layer.state';

export enum legendActionType {
  TOGGLE_LEGENDS = 'TOGGLE_LEGENDS',
  SET_LEGEND_LAYERS = 'SET_LEGEND_LAYERS',
  LOAD_LEGEND_LAYERS = 'LOAD_LEGEND_LAYERS',
  LOAD_LEGEND_LAYERS_SUCCESS = 'LOAD_LEGEND_LAYERS_SUCCESS',
  LOAD_ACTIVE_LEGEND_LAYERS = 'LOAD_ACTIVE_LEGEND_LAYERS',
  APPEND_ACTIVE_LEGEND_LAYERS = 'APPEND_ACTIVE_LEGEND_LAYERS'
}

export class ToggleLegends implements Action {
  readonly type = legendActionType.TOGGLE_LEGENDS;
}

export class SetLegendLayers implements Action {
  readonly type = legendActionType.SET_LEGEND_LAYERS;
  constructor(public payload: LegendLayer[]) { }
}

export class LoadLegendLayers implements Action {
  readonly type = legendActionType.LOAD_LEGEND_LAYERS;
  constructor(public payload: string) { }
}

export class LoadLegendLayersSuccess implements Action {
  readonly type = legendActionType.LOAD_LEGEND_LAYERS_SUCCESS;
  constructor(public payload: LegendLayer[]) { }
}

export class LoadActiveLegendLayers implements Action {
  readonly type = legendActionType.LOAD_ACTIVE_LEGEND_LAYERS;
  constructor(public payload: any) { }
}

export class AppendActiveLegendLayers implements Action {
  readonly type = legendActionType.APPEND_ACTIVE_LEGEND_LAYERS;
  constructor(public payload: any) { }
}


export type LegendAction =
  LoadLegendLayers |
  LoadLegendLayersSuccess |
  ToggleLegends |
  SetLegendLayers |
  LoadActiveLegendLayers |
  AppendActiveLegendLayers;
