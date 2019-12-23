import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  catchError,
  map, mergeMap, flatMap, switchMap, concatMap
} from 'rxjs/operators';
import { Observable, of, forkJoin, throwError, from } from 'rxjs';
import { Action } from '@ngrx/store';
import {
  LoadLayers, DnvLayerActionType, LoadLayersSuccess, QueryLayerFeatureCount, UpdateLayerFeatureCount,
  GetDrawingInfo, SetDrawingInfo, GetLayersWithIcons
} from './dnv-layer.actions';
import { SetMapFeatureLayers } from '../dnv-map/dnv-map.action';

import { Layer, LayerFeatureCount, LayerState } from './dnv-layer.state';
import { DnvFeatureLayer } from '../../models/DnvFeatureLayer';
import { ToastUserNotification } from '../toastr/toastr.actions';

@Injectable()
export class LayerEffects {

  @Effect() loadLayers$: Observable<Action> = this.actions$.pipe(
    ofType(DnvLayerActionType.LOAD_LAYERS),
    mergeMap((action: LoadLayers) => this.httpClient.get<Layer[]>(action.payload).pipe(
      catchError(() => of([])),
      map((data: Layer[]) => data)

    )),
    flatMap((layers: any) => {
      if (layers.length > 0) {
        return [new LoadLayersSuccess(layers),
        new SetMapFeatureLayers(this.layerList(layers))];
      } else {
        return [
          new ToastUserNotification({
            type: 'error',
            title: 'Layers did not load',
            message: 'Layers did not load',
            options: {
              disableTimeOut: true,
              closeButton: true
            }
          })
        ];
      }
    }

    )
  );

  @Effect() queryLayerFeatureCount$: Observable<Action> = this.actions$.pipe(
    ofType(DnvLayerActionType.QueryLayerFeatureCount),
    switchMap((action: QueryLayerFeatureCount) => {

      const observables =
        action.payload.layer.featureLayers.map((featureLayer: DnvFeatureLayer) => {
          return this.httpClient
            .get<LayerFeatureCount>(featureLayer.url +
              '/query?where=' + encodeURIComponent(action.payload.whereClause) +
              '&returnCountOnly=true&f=pjson')
            .pipe(
              catchError(() => of({
                count: 0
              }))
            );
        });

      return forkJoin(observables).pipe(
        map((layerFeatureCounts: LayerFeatureCount[]) => {
          return [
            layerFeatureCounts.reduce((acc, value) => {
              // console.log(value);
              acc.count += value.count;
              return acc;
            },
              {
                count: 0,
                id: action.payload.id,
                loading: false
              })
          ];
        })
      );
    }),
    flatMap((layerFeatureCounts: LayerFeatureCount[]) => [
      new UpdateLayerFeatureCount(layerFeatureCounts[0])
    ])
  );

  @Effect() getDrawingInfo$: Observable<Action> =
    this.actions$.pipe(
      ofType(DnvLayerActionType.GetDrawingInfo),
      flatMap((action: GetDrawingInfo) =>
        this.httpClient.get(action.payload + '?f=pjson').pipe(
          catchError(() => of([])),
          map((data: any) => {
            if (data.drawingInfo) {
              return (new SetDrawingInfo(this.parseDrawingInfo(data, action.payload)));
            } else {
              return (new ToastUserNotification({
                type: 'error',
                title: 'Can\'t get drawing info',
                message: 'Something\'s not right',
                options: {
                  disableTimeOut: true,
                  closeButton: true
                }
              }));
            }
          }),
          flatMap((response: any) => [response]
          )
        )
      )
    );

  @Effect() getLayersWithIcons$: Observable<Action> = this.actions$.pipe(
    ofType(DnvLayerActionType.GetLayersWithIcons),
    map((action: GetLayersWithIcons) => {
      // put all feature layers url into array
      return this.httpClient.get(action.payload).pipe(
        mergeMap((layers: any) => {
          const flArr = [];
          if (layers.length > 0) {
            for (let x = 0; x < layers.length; x++) {
              for (let y = 0; y < layers[x].featureLayers.length; y++) {
                flArr.push(layers[x].featureLayers[y].url);
              }
            }
          }
          return flArr;
        })
      );

    }),

    switchMap((urls: any) => {
      return from(urls).pipe(
        concatMap(url => this.httpClient.get(url + '?f=json').pipe(
          catchError(() => of([])),
          map((jsObj: any) => {
            const actionArr = [];

            if (jsObj.length === 0 || jsObj.error) {
              actionArr.push(new ToastUserNotification({
                type: 'error',
                title: 'Can\'t read layer',
                message: 'Can\'t read layer drawing info: ' + url,
                options: {
                  disableTimeOut: true,
                  closeButton: true
                }
              }));
            } else if (jsObj.type.indexOf('Feature') > -1 || jsObj.type.indexOf('Raster') > -1) {
              if (jsObj.drawingInfo) {
                if (jsObj.drawingInfo.renderer) {
                  if (jsObj.drawingInfo.renderer.uniqueValueInfos && jsObj.drawingInfo.renderer.uniqueValueInfos.length > 0) {
                    if (jsObj.drawingInfo.renderer.uniqueValueInfos[0].symbol.type
                      && jsObj.drawingInfo.renderer.uniqueValueInfos[0].symbol.type.indexOf('esriSMS') > -1) {
                      actionArr.push(new GetDrawingInfo(url));
                    }
                  }
                }
              }
            }
            return actionArr;
          })
        ))
      );
    }),
    flatMap((res) => res)
  );



  constructor(
    private httpClient: HttpClient,
    private actions$: Actions
  ) { }

  layerList(layerState: Layer[]) {
    const activeFeatureLayers = layerState
      .filter(l => l.type === 0) // Only keep active layers
      .filter(l => 0 >= l.minZoom) // Show all layer with min zoomlevel 0
      .map(l => l.featureLayers);
    return activeFeatureLayers.reduce((accumulator, currentValue) => accumulator.concat(currentValue), []); // Poor man's FlatMap
  }

  parseDrawingInfo(jsonInput, url) {
    const drawingInfo = [];
    if (jsonInput.drawingInfo) {
      if (jsonInput.drawingInfo.renderer) {

        if (jsonInput.drawingInfo.renderer.uniqueValueInfos) {
          const uvi = jsonInput.drawingInfo.renderer.uniqueValueInfos;
          for (let i = 0; i < uvi.length; i++) {
            if (uvi[i].symbol.type.indexOf('esriSMS') > -1) {
              uvi[i].symbol.color = this.rgb2hex(uvi[i].symbol.color);
              uvi[i].symbol.outline.color = this.rgb2hex(uvi[i].symbol.outline.color);
              const temp = {
                val: uvi[i].value, label: uvi[i].label, symbol: uvi[i].symbol, url: url,
                key: jsonInput.drawingInfo.renderer.field1
              };
              drawingInfo.push(temp);
            }
          }
        }
      }
    }
    return drawingInfo;
  }

  getLayers(url) {
    return this.httpClient.get(url + '?f=pjson').subscribe();
  }

  rgb2hex(rgb) {
    const rgbArr = rgb.toString().split(',');
    return (rgbArr && rgbArr.length === 4) ? '#' +
      ('0' + Number(rgbArr[0]).toString(16)).slice(-2) +
      ('0' + Number(rgbArr[1]).toString(16)).slice(-2) +
      ('0' + Number(rgbArr[2]).toString(16)).slice(-2) : '';
  }

}

