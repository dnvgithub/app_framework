import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

import { DnvLegendState, LegendLayer, Legend, LegendInfo } from './dnv-legend.state';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dnv-legend',
  templateUrl: './dnv-legend.component.html',
  styleUrls: ['./dnv-legend.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnvLegendComponent implements OnInit {

  @Input() legendState: DnvLegendState;

  constructor() { }

  ngOnInit() { }

  getImgSrc(legend: Legend): string {
    const result = `data:${legend.contentType};base64,${legend.imageData}`;
    return result;
  }

  getLegendLabel(legend: Legend, legendLayers: LegendLayer): string {
    let label = legendLayers.layerName;
    if (legend.label) {
      label = legend.label;
    }
    return label;
  }
}
