import { Component, Input, Output, OnInit, OnChanges, EventEmitter, TemplateRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Action } from '@ngrx/store';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { QuestionBase, FeatureClickedPayload, DnvDynamicFormPayload } from './dnv-dynamic-form.state';
import { QuestionControlService } from '../../service/question-control.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dnv-dynamic-form',
  templateUrl: './dnv-dynamic-form.component.html',
  styleUrls: ['./dnv-dynamic-form.component.scss'],
  providers: [QuestionControlService]
})
export class DnvDynamicFormComponent implements OnInit, OnChanges {

  @Input() header: string;
  @Input() buttonLabel: string;
  @Input() questions: QuestionBase<any>[] = [];
  @Input() lastSelectedFeature: FeatureClickedPayload;
  @Output() Submit = new EventEmitter<DnvDynamicFormPayload>();
  submitted = false;

  form: FormGroup;

  modal: NgbModalRef = null;

  constructor(private qcs: QuestionControlService, private modalService: NgbModal) { }

  ngOnInit() { }

  ngOnChanges() { }

  // TODO Watch this for ng-bootstrap animation... https://github.com/ng-bootstrap/ng-bootstrap/issues/295
  open(modal: TemplateRef<any>) {
    this.form = this.qcs.toFormGroup(this.questions);
    let selectedAsset = '';
    // get assetID value and bind to field
    if (this.lastSelectedFeature) {
      selectedAsset = this.lastSelectedFeature.assetId;
    }

    if (this.form.controls && this.form.controls['Asset_ID']) {
      this.form.controls['Asset_ID'].setValue(selectedAsset);
    }

    this.submitted = false;
    this.modal = this.modalService.open(modal);
  }

  onSubmit() {
    if (this.form.valid) {
      this.submitted = true;
      this.Submit.emit({
        formValues: this.form.value,
        lastSelectedFeature: this.lastSelectedFeature,
        modal: this.modal
      });
    }

  }

  close() {
    if (this.modal) {
      this.modal.close();
    }
  }
  dismiss() {
    if (this.modal) {
      this.modal.dismiss();
    }
  }
  resetForm() {
    this.form.reset();
  }
}
