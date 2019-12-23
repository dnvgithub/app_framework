import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

// Components
import { DnvUiModule } from './component/lib.component';

// Services
import { ScriptService } from './service/script.service';
import { DnvSearchService } from './component/dnv-search/dnv-search.service';

// Directive
import { TimeInputDirective } from './directive/time-input.directive';
import { DateInputDirective } from './directive/date-input.directive';

@NgModule({
  declarations: [TimeInputDirective],
  imports: [DnvUiModule, HttpClientModule],
  providers: [ScriptService, DnvSearchService],
  exports: [DnvUiModule, TimeInputDirective]
})
export class DnvModule { }
