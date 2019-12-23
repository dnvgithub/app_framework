import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ngfModule } from 'angular-file';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  DnvPanelContainerComponent
  , DnvMainPanelDirective
  , DnvSidePanelDirective
} from './dnv-panel-container/dnv-panel-container.component';
import { DnvMapComponent } from './dnv-map/dnv-map.component';
import { DnvKeyValueListComponent, DnvKeyValuePairComponent } from './dnv-key-value-list/dnv-key-value-list.component';
import { DnvKeyValueSectionComponent } from './dnv-key-value-section/dnv-key-value-section.component';
import { DnvBaseMapComponent } from './dnv-basemap/dnv-basemap.component';
import { DnvNavComponent } from './dnv-nav/dnv-nav.component';
import { DnvSearchComponent } from './dnv-search/dnv-search.component';
import { DnvLayerComponent } from './dnv-layer/dnv-layer.component';
import { DnvLayerFilterComponent } from './dnv-layer-filter/dnv-layer-filter.component';
import { DnvLegendComponent } from './dnv-legend/dnv-legend.component';
import { DnvMapPopupComponent } from './dnv-map-popup/dnv-map-popup.component';
import { DnvDynamicFormComponent } from './dnv-dynamic-form/dnv-dynamic-form.component';
import { DnvFileUploaderComponent } from './dnv-file-uploader/dnv-file-uploader.component';
import { DnvDynamicFormQuestionComponent } from './dnv-dynamic-form/dnv-dynamic-form-question.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DnvAlertsComponent } from './dnv-alerts/dnv-alerts.component';
import { DateInputDirective } from '../directive/date-input.directive';


@NgModule({
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    ngfModule,
    DragDropModule,
    BrowserAnimationsModule,  // 2/3 required animations module
    ToastrModule.forRoot({    // 3/3 ToastrModule added
      // disableTimeOut: true, // Set to true for errors so that they stay visible
      positionClass: 'toast-bottom-right',
      preventDuplicates: false,
    })
  ],
  exports: [
    DnvAlertsComponent,
    DnvPanelContainerComponent,
    DnvMainPanelDirective,
    DnvSidePanelDirective,
    DnvMapComponent,
    DnvKeyValueListComponent,
    DnvKeyValueSectionComponent,
    DnvNavComponent,
    DnvSearchComponent,
    DnvLayerComponent,
    DnvBaseMapComponent,
    DnvLayerFilterComponent,
    DnvLegendComponent,
    DnvDynamicFormComponent,
    DnvFileUploaderComponent,
    DnvDynamicFormQuestionComponent,
    DateInputDirective
  ],
  declarations: [
    DnvAlertsComponent,
    DnvPanelContainerComponent,
    DnvMainPanelDirective,
    DnvSidePanelDirective,
    DnvMapComponent,
    DnvKeyValuePairComponent,
    DnvKeyValueListComponent,
    DnvKeyValueSectionComponent,
    DnvNavComponent,
    DnvSearchComponent,
    DnvLayerComponent,
    DnvBaseMapComponent,
    DnvLayerFilterComponent,
    DnvLegendComponent,
    DnvMapPopupComponent,
    DnvDynamicFormComponent,
    DnvFileUploaderComponent,
    DnvDynamicFormQuestionComponent,
    DateInputDirective
  ],
  entryComponents: [
    DnvMapPopupComponent
  ]
})
export class DnvUiModule { }
