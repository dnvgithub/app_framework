import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// In this context, switchMap seems appropriate as we would only ever be showing the information about the last clicked location
// but this may not always be appropriate.
import { switchMap, map, catchError } from 'rxjs/operators';

import {
  SetProperties,
  GisDBLinkRequested, GisDBLinkFound, GisDBLinkNotFound, GisDetailsNotAvailable, PropertiesActionType
} from './properties.action';

import { PropertyInfo } from '../../service/gis-data/property-info.service';

interface UnsafeAction extends Action {
  payload?: any;
}

@Injectable()
export class PropertiesEffects {

  @Effect() gisDBLinkRequested$: Observable<any> = this.actions$.pipe(
    ofType(PropertiesActionType.GIS_DBLINK_REQUESTED),
    switchMap(
      (action: GisDBLinkRequested) => this.http.get(
        `https://www.geoweb.dnv.org/arcgis/rest/services/Data_CommonQueryLayers/MapServer/0/` +
        `query?f=json&where=&returnGeometry=false&spatialRel=esriSpatialRelIntersects` +
        `&geometry={%22x%22:${action.payload.lng},%22y%22:${action.payload.lat}}` +
        `&geometryType=esriGeometryPoint&inSR=4326`
      ).pipe(
        map(this.extractDBLink),
        catchError(this.handleError)
      )
    )
  );

  @Effect() gisDBLinkFound$: Observable<any> = this.actions$.pipe(
    ofType(PropertiesActionType.GIS_DBLINK_FOUND),
    switchMap(
      (action: GisDBLinkFound) => this.http.get<PropertyInfo[]>(this.dataUrl(action.payload)).pipe(
        map(this.extractData),
        catchError(this.handleError)
      )
    )
  );

  @Effect() gisNoParcelProperties$ = this.actions$.pipe(
    ofType(PropertiesActionType.GIS_DBLINK_NOT_FOUND, PropertiesActionType.GIS_DETAILS_NOT_AVAILABLE),
    switchMap(
      () => of(new SetProperties(null))
    )
  );

  private dataUrl = (dbLink: string) =>
    `https://www.geoweb.dnv.org/applications/PropertyService/PropertyService.svc/Properties?dblink=${
    dbLink
    }&returnGeometry=false&format=json`;


  private extractData(body: PropertyInfo[]): UnsafeAction {
    const details = body[0].Properties[0].Details;

    if (details === null) {
      return new GisDetailsNotAvailable('No details available for DBLink ' + body[0].Properties[0].DBLink);
    } else {
      const assessment = details!.Assessment!;
      const building = details!.Building!;
      const arr: Array<[string, string]> = [];
      for (const prop in assessment) {
        if (assessment.hasOwnProperty(prop)) {
          arr.push([prop, assessment[prop]]);
        }
      }
      for (const prop in building) {
        if (building.hasOwnProperty(prop)) {
          arr.push([prop, building[prop]]);
        }
      }
      return new SetProperties({ properties: arr });
    }
  }


  private extractDBLink(dbLinkJson: any): UnsafeAction {
    const feature = dbLinkJson.features[0];
    if (typeof feature === 'undefined') {
      return new GisDBLinkNotFound('No DBLink found at the selected location');
    } else {
      return new GisDBLinkFound(feature.attributes.DBLink);
    }
  }


  private handleError(error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return throwError(errMsg);
  }


  constructor(
    private http: HttpClient,
    private actions$: Actions
  ) { }

}
