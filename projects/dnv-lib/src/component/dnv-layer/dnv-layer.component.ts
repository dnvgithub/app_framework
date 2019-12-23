import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Layer, LayerType, LayerState, isLayerFilterActive } from './dnv-layer.state';
import { SetLayers, HideFilterPanel, GetDrawingInfo } from './dnv-layer.actions';
import { Action } from '@ngrx/store';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dnv-layer',
  templateUrl: './dnv-layer.component.html',
  styleUrls: ['./dnv-layer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnvLayerComponent implements OnInit {
  @Input() layerState: LayerState;

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSetAvailableLayer = new EventEmitter<Layer>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSetActiveLayer = new EventEmitter<Layer>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onToggleLayerInfo = new EventEmitter<Layer>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onLayersOrdered = new EventEmitter<Action>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onToggleShowFilterPanel = new EventEmitter<Layer>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onLayersLoaded = new EventEmitter<Action>();

  constructor() { }

  ngOnInit() { }

  setAvailableLayer(layer: Layer) {
    this.onSetAvailableLayer.emit(layer);
  }

  setActiveLayer(layer: Layer) {
    this.onSetActiveLayer.emit(layer);
  }

  toggleLayerInfo(layer: Layer) {
    this.onToggleLayerInfo.emit(layer);
  }

  toggleShowFilterPanel(layer: Layer) {
    this.onToggleShowFilterPanel.emit(layer);
  }

  isLayerActive() {
    return (this.layerState.layers.find(layer => layer.type === LayerType.Active)) ? true : false;
  }

  isLayerAvailable() {
    return (this.layerState.layers.find(layer => layer.type === LayerType.Available)) ? true : false;
  }

  availableLayers() {
    return this.layerState.layers
      .filter(layer => layer.type === LayerType.Available).sort((lhs: Layer, rhs: Layer) => lhs.name.localeCompare(rhs.name));

  }

  activeLayers() {
    return this.layerState.layers
      .filter(layer => layer.type === LayerType.Active);
  }

  drop(event: CdkDragDrop<string[]>) {
    let sortedList: Layer[] = this.activeLayers();
    moveItemInArray(sortedList, event.previousIndex, event.currentIndex);

    // update sequence
    for (let idx = 0; idx < sortedList.length; idx++) {
      sortedList[idx].sequence = idx + 1;
    }
    sortedList = sortedList.sort((a, b) => a.sequence - b.sequence);
    // add available layers to list
    for (const al of this.availableLayers()) {
      sortedList.push(al);
    }

    this.onLayersOrdered.emit(new SetLayers(sortedList));
  }

  isLayerFiltered(layer: Layer): boolean {
    return isLayerFilterActive(layer);
  }

}
