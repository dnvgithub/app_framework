import { Component, Directive } from '@angular/core';

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[dnvMainPanel]' })
export class DnvMainPanelDirective {
}

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[dnvSidePanel]' })
export class DnvSidePanelDirective {
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dnv-panel-container',
  templateUrl: './dnv-panel-container.component.html',
  styleUrls: ['./dnv-panel-container.component.css']
})
export class DnvPanelContainerComponent {
}
