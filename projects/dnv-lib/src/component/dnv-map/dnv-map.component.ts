import {
  Component,
  AfterContentInit,
  Output,
  Input,
  EventEmitter,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ComponentFactoryResolver,
  Injector
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import {
  DnvLatLng,
  DnvBounds,
  DnvBasemap,
  DnvMarker,
  DnvMapState,
  initialDnvMapState,
  DnvGeoJsonLayer,
  DnvDrawnShapes,
  DnvMapInfo,
  FeatureClickType,
  DnvPoint,
  convertToXY
} from './dnv-map.state';
import { ScriptService } from '../../service/script.service';
import { DnvFeatureLayer } from '../../models/DnvFeatureLayer';
import {
  DnvMapAction,
  FitBounds,
  DrawShapes,
  ToggleSelectShape,
  EditShapes,
  StartDraw,
  SetZoom,
  SelectFeature,
  ZoomToFeatures,
  DeleteFeature,
  UpdateFeature,
  AddedFeature,
  UpdateShapesList,
  UpdateConversionUnit,
  SetSelectedFeatureLayer,
  ResetSelected,
  SetFeatureClickedType,
  SetSurroundingFeatureList,
  SetHighlightFeature,
  IsDrawing,
  MarkerClick,
  ToggleMarkerActive,
  ResetMarkersActive,
  ResizeMap,
  CheckMarkerPosition
} from './dnv-map.action';
import {
  FeatureClicked,
  CheckInspection,
  SetInspFields
} from '../dnv-layer/dnv-layer.actions';
import { LayerState } from '../dnv-layer/dnv-layer.state';
import { DnvMapPopupComponent } from '../dnv-map-popup/dnv-map-popup.component';

import * as proj4 from 'proj4';
import * as proj4leaflet from 'proj4leaflet';
import { Guid } from 'guid-typescript';
import { loadQueryList } from '@angular/core/src/render3';
import { initialLayerState } from '../dnv-layer/dnv-layer.state';

import { Marker, LatLngBounds } from 'leaflet';

declare var L: any; // L is for leaflet

// Both LatLng objects and coordinates, array of 2 numbers (longitude, latitude)
// or 3 numbers (longitude, latitude, altitude) are used.

@Component({
  selector: 'dnv-map',
  template:
    '<div id="{{ mapId ? mapId : _mapState.mapId}}" style="height: 100%;"></div>',
  styleUrls: ['./leaflet.css', './leaflet.draw.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnvMapComponent implements AfterContentInit {
  private map: any; // TODO: Type leaflet
  public _mapState: DnvMapState = initialDnvMapState;
  public _shapesState: any;
  private minZoom: number;
  private maxZoom: number;
  private basemaps: Map<string, any> = new Map();
  private featureLayers: Map<string, any> = new Map();
  private geoJsonLayers: Map<string, any> = new Map();
  private markers: Map<string, Marker> = new Map();
  private mapIsMoving = false;
  private stateUpdate: Subject<DnvMapState> = new Subject<DnvMapState>();
  private stateSubscription: Subscription;
  private editShapes = false;
  private drawCtrl: any;
  private editCtrl: any;
  private delCtrl: any;
  private drawnItems: any;
  private markersArr: any[] = [];

  private colorRed = '#ff0000';
  private selectedFeatureId = 0;
  private featureClicked = false;

  @Input('mapState') set mapState(value: DnvMapState) {
    // Wrap the map state inside an observable in order to trigger updates based on the browser animationFrame
    this.stateUpdate.next(value);
  }
  @Input() layerState: LayerState;
  @Input() mapId: string;

  @Output() mapClick = new EventEmitter<DnvMapInfo>();
  @Output() mapMoveChange = new EventEmitter<DnvMapState>();
  @Output() mapZoomChange = new EventEmitter<DnvMapState>();
  @Output() mapUpdate = new EventEmitter<DnvMapAction>();

  static isNearby(lhs: DnvLatLng, rhs: DnvLatLng, epsilon: number): Boolean {
    return (
      Math.abs(lhs.lat - rhs.lat) <= epsilon &&
      Math.abs(lhs.lng - rhs.lng) <= epsilon
    );
  }

  private updateMapState(value: DnvMapState) {
    const previousMapState = this._mapState;

    this._mapState = value;
    this.minZoom = 0;
    this.maxZoom = this._mapState.resolutions.length - 1;

    if (this.map) {
      // resizes map
      if (this._mapState.resize === true) {
        this.map.invalidateSize();
        this.mapUpdate.emit(new ResizeMap(false));
      }

      // perform check to make sure marker doesn't get covered
      if (this._mapState.checkMarker) {
        this.doPanning(this._mapState.checkMarker);
      }

      let zoomLevel = this._mapState.zoomLevel;
      if (zoomLevel > this.maxZoom) {
        zoomLevel = this.maxZoom;
      } else if (zoomLevel < this.minZoom) {
        zoomLevel = this.minZoom;
      }

      this.updateBasemaps(previousMapState.basemaps, this._mapState.basemaps);
      this.updateFeatureLayers(
        previousMapState.featureLayers,
        this._mapState.featureLayers
      );
      this.updateGeoJsonLayers(
        previousMapState.geoJsonLayers,
        this._mapState.geoJsonLayers
      );
      this.zoomToGeoJsonUrl(
        previousMapState.zoomToGeoJsonUrl,
        this._mapState.zoomToGeoJsonUrl
      );
      this.zoomToFeatures(
        previousMapState.zoomToFeatures,
        this._mapState.zoomToFeatures
      );
      this.updateMarkers(previousMapState.markers, this._mapState.markers);
      this.updateShowZoomControl(this._mapState.showZoomControl);
      this.updateShowDrawControl(this._mapState.showDrawControl);
      this.requestFitBounds(this._mapState.requestFitBounds);
      // draw buttons
      this.triggerDrawEvents(this._mapState.startDraw);
      // update shape colours based on isSelected state
      this.updateSelectedShapes(this._mapState.features);
      // update shapes popup content
      this.updatePopupContent(this._mapState.features);
      // load saved shapes
      this.updateSavedShapes(this._mapState.features);
      // reset icon colours if no feature selected, ie feature info panel closed
      this.resetIcons();
      // Highlight features on mapstate.highlightFeature is populated
      this.highlightFeatures();

      // compare states for drawn shapes
      if (previousMapState.features) {
        this.updateFeatures(previousMapState.features, this._mapState.features);
      }

      if (
        !this.mapIsMoving &&
        (!DnvMapComponent.isNearby(
          this.map.getCenter(),
          this._mapState.centerPoint,
          0.0001
        ) ||
          this.map.getZoom() !== zoomLevel)
      ) {
        this.map.setView(this._mapState.centerPoint, zoomLevel);
      } else if (zoomLevel !== this._mapState.zoomLevel) {
        // An out of bound zoom level was requested, send back a valid state object
        this.mapZoomChange.emit(
          Object.assign({}, this._mapState, {
            zoomLevel: zoomLevel
          })
        );
      }

      const stateBounds = L.latLngBounds(
        this._mapState.northWestBound,
        this._mapState.southEastBound
      );
      if (!this.map.options.maxBounds.equals(stateBounds)) {
        this.map.setMaxBounds(stateBounds);
      }
    }
  }

  private isBasemapEqual(lhs: DnvBasemap, rhs: DnvBasemap): boolean {
    return lhs.url === rhs.url && lhs.opacity === rhs.opacity;
  }

  private updateBasemaps(
    oldBasemaps: DnvBasemap[],
    newBasemaps: DnvBasemap[]
  ): void {
    let index = 0;

    // Exit early if basemaps are equal
    if (oldBasemaps.length === newBasemaps.length) {
      let matching = true;
      for (; index < oldBasemaps.length; index++) {
        if (!this.isBasemapEqual(oldBasemaps[index], newBasemaps[index])) {
          matching = false;
          break;
        }
      }
      if (matching) {
        return;
      }
    }

    let oldBM: any, newBM: any;

    // Add new layers on top or move existing layers to front
    for (; index < newBasemaps.length; index++) {
      newBM = newBasemaps[index];
      oldBM = this.findInList(oldBasemaps, newBM);
      const layer: any = this.getBasemapLayer(newBM);
      layer.setOpacity(newBM.opacity);
      layer.bringToFront();

      if (oldBM) {
        // This prevents inconsistent behavior in the display of layers
        layer.removeFrom(this.map);
      }
      layer.addTo(this.map);
    }

    // Remove from the map old layers that are not used anymore
    for (index = 0; index < oldBasemaps.length; index++) {
      oldBM = oldBasemaps[index];
      newBM = this.findInList(newBasemaps, oldBM);

      if (!newBM) {
        const layer: any = this.getBasemapLayer(oldBM);
        layer.removeFrom(this.map);
      }
    }
  }

  private getBasemapLayer(basemap: DnvBasemap): any {
    const key = basemap.url;
    let layer = this.basemaps.get(key);

    if (!layer) {
      layer = L.esri.tiledMapLayer({
        url: basemap.url,
        minZoom: this.minZoom,
        maxZoom: this.maxZoom,
        opacity: basemap.opacity
      });
      this.basemaps.set(key, layer);
    }

    return layer;
  }

  private attachFeatureLayersLabelHandlers(
    layer: any,
    propertyLabel: string
  ): void {
    // Problem with https://github.com/Esri/esri-leaflet/blob/master/src/Layers/FeatureLayer/FeatureLayer.js
    // As cellLeave calls removeLayers which dispatch removefeature before calling map.removeLayer
    // but cellEnter calls addLayers which *does not dispatch addfeature* (anymore) after calling map.addLayer
    // so when panning around, the labels disappear and don't come back.

    const handlerCallback = e => {
      const id = e.feature.id;
      const label = this.getFeaturePropertyLabel(
        id,
        layer,
        '<div style="color: blue;background-color: yellow;width: 50px;text-align: center;' +
        'border-width: 1px;border-style: solid;border-color: blue;font-size: 14px;">' +
        e.feature.properties[propertyLabel] +
        '</div>'
      );

      label.addTo(this.map);
    };

    layer.off();
    layer.on('createfeature', handlerCallback);
    layer.on('addfeature', handlerCallback);
  }

  private updateFeatureLayers(
    oldFeatureLayers: DnvFeatureLayer[],
    newFeatureLayers: DnvFeatureLayer[]
  ): void {
    let oldFL: any, newFL: any;
    let index = 0;
    const handlerCallback = e => {
      const label: Marker = this.markers.get(e.feature.id);
      if (label) {
        this.map.removeLayer(label);
      }
    };

    // Add new
    for (; index < newFeatureLayers.length; index++) {
      newFL = newFeatureLayers[index];
      const layer: any = this.getFeatureLayer(newFL, this.layerState);

      if (newFL.propertyLabel) {
        // https://esri.github.io/esri-leaflet/examples/labeling-features.html
        this.attachFeatureLayersLabelHandlers(layer, newFL.propertyLabel);
      }

      layer.addTo(this.map); // if (this._layers[id]) { return this; } addTo just returns if the layer is already added to the map

      // add listener to each marker on layer
      layer
        .off('click') // specifically remove 'click' event so it doesn't break 'preplans' layer
        .on(
          'click',
          function (event) {
            // Remove 'selected' from selected feature css class

            // icons
            this.map.eachLayer(function (lyr) {
              if (lyr._icon && lyr._icon.className.indexOf('selected') > -1) {
                L.DomUtil.removeClass(lyr._icon, 'selected');
              }
            });

            // paths
            this.map.eachLayer(function (lyr) {
              if (
                lyr._path &&
                lyr._path.className.baseVal.indexOf('selected') > -1
              ) {
                L.DomUtil.removeClass(lyr._path, 'selected');
              }
            });

            const kvObj = this.extractFeatureProperties(
              event.layer.feature.properties,
              event.layer.options.url
            );

            if (this._mapState.featureClick) {
              this.mapUpdate.emit(new SelectFeature(kvObj));
              // get assetId
              const url = event.layer.options.url;
              const objectId = event.layer.feature.properties.OBJECTID;
              let assetKey = '';
              for (const prop in event.layer.feature.properties) {
                if (event.layer.feature.properties.hasOwnProperty(prop)) {
                  if (prop.toLowerCase().indexOf('asset') > -1) {
                    assetKey = prop;
                  }
                }
              }
              const assetId = event.layer.feature.properties[assetKey];
              const features = kvObj;

              // get assetId from selectedfeature
              let selectedAssetId = '';
              if (this._mapState.selectedFeature) {
                for (
                  let i = 0;
                  i < this._mapState.selectedFeature.length;
                  i++
                ) {
                  if (this._mapState.selectedFeature[i][0] === assetKey) {
                    // use assetID because objectId excluded from display
                    selectedAssetId = this._mapState.selectedFeature[i][1];
                  }
                }
              }
              const allowInspections = this.getValueBykey(
                url,
                'allow_inspections'
              );
              const writeUrl = this.getWriteUrl(url);
              this.mapUpdate.emit(
                new SetSelectedFeatureLayer({
                  url: url,
                  allow_inspections: allowInspections,
                  writeUrl: writeUrl
                })
              );

              let stationId = 0;
              if (event.layer.feature.properties['Station_Id']) {
                stationId = event.layer.feature.properties['Station_Id'];
              }
              let selectedSationId = 0;
              if (this._mapState.selectedFeature) {
                const featureArray = this._mapState.selectedFeature;
                for (let i = 0; i < featureArray.length; i++) {
                  if (featureArray[i][0] === 'Station_Id') {
                    selectedSationId = featureArray[i][1];
                  }
                }
              }

              // problem if assetId undefined, so comparing all feature attributes
              // if hydrometric station, check stationId because flow info gets added to mapState.selectedFeature
              // but not event.layer.feature.properties
              // toggles feature selection
              if (
                JSON.stringify(features) ===
                JSON.stringify(this._mapState.selectedFeature)
              ) {
                this.mapUpdate.emit(new SelectFeature(null));
                this.featureClicked = true;
              } else if (selectedSationId > 0 && stationId > 0) {
                if (selectedSationId === stationId) {
                  this.mapUpdate.emit(new SelectFeature(null));
                }
              } else {
                if (event.layer._path) {
                  this.mapUpdate.emit(
                    new SetFeatureClickedType(FeatureClickType.Path)
                  );
                  this.mapUpdate.emit(new SetSurroundingFeatureList(null));
                  this.featureClicked = true;
                } else if (event.layer._icon) {
                  this.mapUpdate.emit(
                    new SetFeatureClickedType(FeatureClickType.Icon)
                  );
                  this.mapUpdate.emit(new SetSurroundingFeatureList(null));
                } else {
                  this.mapUpdate.emit(
                    new SetFeatureClickedType(FeatureClickType.Map)
                  );
                }
                this.mapUpdate.emit(
                  new FeatureClicked({
                    url: url,
                    objectId: objectId,
                    assetId: assetId,
                    excludeFeatureInfo: this._mapState.excludeFeatureInfo
                  })
                );
              }

              // only emit if allowInspections = true and not same asset
              if (allowInspections && selectedAssetId !== assetId) {
                if (this._mapState.featureClick) {
                  this.mapUpdate.emit(
                    new CheckInspection({
                      url: url,
                      objectId: objectId,
                      excludes: this._mapState.excludeFeatureInfo
                    })
                  );
                }

                // get/set inspection fields
                const fields = this.getInspectionFields(
                  event.layer.options.url
                );
                this.mapUpdate.emit(new SetInspFields(fields));
              } else {
                this.mapUpdate.emit(new ResetSelected(null));
              }

              if (event.layer._icon || event.layer._path) {
                this.mapUpdate.emit(
                  new SetHighlightFeature({
                    url: url.substring(0, url.length - 1) + '1=1',
                    objectId: objectId
                  })
                );
              }
            } else {
              const imageMapDisplay: string =
                this.map.getSize().x + ',' + this.map.getSize().y;
              const bound = this.map.getBounds();
              const mapBound: DnvBounds = {
                northWestBound: bound.getNorthWest() as DnvLatLng,
                southEastBound: bound.getSouthEast() as DnvLatLng
              };
              const latlng = event.latlng as DnvLatLng;
              const mapInfo: DnvMapInfo = {
                latlng: latlng,
                mapSizeInPixel: imageMapDisplay,
                mapBounds: mapBound
              };
              this.mapClick.emit(mapInfo);
            }
          }.bind(this)
        );

      this.map.getPane(this.featureLayerKey(newFL)).style.opacity =
        newFL.opacity;
    }

    // Remove old
    for (index = 0; index < oldFeatureLayers.length; index++) {
      oldFL = oldFeatureLayers[index];
      newFL = this.findFeatureLayerInList(newFeatureLayers, oldFL);

      if (!newFL) {
        // Attaching and detaching the handler here is to work around the cellLeave/cellEnter bug described below.
        const layer: any = this.getFeatureLayer(oldFL, this.layerState);
        if (oldFL.propertyLabel) {
          layer.off();
          layer.on('removefeature', handlerCallback);
        }
        layer.removeFrom(this.map);
        layer.off();
      }
    }

    this.reorderFeatureLayers(newFeatureLayers);
  }

  // compare new & old drawn shapes
  private updateFeatures(
    oldFeatures: DnvDrawnShapes[],
    newFeatures: DnvDrawnShapes[]
  ): void {
    // make sure not initial load, which will delete shape(s)
    oldFeatures.forEach(oldFeature => {
      const aFeature = newFeatures.filter(
        nf => nf.shapeId === oldFeature.shapeId
      );
      if (aFeature.length === 0) {
        // find layer on map and delete
        const l = this.map._layers[oldFeature.leafletId];
        if (l) {
          this.map.removeLayer(l);
        }
      }
    });
  }

  private doPanning(checkMarker) {
    let targetY = 0;
    let targetX = 0;
    const hSpace = Number(checkMarker.hSpace);
    const vSpace = Number(checkMarker.vSpace);
    const panDir = checkMarker.direction;

    if (hSpace !== 0 || vSpace !== 0) {
      const mapBounds = this.map.getPixelBounds();
      const currentMarkerPos = this.map.project(
        checkMarker.latlng,
        this.map.getZoom()
      );

      // calculate desired marker position
      let xDist = 0;
      let yDist = 0;
      if (checkMarker.unit === 'percentage') {
        xDist = (mapBounds.max.x - mapBounds.min.x) * (1 - (hSpace / 100)) / 2;
        yDist = (mapBounds.max.y - mapBounds.min.y) * (1 - (vSpace / 100)) / 2;
      } else {
        xDist = (mapBounds.max.x - mapBounds.min.x - hSpace) / 2;
        yDist = (mapBounds.max.y - mapBounds.min.y - vSpace) / 2;
      }

      // marker needs to be on right side of map
      if (panDir.indexOf('right') > -1) {
        if (currentMarkerPos.x < mapBounds.max.x - xDist) {
          targetX = currentMarkerPos.x - (mapBounds.max.x - xDist);
        }
      } else if (panDir.indexOf('left') > -1) {
        // marker needs to be on left side of map
        if (currentMarkerPos.x > mapBounds.min.x + xDist) {
          targetX = currentMarkerPos.x - (mapBounds.min.x + xDist);
        }
      }

      // marker needs to be near top of map
      if (panDir.indexOf('top') > -1) {
        if (currentMarkerPos.y > mapBounds.min.y + yDist) {
          targetY = currentMarkerPos.y - (mapBounds.min.y + yDist);
        }
      } else if (panDir.indexOf('bottom') > -1) {
        // marker needs to be near bottom of map
        if (currentMarkerPos.y < mapBounds.max.y - yDist) {
          targetY = currentMarkerPos.y - (mapBounds.max.y - yDist);
        }
      }

      this.map.panBy([targetX, targetY]);
      // reset so it doesn't execute every time updateMapState fires
      this.mapUpdate.emit(
        new CheckMarkerPosition(null)
      );
    }
  }

  private reorderFeatureLayers(featureLayers: DnvFeatureLayer[]): void {
    // item at top of the list (index = 0) supposed to be uppermost layer of map (ie closest to user)
    for (let index = 0; index < featureLayers.length; index++) {
      const layer = featureLayers[index];
      const pane = this.map.getPane(this.featureLayerKey(layer));
      this.map.getPane(this.featureLayerKey(layer)).style.zIndex =
        400 + featureLayers.length - index;
    }
  }

  private extractFeatureProperties(fprops: any, url: string) {
    const metaDictionary = this.getFeatureLayerMeta(url);
    const arr: Array<[string, string]> = [];
    const objID = 0;
    let lookupField = {};
    let keyLabel = '';
    for (const prop in fprops) {
      if (fprops.hasOwnProperty(prop)) {
        lookupField = metaDictionary.filter(a => a.name === prop);
        if (lookupField[0]) {
          keyLabel = lookupField[0].alias;
        } else {
          keyLabel = prop;
        }
        if (prop.toLowerCase().indexOf('date') > -1) {
          if (fprops[prop] && fprops[prop].toString().length > 4) {
            const convertedDate = new Date(fprops[prop]);
            arr.push([keyLabel, convertedDate.toString()]);
          } else {
            // date value but only year

            arr.push([keyLabel, fprops[prop]]);
          }
        } else {
          // not date value
          arr.push([keyLabel, fprops[prop]]);
        }
      }
    }

    return arr;
  }

  private getFeatureLayerMeta(url) {
    let meta = [];
    this.layerState.layers.forEach(layer => {
      layer.featureLayers.forEach(featureLayer => {
        if (url.indexOf(featureLayer.url) > -1) {
          meta = layer.meta;
        }
      });
    });
    return meta;
  }

  // retrieves table meta data from layerState
  private getInspectionFields(url) {
    let meta = [];
    this.layerState.layers.forEach(layer => {
      if (layer.tableLayers.length > 0) {
        layer.featureLayers.forEach(featureLayer => {
          if (url.indexOf(featureLayer.url) > -1) {
            meta = layer.tableLayers[0].tableMeta;
          }
        });
      }
    });
    return meta;
  }

  private getFeaturePropertyLabel(
    id: string,
    esriFeatureLayer: any,
    html: string
  ): any {
    let label: Marker = this.markers.get(id);
    if (!label) {
      const feature = esriFeatureLayer.getFeature(id);
      const center = feature.getBounds().getCenter();
      label = L.marker(center, {
        icon: L.divIcon({
          iconSize: [20, 18], // For a 3 character string label.
          className: 'label',
          html: html
        })
      });
      this.markers.set(id, label);
    }
    return label;
  }

  private featureLayerKey(featureLayer: DnvFeatureLayer): string {
    return featureLayer.url + featureLayer.whereClause;
  }

  private getFeatureLayer(
    featureLayer: DnvFeatureLayer,
    lyrState: LayerState
  ): any {
    const key = this.featureLayerKey(featureLayer);
    let layer = this.featureLayers.get(key);

    if (!layer) {
      // https://github.com/Esri/esri-leaflet/issues/747 Opacity
      const pane = this.map.createPane(key);
      pane.style.opacity = featureLayer.opacity;

      if (featureLayer.type && featureLayer.type === 'Raster') {
        const r = new RegExp('^(.*/MapServer)/(\\d+)$');
        const m = r.exec(featureLayer.url);
        const mapLayerURL = m[1];
        const layerNum = m[2];
        layer = L.esri.dynamicMapLayer({
          url: mapLayerURL,
          f: 'image',
          layers: [layerNum],
          pane: key
        });
      } else {
        // if (featureLayer.type === 'Feature') <- make Feature default
        // check if featureLayer is in layerState.layersDrawingInfo, ie icon layer
        const isMarkersLayer = this.layerState.layersDrawingInfo.filter(
          m => m.url.indexOf(featureLayer.url) > -1
        );

        if (isMarkersLayer.length > 0) {
          // markers layers, meant to cluster
          layer = L.esri.featureLayer({
            url: featureLayer.url,
            where: featureLayer.whereClause, // "LastEditor IN ('SDE_MARUTA') AND Primary_Use IN ('MULTI-USE')",
            pane: key,
            isModern: false // This is to force the addin to make queries to ArcGIS in json format and not
            // in geojson as these sometimes fail...
          });
        } else {
          layer = L.esri.featureLayer({
            url: featureLayer.url,
            where: featureLayer.whereClause, // "LastEditor IN ('SDE_MARUTA') AND Primary_Use IN ('MULTI-USE')",
            pane: key,
            isModern: false // This is to force the addin to make queries to ArcGIS in json format and not
            // in geojson as these sometimes fail...
          });
        }
      }

      this.featureLayers.set(key, layer);
    }

    return layer;
  }

  private updateGeoJsonLayers(
    oldGeoJsonLayers: DnvGeoJsonLayer[],
    newGeoJsonLayers: DnvGeoJsonLayer[]
  ): void {
    let oldFL: any, newFL: any;
    let index = 0;

    // Add new
    for (; index < newGeoJsonLayers.length; index++) {
      newFL = newGeoJsonLayers[index];
      oldFL = this.findInList(oldGeoJsonLayers, newFL);

      const layer: any = this.getGeoJsonLayers(newFL);
      layer.addTo(this.map); // if (this._layers[id]) { return this; } addTo just returns if the layer is already added to the map
    }

    // Remove old
    for (index = 0; index < oldGeoJsonLayers.length; index++) {
      oldFL = oldGeoJsonLayers[index];
      newFL = this.findInList(newGeoJsonLayers, oldFL);

      if (!newFL) {
        const layer: any = this.getGeoJsonLayers(oldFL);
        layer.removeFrom(this.map);
      }
    }
  }

  private getGeoJsonLayers(geoJsonLayer: DnvGeoJsonLayer): any {
    const key = geoJsonLayer.url;
    let layer = this.geoJsonLayers.get(key);

    if (!layer) {
      if (geoJsonLayer.style) {
        layer = L.geoJSON(geoJsonLayer.json, {
          style: geoJsonLayer.style
        });
      } else {
        layer = L.geoJSON(geoJsonLayer.json);
      }

      this.geoJsonLayers.set(key, layer);
    }

    return layer;
  }

  private zoomToGeoJsonUrl(oldGeoJsonUrl: string, newGeoJsonUrl: string): void {
    if (oldGeoJsonUrl !== newGeoJsonUrl) {
      const layer = this.geoJsonLayers.get(newGeoJsonUrl);
      if (layer) {
        const bounds = layer.getBounds();
        // console.log('DEBUG zoomToGeoJsonUrl: ', bounds);

        if (bounds.isValid()) {
          // Make sure that the bounds are valid before trying to zoom to it
          this.map.fitBounds(bounds);
        }
      }
    }
  }

  private leafletLatLngBoundsToDnvBounds(bound: LatLngBounds): DnvBounds {
    return {
      northWestBound: bound.getNorthWest() as DnvLatLng,
      southEastBound: bound.getSouthEast() as DnvLatLng
    };
  }

  private zoomToBound(bound: any = null, features: DnvFeatureLayer[]): void {
    if (features.length > 0) {
      const head: DnvFeatureLayer = features[0];
      let tail: DnvFeatureLayer[] = [];
      if (features.length > 1) {
        tail = [...features.slice(1)];
      }
      const layer = this.getFeatureLayer(head, this.layerState);

      let whereClause = '1=1'; // The default whereClause
      if (layer.options && layer.options.where) {
        whereClause = layer.options.where;
      }

      layer
        .query()
        .where(whereClause)
        .bounds((error, latlngbounds) => {
          if (!error) {
            if (bound) {
              bound.extend(latlngbounds);
            } else {
              bound = latlngbounds;
            }
          }

          this.zoomToBound(bound, tail);
        });
    } else {
      // Zoom to the specified bounds only if they are contained within the max boundaries
      // otherwise, zoom to the maxBounds
      if (bound && this.map.options.maxBounds.contains(bound)) {
        this.mapUpdate.emit(
          new FitBounds(this.leafletLatLngBoundsToDnvBounds(bound))
        );
      } else {
        this.mapUpdate.emit(
          new FitBounds(
            this.leafletLatLngBoundsToDnvBounds(this.map.options.maxBounds)
          )
        );
      }

      this.mapUpdate.emit(new ZoomToFeatures(null));
    }
  }

  private zoomToFeatures(
    oldZoomToFeatures: DnvFeatureLayer[],
    newZoomToFeatures: DnvFeatureLayer[]
  ): void {
    if (newZoomToFeatures) {
      this.zoomToBound(null, newZoomToFeatures);
    }
  }

  private updateMarkers(
    oldMarkers: DnvMarker[],
    newMarkers: DnvMarker[]
  ): void {
    let oldM: any, newM: any;
    let index = 0;
    let marker: any;

    // Add new
    for (; index < newMarkers.length; index++) {
      marker = null;
      newM = newMarkers[index];
      oldM = this.findInList(oldMarkers, newM);

      marker = this.getMarker(newM);
      marker.addTo(this.map); // if (this._layers[id]) { return this; } addTo just returns if the marker is already added to the map
      // For some unknown reason, there are situations when oldM is not null but the marker has not been added to the map.
      // The above should prevent this situation from occuring.

      marker.off('click');

      // set icon based on isActive
      if (newM.isActive) {
        if (newM.activeIcon) {
          const thisIcon = new L.Icon(newM.activeIcon);
          marker.setIcon(thisIcon);
        }
      } else {
        if (newM.icon) {
          const thatIcon = new L.Icon(newM.icon);
          marker.setIcon(thatIcon);
        }
      }

      if (newM.clickEvent) {
        marker.on(
          'click',
          function (event) {
            if (event.target.options.id) {
              this.mapUpdate.emit(new MarkerClick(event.target.options.id));
            }
          }.bind(this)
        );
      }

      if (!oldM) {
        if (newM.popup && newM.popup.length > 0) {
          this.bindPopup(marker, newM);
        }
        if (newM.zIndexOffset !== undefined) {
          // Need to check against undefined because a valid offset 0 is falsy
          marker.setZIndexOffset(newM.zIndexOffset);
        }

        if (newM.tooltip) {
          marker.bindTooltip(newM.tooltip, newM.tooltipOptions).openTooltip();
        }
      } else {
        if (oldM.tooltip) {
          marker.bindTooltip(oldM.tooltip, oldM.tooltipOptions).openTooltip();
        }
        if (
          !(
            oldM.centerPoint.lat === newM.centerPoint.lat &&
            oldM.centerPoint.lng === newM.centerPoint.lng
          )
        ) {
          marker.setLatLng(newM.centerPoint);
        }

        if (newM.popup) {
          if (oldM.popup !== newM.popup) {
            if (newM.popup.length > 0) {
              this.bindPopup(marker, newM);
            }
          }
        } else {
          if (oldM.popup && oldM.popup.length > 0) {
            this.unbindPopup(marker);
          }
        }

        if (newM.zIndexOffset !== undefined) {
          // See above
          if (oldM.zIndexOffset !== newM.zIndexOffset) {
            marker.setZIndexOffset(newM.zIndexOffset);
          }
        }
      }
    }

    // Remove old
    for (index = 0; index < oldMarkers.length; index++) {
      oldM = oldMarkers[index];
      newM = this.findInList(newMarkers, oldM);

      if (!newM) {
        marker = this.getMarker(oldM);
        if (oldM.popup && oldM.popup.length > 0) {
          this.unbindPopup(marker);
        }
        marker.removeFrom(this.map);
        this.deleteMarker(oldM);
      }
    }
  }

  private markerMouseoverHandler: Function = function () {
    this.openPopup();
  };
  private markerMouseoutHandler: Function = function () {
    this.closePopup();
  };

  private bindPopup(marker: any, dnvMarker: DnvMarker): void {
    marker.off('mouseover', this.markerMouseoverHandler);
    marker.off('mouseout', this.markerMouseoutHandler);
    marker.bindPopup(dnvMarker.popup, dnvMarker.popupOptions || {});
    marker.on('mouseover', this.markerMouseoverHandler);
    marker.on('mouseout', this.markerMouseoutHandler);
  }
  private unbindPopup(marker: any): void {
    marker.off('mouseover', this.markerMouseoverHandler);
    marker.off('mouseout', this.markerMouseoutHandler);
    marker.closePopup();
    marker.unbindPopup();
  }

  private getMarker(dnvMarker: DnvMarker): any {
    const key = dnvMarker.url;
    let marker: Marker = this.markers.get(key);

    if (!marker) {
      if (dnvMarker.svgIcon) {
        marker = new L.marker.svgMarker(
          dnvMarker.centerPoint,
          dnvMarker.svgIcon
        );
      } else if (dnvMarker.icon) {
        const icon = L.icon(dnvMarker.icon);
        if (dnvMarker.id && dnvMarker.id.length > 0) {
          marker = L.marker(dnvMarker.centerPoint, {
            icon: icon,
            id: dnvMarker.id,
            alt: dnvMarker.id
          });
        } else {
          marker = L.marker(dnvMarker.centerPoint, { icon: icon });
        }
      } else {
        if (dnvMarker.id && dnvMarker.id.length > 0) {
          marker = L.marker(dnvMarker.centerPoint, {
            id: dnvMarker.id,
            alt: dnvMarker.id
          });
        } else {
          marker = L.marker(dnvMarker.centerPoint);
        }
      }

      this.markers.set(key, marker);
    }

    return marker;
  }

  private deleteMarker(marker: DnvMarker): void {
    const key = marker.url;
    this.markers.delete(key);
  }

  // Find based on a match of the url only
  private findInList(list: any[], item: any): any | null {
    for (let index = 0; index < list.length; index++) {
      if (list[index].url === item.url) {
        return list[index];
      }
    }
    return null;
  }
  private findFeatureLayerInList(
    list: DnvFeatureLayer[],
    item: DnvFeatureLayer
  ): DnvFeatureLayer | null {
    for (let index = 0; index < list.length; index++) {
      if (this.featureLayerKey(list[index]) === this.featureLayerKey(item)) {
        return list[index];
      }
    }
    return null;
  }

  private updateShowDrawControl(showDrawControl: boolean): void {
    if (showDrawControl) {
      // create a feature group for Leaflet Draw to hook into for delete functionality
      this.drawnItems = L.featureGroup();
      this.map.addLayer(this.drawnItems);
      if (!this.map.drawControl) {
        this.createDrawControl();
      }
    } else {
      if (!!this.map.drawControl) {
        this.map.drawControl.remove();
        this.map.drawControl = undefined;
      }
    }
  }

  private createDrawControl() {
    const customMarker = L.divIcon({ className: 'measure-marker-icon' });
    this.map.drawControl = new L.Control.Draw({
      position: 'bottomleft',
      edit: {
        featureGroup: this.drawnItems,
        remove: false,
        edit: false
      },
      draw: {
        circle: false,
        polyline: {
          shapeOptions: {
            color: '#FF8300'
          }
        },
        polygon: {
          shapeOptions: {
            color: '#FF8300'
          }
        },
        circlemarker: false,
        marker: {
          icon: customMarker
        },
        rectangle: false
      }
    });

    this.map.drawControl.addTo(this.map);
  }

  private updateShowZoomControl(showZoomControl: boolean): void {
    if (showZoomControl) {
      if (!this.map.zoomControl) {
        this.map.zoomControl = new L.Control.Zoom({ position: 'topleft' });
        this.map.zoomControl.addTo(this.map);
      }
    } else {
      if (!!this.map.zoomControl) {
        this.map.zoomControl.remove();
        this.map.zoomControl = undefined;
      }
    }
  }

  private requestFitBounds(fitBounds: DnvBounds) {
    if (fitBounds) {
      const bounds = L.latLngBounds(
        fitBounds.northWestBound,
        fitBounds.southEastBound
      );
      if (bounds.isValid()) {
        // Make sure that the bounds are valid before trying to zoom to it
        // const padding = L.point(0, 0); // , {paddingBottomRight: padding} <- with x=350 the map component misbehave around 1000px
        this.map.fitBounds(bounds);
      }

      this.mapUpdate.emit(new FitBounds(null));

      // Fix for the FitBounds bug zooming all the way in when the window size is too small
      // If the requested bounds require more pixel real-estate than available, zoom all the way out.
      const availableMapSize: DnvPoint = this.map.getSize();
      const minRequiredBoundsSize: DnvPoint = L.bounds(
        this.map.project(fitBounds.southEastBound, 0),
        this.map.project(fitBounds.northWestBound, 0)
      ).getSize();

      if (
        minRequiredBoundsSize.x > availableMapSize.x ||
        minRequiredBoundsSize.y > availableMapSize.y
      ) {
        this.mapUpdate.emit(new SetZoom(0));
      }
    }
  }

  private updateDrawnShapes(newShapeLayer: any): void {
    this.mapUpdate.emit(new EditShapes(newShapeLayer));
  }

  private updatePopupContent(newShapes: DnvDrawnShapes[]): void {
    if (this.drawnItems) {
      this.drawnItems.eachLayer(function (layer) {
        const newShape = newShapes.filter(
          obj => obj.leafletId === layer._leaflet_id
        );
        if (newShape.length > 0) {
          if (newShape[0].properties.note !== layer._popup._content) {
            layer._popup.setContent(newShape[0].properties.note);
          }
        }
      });
    }
  }

  private triggerDrawEvents(shape): void {
    if (shape) {
      switch (shape.shape) {
        case 'polygon':
          if (this.drawCtrl) {
            this.drawCtrl.disable();
          }
          this.drawCtrl = new L.Draw.Polygon(this.map, {
            allowIntersection: false, // polygons cannot intersect thenselves
            drawError: {
              color: 'red', // color the shape will turn when intersects
              message: '<strong>Oh snap!<strong> you can\'t draw that!' // message that will show when intersect
            },
            shapeOptions: {
              color: '#FF8300'
            },
            showArea: true,
            showLength: true
          });
          this.drawCtrl.enable();
          break;
        case 'line':
          if (this.drawCtrl) {
            this.drawCtrl.disable();
          }
          this.drawCtrl = new L.Draw.Polyline(this.map, {
            shapeOptions: {
              color: '#FF8300'
            }
          });
          this.drawCtrl.enable();
          break;
        case 'circle':
          if (this.drawCtrl) {
            this.drawCtrl.disable();
          }
          this.drawCtrl = new L.Draw.Circle(this.map, {
            shapeOptions: {
              color: '#FF8300'
            }
          });
          this.drawCtrl.enable();
          break;
        case 'circlemarker':
          if (this.drawCtrl) {
            this.drawCtrl.disable();
          }
          this.drawCtrl = new L.Draw.CircleMarker(this.map, {
            color: '#FF8300'
          });
          this.drawCtrl.enable();
          break;
        case 'rectangle':
          if (this.drawCtrl) {
            this.drawCtrl.disable();
          }
          this.drawCtrl = new L.Draw.Rectangle(this.map, {
            shapeOptions: {
              color: '#FF8300'
            }
          });
          this.drawCtrl.enable();
          break;
        case 'marker':
          if (this.drawCtrl) {
            this.drawCtrl.disable();
          }
          const customMarker = L.divIcon({ className: 'measure-marker-icon' });
          this.drawCtrl = new L.Draw.Marker(this.map, { icon: customMarker });
          this.drawCtrl.enable();
          break;
        case 'edit':
          this.editCtrl = new L.EditToolbar.Edit(this.map, {
            featureGroup: this.drawnItems,
            selectedPathOptions: {}
          });
          this.editCtrl.enable();
          break;
        case 'stopedit':
          if (this.editCtrl) {
            this.editCtrl.revertLayers();
            this.editCtrl.disable();
          }
          break;
        case 'saveedit':
          if (this.editCtrl) {
            this.editCtrl.save();
            this.editCtrl.disable();
          }
          break;
        case 'delete':
          this.delCtrl = new L.EditToolbar.Delete(this.map, {
            featureGroup: this.drawnItems,
            selectedPathOptions: {}
          });
          this.delCtrl.enable();
          break;
        case 'canceldelete':
          if (this.delCtrl) {
            this.delCtrl.revertLayers();
            this.delCtrl.disable();
          }
          break;
        case 'savedelete':
          if (this.delCtrl) {
            this.delCtrl.save();
            this.delCtrl.disable();
          }
          break;
        case 'deleteAll':
          this.delCtrl = new L.EditToolbar.Delete(this.map, {
            featureGroup: this.drawnItems
          });
          this.delCtrl.enable();
          this.delCtrl.removeAllLayers();
          this.delCtrl.save();
          this.delCtrl.disable();
          break;
        default:
          if (this.drawCtrl) {
            this.drawCtrl.disable();
          }
          break;
      }
    }
  }

  // load saved shapes to map
  private updateSavedShapes(newShapes: any): void {

    const defaultStyle = {
      color: '#FF8300',
      weight: 4,
      opacity: 0.5
    };

    const layerGroup = L.geoJSON(newShapes, {
      onEachFeature: function (feature, layer) {
        // only draw on map if there's no leafletId, ie previously saved shapes
        if (!feature.leafletId) {
          // get measurements
          this.drawnItems.addLayer(layer);
          const measurements = this.measureShapes(layer);
          this.addPopup(
            layer,
            measurements,
            layer.feature.isLatLng || false,
            layer.feature.isMetric || false
          );

          let measuredValues = {};
          if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
            measuredValues = {
              isMarker: false,
              isMetric: layer.feature.isMetric,
              distance: measurements.distance,
              area: measurements.area === 0.0 ? null : measurements.area,
              guid: feature.shapeId,
              leafletId: layer._leaflet_id
            };
            this.markersArr.push(measuredValues);
          } else {
            measuredValues = {
              isMarker: true,
              isLatLng: layer.feature.isLatLng,
              latlng: [layer._latlng.lng, layer._latlng.lat],
              guid: feature.shapeId,
              leafletId: layer._leaflet_id
            };
            this.markersArr.push(measuredValues);
            // marker
            if (layer instanceof L.Marker) {
              // enable editing, ie user can move it around
              layer.dragging.enable();
            }
          }

          feature.leafletId = layer._leaflet_id;
          // set radius if circle
          if (feature.geometry.radius > 0) {
            layer.setRadius(feature.geometry.radius);
          }
          layer.on(
            'click',
            function (e) {
              // click action, shapes not being edited
              if (!this.editShapes) {
                this.mapUpdate.emit(new ToggleSelectShape(layer._leaflet_id));
              }
            }.bind(this)
          );

          layer.on('editdrag', (event: any) => {
            const thisLayer = event.target;
            const component = thisLayer.componentInstance;

            let area = 0;
            let distance = 0;
            let distanceDisplay = '';
            let areaDisplay = '';
            // calculate area & perimeter for polygon
            if (
              thisLayer instanceof L.Polygon ||
              thisLayer instanceof L.Rectangle
            ) {
              // calculate perimeter
              for (let i = 0; i < thisLayer._latlngs[0].length - 1; i++) {
                distance =
                  distance +
                  thisLayer._latlngs[0][i].distanceTo(
                    thisLayer._latlngs[0][i + 1]
                  );
              }

              // calculate area
              area = L.GeometryUtil.geodesicArea(thisLayer.getLatLngs()[0]);

              if (!thisLayer.feature.isMetric) {
                thisLayer.feature.isMetric = true;
              }
              if (thisLayer.feature.isMetric === false) {
                distanceDisplay = L.GeometryUtil.readableDistance(
                  distance,
                  false,
                  true,
                  false,
                  {
                    ft: 2
                  }
                );

                areaDisplay = L.GeometryUtil.readableArea(area, false, {
                  ft: 2
                });
              } else {
                distanceDisplay = L.GeometryUtil.readableDistance(
                  distance,
                  true,
                  false,
                  false,
                  { km: 2, m: 2 }
                );

                areaDisplay = L.GeometryUtil.readableArea(area, true, { m: 2 });
              }

              component.instance.data = Object.assign(
                {},
                component.instance.data,
                {
                  distance: distanceDisplay,
                  area: areaDisplay,
                  isMetric: thisLayer.feature.isMetric
                }
              );

              // update marker
              thisLayer.distance = distance;
              thisLayer.area = area;
            } else if (
              thisLayer instanceof L.Polyline &&
              !(
                layer instanceof L.Polygon &&
                !(thisLayer instanceof L.Rectangle)
              )
            ) {
              for (let i = 0; i < thisLayer._latlngs.length - 1; i++) {
                distance =
                  distance +
                  thisLayer._latlngs[i].distanceTo(thisLayer._latlngs[i + 1]);
              }

              if (thisLayer.feature.isMetric) {
                distanceDisplay = L.GeometryUtil.readableDistance(
                  distance,
                  false,
                  true,
                  false,
                  {
                    ft: 2
                  }
                );
              } else {
                distanceDisplay = L.GeometryUtil.readableDistance(
                  distance,
                  true,
                  false,
                  false,
                  { km: 2, m: 2 }
                );
              }
              component.instance.data = Object.assign(
                {},
                component.instance.data,
                {
                  distance: distanceDisplay,
                  area: null,
                  isMetric: thisLayer.feature.isMetric
                }
              );

              // update marker
              thisLayer.feature.distance = distance;
            }

            component.changeDetectorRef.detectChanges();
          });

          // dragging marker around (loaded shapes)
          layer.on(
            'drag',
            ((event: any) => {
              const thisLayer = event.target;
              const component = layer.componentInstance;
              if (thisLayer instanceof L.Marker) {

                const feat = this._mapState.features.filter(
                  l => l.leafletId === thisLayer.feature.leafletId
                );
                if (feat && feat[0].isLatLng === true) {
                  // show lat lng
                  component.instance.data = Object.assign(
                    {},
                    component.instance.data,
                    { latlng: layer._latlng, isLatLng: true }
                  );
                } else {
                  // show x/y
                  const convertedPoint = convertToXY(layer._latlng);

                  component.instance.data = Object.assign(
                    {},
                    component.instance.data,
                    {
                      x: convertedPoint[0],
                      y: convertedPoint[1],
                      isLatLng: feat[0].isLatLng,
                      latlng: layer._latlng
                    }
                  );

                  // update marker
                  thisLayer.feature.latlng = layer._latlng;
                  thisLayer.feature.isLatLng = feat[0].isLatLng;

                }
                layer.openPopup();
              }
              component.changeDetectorRef.detectChanges();
            }).bind(this)
          );

          // finished editing shape
          layer.on(
            'edit',
            ((event: any) => {
              const thisLayer = event.target;
              const geoJsonFeature = thisLayer.toGeoJSON(); // not quite a GeoJSON.Feature...
              // would need to move leafletId, shapeId, etc under properties

              const layerAttr = {
                leafletId: geoJsonFeature.leafletId,
                latlngs: geoJsonFeature.geometry.coordinates,
                shapeId: geoJsonFeature.shapeId
              };

              this.mapUpdate.emit(new UpdateFeature(layerAttr));
              this.mapUpdate.emit(new UpdateShapesList(layerAttr));
            }).bind(this)
          );

          // finished dragging around marker
          layer.on(
            'dragend',
            ((event: any) => {
              const thisLayer = event.target;
              const ll = {
                lng: thisLayer._latlng.lng,
                lat: thisLayer._latlng.lat
              };
              const layerAttr = {
                leafletId: thisLayer._leaflet_id,
                latlngs: ll,
                shapeId: thisLayer.feature.shapeId
              };
              this.mapUpdate.emit(new UpdateFeature(layerAttr));
              this.mapUpdate.emit(new UpdateShapesList(layerAttr));
            }).bind(this)
          );
        }
      }.bind(this),
      pointToLayer: function (feature, latlng) {
        if (feature.geometry.type === 'Point' && feature.geometry.radius > 0) {
          return L.circleMarker(latlng);
        } else if (
          feature.geometry.type === 'Point' &&
          feature.geometry.radius === 0
        ) {
          const customIcon = L.divIcon({ className: 'measure-marker-icon' });
          const markerIcon = L.Icon.extend({
            icon: customIcon
          });
          return L.marker(latlng, new markerIcon());
        }
      },
      style: defaultStyle
    });

  }

  private updateSelectedShapes(newFeatures: DnvDrawnShapes[]): void {
    if (this.drawnItems) {
      this.drawnItems.eachLayer(function (layer) {
        newFeatures.forEach(function (feature) {
          if (feature.leafletId === layer._leaflet_id && !layer._icon) {
            if (feature.properties.isSelected) {
              layer.setStyle({ color: this.colorRed });
            }
          }
        });
      });
    }
  }

  constructor(
    public scriptService: ScriptService,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private http: HttpClient
  ) {
    this.stateSubscription = this.stateUpdate
      .pipe(
        distinctUntilChanged()
      )
      .subscribe((value: DnvMapState) => {
        this.updateMapState(value);
      });

    if (this.stateSubscription) {
      ScriptService.script(
        [
          'https://unpkg.com/proj4@2.4.3/dist/proj4-src.js',
          'https://unpkg.com/leaflet@1.3.0/dist/leaflet-src.js'
        ],
        () => {
          ScriptService.script(
            [
              'https://unpkg.com/proj4leaflet@1.0.1/src/proj4leaflet.js',
              'https://unpkg.com/esri-leaflet@2.2.3/dist/esri-leaflet.js'
            ],
            () => {
              ScriptService.script(
                [
                  'https://unpkg.com/esri-leaflet-renderers@2.0.6/dist/esri-leaflet-renderers.js',
                  'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw-src.js',
                  'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.4.1/leaflet.markercluster.js',
                  'https://unpkg.com/esri-leaflet-cluster@2.0.0/dist/esri-leaflet-cluster.js'
                ],
                'mapstuff'
              );
            }
          );
        }
      );
    }
  }

  convertUnits(leafletId: number) {
    // alert(leafletId);
    const marker = this.markersArr.filter(m => m.leafletId === leafletId);
    const layer = this.map._layers[leafletId];
    const component = layer.componentInstance;
    const layerAttr = {};
    // not a marker, ie polygon or polyline
    if (!marker[0].isMarker) {
      let distance = '',
        area = null;
      marker[0].isMetric = !marker[0].isMetric;
      if (marker[0].isMetric) {
        distance = L.GeometryUtil.readableDistance(
          marker[0].distance,
          true,
          false,
          false,
          { km: 2, m: 2 }
        );
        if (marker[0].area) {
          area = L.GeometryUtil.readableArea(marker[0].area, true, { m: 2 });
        }
      } else {
        distance = L.GeometryUtil.readableDistance(
          marker[0].distance,
          false,
          true,
          false,
          {
            ft: 2
          }
        );
        if (marker[0].area) {
          area = L.GeometryUtil.readableArea(marker[0].area, false, { ft: 2 });
        }
      }
      component.instance.data = Object.assign({}, component.instance.data, {
        distance: distance,
        area: area,
        isMetric: marker[0].isMetric
      });

      this.mapUpdate.emit(
        new UpdateConversionUnit({
          leafletId: marker[0].leafletId,
          isMetric: marker[0].isMetric
        })
      );
    } else {
      //  marker
      marker[0].isLatLng = !marker[0].isLatLng;
      if (marker[0].isLatLng) {
        // display latlng
        // component.instance.data = { latlng: marker[0].latlng, isLatLng: marker[0].isLatLng };
        component.instance.data = Object.assign({}, component.instance.data, {
          isLatLng: marker[0].isLatLng
        }); // latlng is already there, so no update // TODO further test this
      } else {
        // convert to XY
        let convertedPoint = [];
        if (marker[0].latlng.lat && marker[0].latlng.lng) {
          convertedPoint = convertToXY(layer._latlng); // new shape
        } else {
          convertedPoint = convertToXY({
            lng: marker[0].latlng[0],
            lat: marker[0].latlng[1]
          }); // loaded shape
        }
        component.instance.data = Object.assign({}, component.instance.data, {
          x: convertedPoint[0],
          y: convertedPoint[1],
          isLatLng: marker[0].isLatLng
        });
      }
      this.mapUpdate.emit(
        new UpdateConversionUnit({
          leafletId: marker[0].leafletId,
          isLatLng: marker[0].isLatLng
        })
      );
    }
    component.changeDetectorRef.detectChanges();
  }

  // add pop up to shapes drawn with measuring tool
  // using dnv-map-popup.component to bind data
  addPopup(
    newMarker: any,
    measurements: any,
    isLatLng: boolean,
    isMetric: boolean
  ) {
    let currentMarker;
    this.map.eachLayer(function (lyr) {
      if (lyr._leaflet_id === newMarker._leaflet_id) {
        currentMarker = lyr;
      }
    });
    const factory = this.resolver.resolveComponentFactory(DnvMapPopupComponent);
    const component = factory.create(this.injector);
    let puClassName = 'popup';
    let distance = 0;
    let area = 0;
    if (newMarker instanceof L.Polyline || newMarker instanceof L.Polygon) {
      if (isMetric) {
        distance = L.GeometryUtil.readableDistance(
          measurements.distance,
          true,
          false,
          false,
          { km: 2, m: 2 }
        );
        if (measurements.area) {
          area = L.GeometryUtil.readableArea(measurements.area, true, { m: 2 });
        }
      } else {
        distance = L.GeometryUtil.readableDistance(
          measurements.distance,
          false,
          true,
          false,
          { ft: 2 }
        );
        if (measurements.area) {
          area = L.GeometryUtil.readableArea(measurements.area, false, {
            ft: 2
          });
        }
      }
      if (
        newMarker instanceof L.Polyline &&
        !(newMarker instanceof L.Polygon)
      ) {
        area = null;
      }
      component.instance.data = {
        isMarker: false,
        isLatLng: false,
        isMetric: isMetric,
        distance: distance,
        area: area,
        leafletId: newMarker._leaflet_id
      };
      if (
        newMarker instanceof L.Polyline &&
        !(newMarker instanceof L.Polygon)
      ) {
        puClassName = 'popup-line';
      }
    } else {
      // marker

      const convertedPoint = convertToXY(newMarker._latlng);

      component.instance.data = {
        isMarker: true,
        isLatLng: isLatLng,
        isMetric: false,
        latlng: newMarker._latlng,
        x: convertedPoint[0],
        y: convertedPoint[1],
        leafletId: newMarker._leaflet_id
      };
      puClassName = 'popup-marker';
    }

    component.changeDetectorRef.detectChanges();

    // subscribe to popup click event to trigger convertUnits()
    component.instance.popupClick.subscribe(p => {
      this.convertUnits(currentMarker._leaflet_id);
    });

    // subcribe to delete shape click event
    component.instance.deleteShapeClick.subscribe(d => {
      this.deleteShape(currentMarker._leaflet_id);
    });

    // subscribe to hide popup click event
    component.instance.hidePopupClick.subscribe(d => {
      this.hidePopup(currentMarker._leaflet_id);
    });

    const popupContent = component.location.nativeElement;
    newMarker
      .bindPopup(popupContent, {
        closeOnClick: false,
        autoClose: false,
        closeButton: false,
        className: puClassName,
        autoPan: false
      })
      .openPopup();
    newMarker.addTo(this.map);

    currentMarker.componentInstance = component;
    return currentMarker;
  }

  hidePopup(id) {
    // hide pop up of leaflet shape with id
    const l = this.map._layers[id];
    l.closePopup();
  }

  deleteShape(id) {
    // find layer on map and delete
    const l = this.map._layers[id];
    if (l) {
      this.map.removeLayer(l);
    }

    // delete from markersArr (data binding for popup)
    for (let i = 0; i < this.markersArr.length; i++) {
      if (this.markersArr[i].leafletId === id) {
        this.markersArr.splice(i, 1);
      }
    }
    // console.log('not deleted: ' + this.markersArr);

    this.mapUpdate.emit(new DeleteFeature(l));
  }

  ngAfterContentInit() {
    ScriptService.ready('mapstuff', () => {
      const bounds = L.latLngBounds(
        this._mapState.northWestBound,
        this._mapState.southEastBound
      );

      const crs = new L.Proj.CRS(
        'EPSG:26910',
        '+proj=utm +zone=10 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
        {
          origin: this._mapState.origin,
          resolutions: this._mapState.resolutions
        }
      );

      if (!this.map) {
        this.map = L.map(this.mapId ? this.mapId : this._mapState.mapId, {
          crs: crs,
          zoomControl: this._mapState.showZoomControl,
          keyboard: true,
          maxZoom: this.maxZoom,
          maxBounds: bounds,
          tap: true
        }).setView(this._mapState.centerPoint, this._mapState.zoomLevel);
      }
      this.updateBasemaps([], this._mapState.basemaps);
      this.updateFeatureLayers([], this._mapState.featureLayers);
      this.updateGeoJsonLayers([], this._mapState.geoJsonLayers);
      this.updateShowDrawControl(this._mapState.showDrawControl);

      //  map event handlers
      this.map.on('click', (event: any) => {
        if (
          (this._mapState.featureClickType !== FeatureClickType.Path &&
            this.featureClicked === false) ||
          (this._mapState.featureClickType === FeatureClickType.Path &&
            this.featureClicked === false)
        ) {
          const imageMapDisplay: string =
            this.map.getSize().x + ',' + this.map.getSize().y;
          const bound: LatLngBounds = this.map.getBounds();
          const mapBound = this.leafletLatLngBoundsToDnvBounds(bound);
          const latlng = event.latlng as DnvLatLng;
          const mapInfo: DnvMapInfo = {
            latlng: latlng,
            mapSizeInPixel: imageMapDisplay,
            mapBounds: mapBound
          };

          this.mapUpdate.emit(new SetFeatureClickedType(2));
          this.mapClick.emit(mapInfo);
        } else {
          this.featureClicked = false;
        }
      });

      this.map.on('zoomend', (event: any) => {
        if (event.target.getZoom() !== this._mapState.zoomLevel) {
          this.mapZoomChange.emit(
            Object.assign({}, this._mapState, {
              centerPoint: event.target.getCenter(),
              zoomLevel: event.target.getZoom()
            })
          );
        }
      });

      this.map.on('movestart', () => {
        this.mapIsMoving = true;
      });

      this.map.on('moveend', (event: any) => {
        this.mapIsMoving = false;
        if (
          !DnvMapComponent.isNearby(
            event.target.getCenter(),
            this._mapState.centerPoint,
            0.0001
          )
        ) {
          this.mapMoveChange.emit(
            Object.assign({}, this._mapState, {
              centerPoint: event.target.getCenter(),
              zoomLevel: event.target.getZoom()
            })
          );
        }
      });

      //  SVG Marker
      this.defineGenericSVGMarker();

      if (this.map.zoomControl) {
        this.map.zoomControl.setPosition('bottomleft');
      }

      this.map.on('draw:drawstart', (event: any) => {
        this.mapUpdate.emit(new IsDrawing(true));
      });

      this.map.on('draw:toolbarclosed', (event: any) => {
        this.mapUpdate.emit(new IsDrawing(false));
      });

      // fix adding a node to map during polyline draw if pan map
      const originalOnTouch = L.Draw.Polyline.prototype._onTouch;
      L.Draw.Polyline.prototype._onTouch = function (e) {
        if (
          e.originalEvent.pointerType !== 'mouse' &&
          e.originalEvent.pointerType !== 'touch'
        ) {
          return originalOnTouch.call(this, e);
        }
      };

      //  listen to the draw created event
      this.map.on('draw:created', (event: any) => {
        const mapComp = this;

        // finished drawing, disable drawcontrol
        this.mapUpdate.emit(new StartDraw(''));
        this.mapUpdate.emit(new IsDrawing(false));
        const layer = event.layer;
        this.drawnItems.addLayer(layer);

        const measurements = this.measureShapes(layer);

        // marker
        if (layer instanceof L.Marker) {
          // enable editing, ie user can move it around
          layer.dragging.enable();
        }

        const coords = [];

        // put coordinates of polygon into proper format
        if (layer._latlngs && layer instanceof L.Polygon) {
          layer._latlngs[0].forEach(function (obj) {
            coords.push([obj.lng, obj.lat]);
          });
        } else if (layer._latlngs && layer instanceof L.Polyline) {
          // put coordinates of lines into proper format
          layer._latlngs.forEach(function (obj) {
            coords.push([obj.lng, obj.lat]);
          });
        }

        // extract data to pass to action
        let geometry = { coordinates: null, radius: 0, type: '' };
        if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
          geometry = {
            coordinates: [coords],
            radius: layer._radius ? layer._radius : 0,
            type: ''
          };
        } else if (layer instanceof L.Polyline) {
          // different coordinates tructure for lines
          geometry = {
            coordinates: coords,
            radius: layer._radius ? layer._radius : 0,
            type: ''
          };
        } else {
          // marker
          geometry = {
            coordinates: [layer._latlng.lng, layer._latlng.lat],
            radius: layer._radius ? layer._radius : 0,
            type: ''
          };
        }

        const shapeGuid = Guid.create().toString();
        const newShape = {
          shapeId: shapeGuid,
          leafletId: layer._leaflet_id,
          geometry: geometry,
          properties: {
            isSelected: false,
            note: layer._popup ? layer._popup._content : ''
          },
          type: 'Feature',
          isLatLng: false,
          isMetric: false
        };

        if (layer instanceof L.Marker) {
          newShape.isLatLng = true; // Points initially show lat/lng
        } else {
          newShape.isMetric = true; // Lines and Polygons initially show metric measures
        }

        // output geoJSON
        // loop thru layers to find shape type
        const markersArr = this.markersArr;
        this.drawnItems.eachLayer(function (feature) {
          const featureLayer = feature.toGeoJSON();
          if (feature._leaflet_id === layer._leaflet_id) {
            geometry.type = featureLayer.geometry.type;
          }

          feature.on('editdrag', (event: any) => {
            const layer = event.target;
            const marker = markersArr.filter(
              m => m.leafletId === layer._leaflet_id
            );
            const component = layer.componentInstance;

            let area = 0;
            let distance = 0;
            let distanceDisplay = '';
            let areaDisplay = '';
            // calculate area & perimeter for polygon
            if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
              // calculate perimeter
              for (let i = 0; i < layer._latlngs[0].length - 1; i++) {
                distance =
                  distance +
                  layer._latlngs[0][i].distanceTo(layer._latlngs[0][i + 1]);
              }

              // calculate area
              area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);

              if (!marker[0].isMetric) {
                distanceDisplay = L.GeometryUtil.readableDistance(
                  distance,
                  false,
                  true,
                  false,
                  {
                    ft: 2
                  }
                );

                areaDisplay = L.GeometryUtil.readableArea(area, false, {
                  ft: 2
                });
              } else {
                distanceDisplay = L.GeometryUtil.readableDistance(
                  distance,
                  true,
                  false,
                  false,
                  { km: 2, m: 2 }
                );

                areaDisplay = L.GeometryUtil.readableArea(area, true, { m: 2 });
              }

              component.instance.data = Object.assign(
                {},
                component.instance.data,
                {
                  distance: distanceDisplay,
                  area: areaDisplay,
                  isMetric: marker[0].isMetric
                }
              );

              // update marker
              marker[0].distance = distance;
              marker[0].area = area;
            } else if (
              layer instanceof L.Polyline &&
              !(layer instanceof L.Polygon && !(layer instanceof L.Rectangle))
            ) {
              // dragging points on a line
              for (let i = 0; i < layer._latlngs.length - 1; i++) {
                distance =
                  distance +
                  layer._latlngs[i].distanceTo(layer._latlngs[i + 1]);
              }

              if (!marker[0].isMetric) {
                distanceDisplay = L.GeometryUtil.readableDistance(
                  distance,
                  false,
                  true,
                  false,
                  {
                    ft: 2
                  }
                );
              } else {
                distanceDisplay = L.GeometryUtil.readableDistance(
                  distance,
                  true,
                  false,
                  false,
                  { km: 2, m: 2 }
                );
              }
              component.instance.data = Object.assign(
                {},
                component.instance.data,
                {
                  distance: distanceDisplay,
                  area: null,
                  isMetric: marker[0].isMetric
                }
              );

              // update marker
              marker[0].distance = distance;
            }

            component.changeDetectorRef.detectChanges();
          });

          // dragging marker around (new markers, not loaded shapes)
          feature.on('drag', (event: any) => {
            const layer = event.target;
            const marker = markersArr.filter(
              m => m.leafletId === layer._leaflet_id
            );
            const component = layer.componentInstance;
            if (layer instanceof L.Marker) {
              if (marker[0].isLatLng) {
                component.instance.data = Object.assign(
                  {},
                  component.instance.data,
                  { latlng: layer._latlng, isLatLng: true }
                );
              } else {
                const convertedPoint = convertToXY(layer._latlng);

                component.instance.data = Object.assign(
                  {},
                  component.instance.data,
                  {
                    x: convertedPoint[0],
                    y: convertedPoint[1],
                    isLatLng: marker[0].isLatLng,
                    latlng: layer._latlng
                  }
                );

                // update marker
                marker[0].latlng = layer._latlng;
              }
              layer.openPopup();
            }

            component.changeDetectorRef.detectChanges();
          });

          // finished editing shape
          feature.on('edit', (event: any) => {
            const thisLayer = event.target;
            const geoJsonFeature = thisLayer.toGeoJSON();
            const coordinates = geoJsonFeature.geometry.coordinates;
            const layerAttr = {
              leafletId: layer._leaflet_id,
              latlngs: coordinates
            };
            mapComp.mapUpdate.emit(new UpdateFeature(layerAttr));
          });

          // finished dragging point
          feature.on('dragend', (event: any) => {
            // console.log('finished dragging');
            const layer = event.target;
            const layerAttr = {
              leafletId: layer._leaflet_id,
              latlngs: layer._latlng
            };
            mapComp.mapUpdate.emit(new UpdateFeature(layerAttr));
          });
        });

        // newShape being added to mapState.features
        this.mapUpdate.emit(new DrawShapes([newShape]));

        // copy mapState.features to applicationState.shapesList
        this.mapUpdate.emit(new AddedFeature(newShape));

        let measuredValues: any = {};
        if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
          measuredValues = {
            isMarker: false,
            isMetric: true,
            distance: measurements.distance,
            area: measurements.area === 0.0 ? null : measurements.area,
            guid: shapeGuid,
            leafletId: layer._leaflet_id
          };
          this.markersArr.push(measuredValues);
        } else {
          measuredValues = {
            isMarker: true,
            isLatLng: true,
            latlng: layer._latlng,
            guid: shapeGuid,
            leafletId: layer._leaflet_id
          };
          this.markersArr.push(measuredValues);
        }
        // needs to be here because data needs to be added to this.markersArr first
        // bind popup, use dynamic component
        this.addPopup(
          layer,
          measurements,
          measuredValues.isLatLng || false,
          measuredValues.isMetric || false
        );

      });

      // edit & delete start
      this.map
        .on('draw:deletestart', (event: any) => {
          this.editShapes = true;
        })
        .on('draw:editstart', (event: any) => {
          this.editShapes = true;
        });

      // draw edited event
      this.map
        .on('draw:edited', (event: any) => {
          this.editShapes = false;
          // compare features & feature group layers
          const fg = this.drawnItems;
          this._mapState.features.forEach(function (feature) {
            fg.eachLayer(function (layer) {
              if (layer._leaflet_id === feature.leafletId) {
                const layerGeojson = layer.toGeoJSON();
                // put coordinates of polygon into proper format
                const coords = [];
                const coords2 = layerGeojson.geometry.coordinates;
                if (layer._latlngs) {
                  if (layer._latlngs[0].length > 1) {
                    layer._latlngs[0].forEach(function (obj) {
                      coords.push([obj.lng, obj.lat]);
                    });
                  } else {
                    coords.push(layer._latlngs[0].lng, layer._latlngs[0].lat);
                  }
                }

                const geometry = {
                  coordinates: layer._latlngs
                    ? [coords]
                    : [layer._latlng.lng, layer._latlng.lat],
                  radius: layer._radius ? layer._radius : 0,
                  type: layerGeojson.geometry.type
                };
                feature.geometry = geometry;
              }
            });
          });

          // reset mapState.StartDraw value
          this.mapUpdate.emit(new StartDraw({ shape: '', shapeGuid: '' }));
        })
        .on('draw:deleted', (event: any) => {
          // draw deleted event
          this.editShapes = false;
          // compare featureGroup (drawnItems) layers with state.features
          const shapes = [];
          const fg = this.drawnItems;
          this._mapState.features.forEach(function (feature) {
            const fgObj = [];
            Object.assign(fgObj, fg._layers);
            fgObj.forEach(function (layer) {
              if (feature.leafletId === layer._leaflet_id) {
                shapes.push(feature);
              }
            });
          });
          this.updateDrawnShapes(shapes);
          // reset mapState.StartDraw value
          this.mapUpdate.emit(new StartDraw({ shape: '', shapeGuid: '' }));
        });

      // end leaflet draw
    });
  }

  defineGenericSVGMarker() {
    //  Based on https://github.com/iatkin/leaflet-svgicon

    function defaultSvgRenderer(options: any): string {
      let parameters = '';

      Object.entries({
        class: 'svg-icon-circle',
        cx: Number(options.iconSize.x) / 2,
        cy: Number(options.iconSize.y) / 2,
        r: Number(options.iconSize.x) / 2,
        fill: 'red',
        'fill-opacity': 1
      }).forEach(([key, value]) => (parameters += key + '="' + value + '" '));

      return '<circle ' + parameters + '></circle>';
    }

    L.DivIcon.SVGIcon = L.DivIcon.extend({
      options: {
        className: 'svg-icon',
        iconSize: L.point(10, 10),
        iconAnchor: null,
        svgRenderer: defaultSvgRenderer //  Default renderer to override
      },
      initialize: function (options: any) {
        options = L.Util.setOptions(this, options);

        if (!options.iconAnchor) {
          options.iconAnchor = L.point(
            Number(options.iconSize.x) / 2,
            Number(options.iconSize.y) / 2
          );
        }

        const markerBody = options.svgRenderer(options);

        options.html =
          '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="' +
          options.className +
          '" style="width: ' +
          options.iconSize.x +
          'px; height :' +
          options.iconSize.y +
          'px;">' +
          markerBody +
          '</svg>';
      }
    });

    L.divIcon.svgIcon = function (options: any) {
      return new L.DivIcon.SVGIcon(options);
    };

    L.Marker.SVGMarker = L.Marker.extend({
      options: {
        iconFactory: L.divIcon.svgIcon,
        iconOptions: {}
      },
      initialize: function (latlng: any, options: any) {
        options = L.Util.setOptions(this, options);
        options.icon = options.iconFactory(options.iconOptions);
        this._latlng = latlng;
      },
      onAdd: function (map: any) {
        L.Marker.prototype.onAdd.call(this, map);
      }
    });

    L.marker.svgMarker = function (latlng: any, options: any) {
      return new L.Marker.SVGMarker(latlng, options);
    };
  }

  measureShapes(layer) {
    // calculate distance for polyline
    let distance = 0;

    // calculate length of line
    if (
      layer instanceof L.Polyline &&
      !(layer instanceof L.Polygon || layer instanceof L.Rectangle)
    ) {
      for (let i = 0; i < layer._latlngs.length - 1; i++) {
        distance =
          distance + layer._latlngs[i].distanceTo(layer._latlngs[i + 1]);
      }
      // enable editing
      layer.editing.enable();
    }

    let area = 0;
    // calculate area for polygon
    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
      // calculate perimeter
      for (let i = 0; i < layer._latlngs[0].length - 1; i++) {
        distance =
          distance + layer._latlngs[0][i].distanceTo(layer._latlngs[0][i + 1]);
      }

      // calculate area
      area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
      // enable editing
      layer.editing.enable();
    }

    return { distance: distance, area: area };
  }

  resetIcons() {
    if (!this._mapState.highlightFeature) {
      this.mapUpdate.emit(new ResetSelected(null));
      this.map.eachLayer(function (lyr) {
        if (lyr._icon && lyr._icon.className.indexOf('selected') > -1) {
          L.DomUtil.removeClass(lyr._icon, 'selected');
        } else if (
          lyr._path &&
          lyr._path.className.baseVal.indexOf('selected') > -1
        ) {
          L.DomUtil.removeClass(lyr._path, 'selected');
        }
      });
    }
  }

  highlightFeatures() {
    if (this._mapState.highlightFeature) {
      if (
        this.featureLayers
          .get(this._mapState.highlightFeature.url)
          .getFeature(this._mapState.highlightFeature.objectId)._icon
      ) {
        L.DomUtil.addClass(
          this.featureLayers
            .get(this._mapState.highlightFeature.url)
            .getFeature(this._mapState.highlightFeature.objectId)._icon,
          'selected'
        );
      } else if (
        this.featureLayers
          .get(this._mapState.highlightFeature.url)
          .getFeature(this._mapState.highlightFeature.objectId)._path
      ) {
        L.DomUtil.addClass(
          this.featureLayers
            .get(this._mapState.highlightFeature.url)
            .getFeature(this._mapState.highlightFeature.objectId)._path,
          'selected'
        );
      }
    }
  }

  getValueBykey(url: string, key: string) {
    let boolValue;
    this.layerState.layers.forEach(layer => {
      layer.featureLayers.forEach(fl => {
        if (url && url.indexOf(fl.url) > -1) {
          boolValue = fl[key];

          return;
        }
      });
    });
    return boolValue;
  }

  // get url for saving to tables
  getWriteUrl(url: string) {
    let writeUrl = '';
    this.layerState.layers.forEach(layer => {
      layer.featureLayers.forEach(
        fl => {
          if (url && url.indexOf(fl.url) > -1) {
            if (layer.tableLayers && layer.tableLayers.length > 0) {
              writeUrl = layer.tableLayers[0].fullUrl;
            }
          }
        },
        [, layer]
      );
    });
    return writeUrl;
  }
}
