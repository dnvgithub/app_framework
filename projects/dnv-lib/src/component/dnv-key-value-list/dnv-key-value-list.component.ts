import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dnv-key-value-pair',
  template: '<div class="key-pair"><span class="label">{{key}}</span> <span>{{value}}</span></div>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnvKeyValuePairComponent {
  @Input() key: string;
  @Input() value: string;

}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dnv-key-value-list',
  template: `<div><dnv-key-value-pair *ngFor="let kv of excludeKV()" [key]="kv[0]" [value]="kv[1]"></dnv-key-value-pair></div>
      <div id="spinner" [hidden]="!spinnerStatus.pending"><i class="fas fa-spinner fa-spin fa-2x"></i>
      <div id="spinnerMsg">{{spinnerStatus.message}}</div></div>`,
  styles: ['#spinner { text-align: center; } #spinnerMsg { font-weight: bold; margin-top: 10px; }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnvKeyValueListComponent {
  @Input() kvpairs: Array<[string, string]>;
  @Input() spinnerStatus: { message: string, pending: boolean } = { message: '', pending: false };
  @Input() excludesList: string[] = [];

  excludeKV() {
    return this.kvpairs.filter(function (kv) {
      return this.indexOf(kv[0]) < 0;
    },
      this.excludesList);
  }
}
