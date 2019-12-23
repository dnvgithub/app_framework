import { Action } from '@ngrx/store';
import { PropertiesState } from './properties.state';
import { DnvLatLng } from '../../component/dnv-map/dnv-map.state';

export const PropertiesActionType = {
  PARCEL_PROPERTIES: '[Properties] Parcel Properties',
  GIS_DBLINK_REQUESTED: '[Properties] Gis DBLink Requested',
  GIS_DBLINK_FOUND: '[Properties] Gis DBLink Found',
  GIS_DBLINK_NOT_FOUND: '[Properties] Gis DBLink Not Found',
  GIS_DETAILS_NOT_AVAILABLE: '[Properties] Gis Details Not Available'
};

export class SetProperties implements Action {
  public type: string = PropertiesActionType.PARCEL_PROPERTIES;

  constructor(public payload: PropertiesState) { }
}

export class GisDBLinkRequested implements Action {
  public type: string = PropertiesActionType.GIS_DBLINK_REQUESTED;

  constructor(public payload: DnvLatLng) { }
}

export class GisDBLinkFound implements Action {
  public type: string = PropertiesActionType.GIS_DBLINK_FOUND;

  constructor(public payload: string) { }
}

export class GisDBLinkNotFound implements Action {
  public type: string = PropertiesActionType.GIS_DBLINK_NOT_FOUND;

  constructor(public payload: string) { }
}

export class GisDetailsNotAvailable implements Action {
  public type: string = PropertiesActionType.GIS_DETAILS_NOT_AVAILABLE;

  constructor(public payload: string) { }
}

export type PropertiesAction =
  SetProperties |
  GisDBLinkRequested |
  GisDBLinkFound |
  GisDBLinkNotFound |
  GisDetailsNotAvailable;
