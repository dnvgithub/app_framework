import { DnvFeatureLayer } from '../../models/DnvFeatureLayer';
import * as proj4 from 'proj4';

export interface DnvLatLng {
  lat: number;
  lng: number;
}

export enum FeatureClickType {
  Path,
  Icon,
  Map
}

export interface DnvPoint {
  x: number;
  y: number;
}

export interface DnvHighLight {
  url: string;
  objectId: number;
}

export interface DnvMapInfo {
  latlng: DnvLatLng;
  mapSizeInPixel: string;
  mapBounds: DnvBounds;
}

export interface DnvBounds {
  northWestBound: DnvLatLng;
  southEastBound: DnvLatLng;
}

export interface DnvBasemap {
  url: string;
  opacity: number;
  name: string;
  thumbnail: string;
  selected: boolean;
}

export interface DnvGeoJsonLayer {
  url: string;
  json: any; // A GeoJson object
  style?: any; // A css like styling json or
  // a function that takes a GeoJson feature and returns the styling
  // per http://leafletjs.com/examples/geojson/
}

export interface DnvMarker {
  url: string;
  centerPoint: DnvLatLng;
  icon?: DnvMarkerIcon;
  activeIcon?: DnvMarkerIcon;
  svgIcon?: any;
  popup?: string;
  popupOptions?: any;
  zIndexOffset?: number;
  clickEvent?: boolean;
  id?: string;
  isActive?: boolean;
  tooltip?: string;
  tooltipOptions?: any;
}

// http://leafletjs.com/examples/custom-icons/
export interface DnvMarkerIcon {
  iconUrl: string;   // URL to icon 'images/marker-icon.png'
  shadowUrl?: string;   // URL to shadow 'images/marker-shadow.png'
  iconSize?: number[]; // size of the icon - all pairs of numbers
  shadowSize?: number[]; // size of the shadow
  iconAnchor?: number[]; // point of the icon which will correspond to marker's location
  shadowAnchor?: number[]; // the same for the shadow
  popupAnchor?: number[]; // point from which the popup should open relative to the iconAnchor
}

export interface ShapeGeometry {
  coordinates: number[][] | number[];
  radius: number;
  type: string;
}

export interface ShapeProperties {
  note?: string;
  isSelected: boolean;
}

export interface DnvDrawnShapes {
  type: string;
  shapeId: string;
  geometry: ShapeGeometry;
  leafletId?: number;
  isMetric?: boolean;
  isLatLng?: boolean;
  properties?: ShapeProperties;
}

// Create a valid deep copy of a DnvDrawnShapes to save outside of the application
export function exportDnvDrawnShape(shape: DnvDrawnShapes): DnvDrawnShapes {
  const exportShape: DnvDrawnShapes = {
    type: shape.type,
    shapeId: shape.shapeId,
    geometry: {
      coordinates: ('Point' === shape.geometry.type) ?
        (shape.geometry.coordinates as number[]).map(c => c) :
        (shape.geometry.coordinates as number[][]).map(c => [...c]),
      radius: shape.geometry.radius,
      type: shape.geometry.type
    }
  };

  // Skip leafletId as it is internal to the leaflet library and not to be exported

  if (shape.hasOwnProperty('isMetric') && (typeof (shape.isMetric) !== 'undefined') && (null !== shape.isMetric)) {
    exportShape.isMetric = shape.isMetric;
  }

  if (shape.hasOwnProperty('isLatLng') && (typeof (shape.isLatLng) !== 'undefined') && (null !== shape.isLatLng)) {
    exportShape.isLatLng = shape.isLatLng;
  }

  if (shape.properties) {
    exportShape.properties = {
      isSelected: shape.properties.isSelected
    };

    // This is assuming that we do not care *not* to export an empty string.
    if (shape.properties.note) {
      shape.properties.note = shape.properties.note;
    }
  }

  return exportShape;
}

export interface SurroundingFeature {
  name: string;
  kvPairs: Array<[string, string]>;
  objectId: string;
  url: string;
  writeUrl: string;
  allowInsp: boolean;
  featureId: number;
}

export interface DnvMapState {
  mapId: string;
  serviceEndpoint: string;
  centerPoint: DnvLatLng;
  northWestBound: DnvLatLng;
  southEastBound: DnvLatLng;
  origin: [number, number];
  resolutions: number[];
  zoomLevel: number;
  basemaps: DnvBasemap[];
  featureLayers: DnvFeatureLayer[];
  geoJsonLayers: DnvGeoJsonLayer[];
  zoomToGeoJsonUrl: string;
  zoomToFeatures: DnvFeatureLayer[];
  markers: DnvMarker[];
  showZoomControl: boolean;
  showDrawControl: boolean;
  requestFitBounds: DnvBounds;
  features: DnvDrawnShapes[];
  startDraw: { shape: string, guid: string };
  isDrawing: boolean;
  selectedFeature: any;
  expandFeaturePanel: boolean;
  excludeFeatureInfo: string[];
  selectedFeatureLayer: { url: string, allow_inspections: boolean, writeUrl: string, selectedFeatureTable: number };
  highlightFeature: DnvHighLight;
  clusterOptions: {
    disableClusteringAtZoom: number,
    maxClusterRadius: number,
    spiderfyOnMaxZoom: boolean
  };
  surroundingFeatureList: SurroundingFeature[];
  selectedSurroundingFeature: Array<[string, string]>;
  featureClickType: FeatureClickType;
  featureClick: boolean;
  resize: boolean;
  checkMarker: any;
}

export const initialDnvMapState: DnvMapState = {
  mapId: '',
  serviceEndpoint: '',
  centerPoint: { lat: 0, lng: 0 },
  northWestBound: { lat: 0, lng: 0 },
  southEastBound: { lat: 0, lng: 0 },
  origin: [0, 0],
  resolutions: [],
  zoomLevel: 0,
  basemaps: [],
  featureLayers: [],
  geoJsonLayers: [],
  zoomToGeoJsonUrl: '',
  zoomToFeatures: null,
  markers: [],
  showZoomControl: false,
  showDrawControl: false,
  requestFitBounds: null,
  features: [],
  startDraw: { shape: '', guid: '' },
  isDrawing: false,
  selectedFeature: {},
  expandFeaturePanel: false,
  excludeFeatureInfo: [],
  selectedFeatureLayer: { url: '', allow_inspections: false, writeUrl: '', selectedFeatureTable: 0 },
  highlightFeature: null,
  clusterOptions: {
    disableClusteringAtZoom: 6,
    maxClusterRadius: 60,
    spiderfyOnMaxZoom: false
  },
  surroundingFeatureList: null,
  selectedSurroundingFeature: [],
  featureClickType: null,
  featureClick: false,
  resize: false,
  checkMarker: null
};

export function DebugDnvMapStateToString(state: DnvMapState): string {
  const timestamp = new Date().toISOString();
  return '@' + timestamp + ' lat: ' + state.centerPoint.lat + ', lng: ' +
    state.centerPoint.lng + ', zoom: ' + state.zoomLevel + ', zoomToGeoJson: ' + state.zoomToGeoJsonUrl;
}

export function convertToXY(latlng: DnvLatLng) {
  const p = proj4.default;
  p.defs('EPSG:26910', '+proj=utm +zone=10 +ellps=GRS80 +datum=NAD83 +units=m +no_defs');
  const projection = p.defs['EPSG:26910'];
  const convertedPoint = p(projection).forward([latlng.lng, latlng.lat]);
  return convertedPoint;
}
