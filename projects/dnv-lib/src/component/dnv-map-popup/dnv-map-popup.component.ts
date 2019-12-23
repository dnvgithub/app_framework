import { Component, Input, Output, EventEmitter, OnInit, ComponentFactoryResolver, Injector } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dnv-map-popup',
  template: `
  <div class='popupWrapper'>
  <button class='btn-chevron'>
    <i class="fas fa-chevron-down"></i>
  </button>
  <div *ngIf='!data.isMarker'>
    <div *ngIf='data.area == null'>
    Length: {{ data.distance }}<br/>
    </div>
    <div *ngIf='data.area != null'>
      Perimeter: {{ data.distance }}<br/>
      Area: {{ data.area }}
    </div>
  </div>
  <div *ngIf='data.isMarker'>
    <div *ngIf='data.isLatLng'>
    Lat: {{ (data.latlng.lat).toFixed(4)}}<br/>
    Lng: {{ (data.latlng.lng).toFixed(4)}}
    </div>
    <div *ngIf='!data.isLatLng'>
    X: {{ (data.x).toFixed(4) }}<br/>
    Y: {{ (data.y).toFixed(4) }}
     </div>
  </div>
  <div>
  <div class='buttonPanel'>
  <button (click)='deleteShape()' title='Delete this shape'><i class="fas fa-trash-alt"></i></button>
  <button (click)='hidePopup()' class='showPopup' title='Hide measurement'><i class='fa fa-eye'></i><i class='fa fa-eye-slash'></i></button>
  <button *ngIf='!data.isMarker' (click)='popupClicked()' [innerHTML]="conversionText(data.isMetric, true, false)"
   [className]="!data.isMetric ? 'rotate-icon' : ''"></button>
  <button *ngIf='data.isMarker' (click)='popupClicked()' [innerHTML]="conversionText(data.isLatLng, false, true)"
   [className]="!data.isLatLng ? 'rotate-icon' : ''" title='Convert measurement'></button>
  </div>
  </div>
  </div>
  `,
  styles: [
    `
    div{font-weight: 700; color: #333; white-space: nowrap;}
    button {display: inline-block; border: solid 1px #ccc; border-right: none; background-color: transparent;
      margin: 5px 0px; height: 26px;}
    button:last-child{border-right: solid 1px #ccc;}
    .btn-chevron{ border: none; width: 12px; height: 12px; float: right; color: #333333; opacity: 0.25;}
  `]
})
export class DnvMapPopupComponent {
  @Input() data;
  @Output() popupClick = new EventEmitter<any>();
  @Output() deleteShapeClick = new EventEmitter<any>();
  @Output() hidePopupClick = new EventEmitter<any>();

  popupClicked() {
    this.popupClick.emit();
  }
  deleteShape() {
    this.deleteShapeClick.emit();
  }
  hidePopup() {
    this.hidePopupClick.emit();
  }

  conversionText(isMetric, isDistance, isLatLng) {
    if (isDistance && isMetric) {
      return 'm <i class="fas fa-arrow-right"></i> ft';
    } else if (isDistance && !isMetric) {
      return 'm <i class="fas fa-arrow-right"></i> ft';
    }

    if (isMetric && isLatLng) {
      return 'L/L <i class="fas fa-arrow-right"></i> X/Y';
    } else if (!isMetric && isLatLng) {
      return 'L/L <i class="fas fa-arrow-right"></i> X/Y';
    }
  }

}
