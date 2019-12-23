import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BaseMapState } from './dnv-basemap.state';
import { DnvBasemap } from '../dnv-map/dnv-map.state';
import { ToggleBasemaps } from './dnv-basemap.actions';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dnv-basemap',
  templateUrl: './dnv-basemap.component.html',
  styleUrls: ['./dnv-basemap.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnvBaseMapComponent implements OnInit {

  @Input() baseMapState: BaseMapState;

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSetBaseMap = new EventEmitter<DnvBasemap>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onToggleBasemaps = new EventEmitter<Action>();

  constructor() { }

  ngOnInit() { }

  hideBasemaps() {
    return !this.baseMapState.showBasemaps;
  }

  activeBaseMaps() {
    return this.baseMapState.basemap;
  }

  selectedBasemap() {
    return this.baseMapState.basemap.filter(b => b.selected);
  }

  setBaseMap(basemap: DnvBasemap) {
    this.onSetBaseMap.emit(basemap);
  }

  toggleBasemapList() {
    this.onToggleBasemaps.emit(new ToggleBasemaps());
  }
}
