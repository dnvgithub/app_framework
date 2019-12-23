import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dnv-key-value-section',
  templateUrl: './dnv-key-value-section.component.html',
  styles: ['./dnv-key-value-section.component.css']
})
export class DnvKeyValueSectionComponent {
  @Input() kvSections: { title: string, kvPair: Array<[string, string]> }[];
  @Input() spinnerStatus: { message: string, pending: boolean } = { message: '', pending: false };
  @Input() excludesList: string[];

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onExpandPanel = new EventEmitter<string>();

  expandPanel(id: string) {
    this.onExpandPanel.emit(id);
  }
}
