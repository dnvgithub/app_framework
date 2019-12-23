export class DnvLegendState {
  legendLayers: LegendLayer[];
  hideLegends: boolean;
  legendsUrl: string;
}

export const initialLegendState: DnvLegendState = {
  legendLayers: [],
  hideLegends: true,
  legendsUrl: ''
};

export interface LegendLayer {
  layerId: number;
  layerName: string;
  layerType: string;
  minScale: number;
  maxScale: number;
  legend: Legend[];
}

export interface Legend {
  label: string;
  url: string;
  imageData: string;
  contentType: string;
  height: number;
  width: number;
  values: string[];
}

export interface LegendInfo {
  layers: LegendLayer[];
}
