import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DnvDynamicFormQuestionComponent } from '../dnv-dynamic-form/dnv-dynamic-form-question.component';
import { DnvFileUploaderComponent } from '../dnv-file-uploader/dnv-file-uploader.component';
import { DnvDynamicFormComponent } from './dnv-dynamic-form.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DateInputDirective } from '../../directive/date-input.directive';
import { ngfModule } from 'angular-file';

describe('DnvDynamicFormComponent', () => {
  let component: DnvDynamicFormComponent;
  let fixture: ComponentFixture<DnvDynamicFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgbModule, ngfModule],
      declarations: [ DnvDynamicFormComponent, DnvDynamicFormQuestionComponent, DnvFileUploaderComponent, DateInputDirective ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DnvDynamicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
