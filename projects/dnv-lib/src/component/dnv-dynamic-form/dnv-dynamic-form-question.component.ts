import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { QuestionBase } from './dnv-dynamic-form.state';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dnv-question',
  templateUrl: './dnv-dynamic-form-question.component.html'
})
export class DnvDynamicFormQuestionComponent {
  @Input() question: QuestionBase<any>;
  @Input() nextQuestion: QuestionBase<any>;
  @Input() formGroup: FormGroup;
  @Input() submitted: boolean;
  isValid(): boolean {
    return this.formGroup.controls[this.question.name].valid;
  }
}
