import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { QuestionBase } from '../models/DnvQuestionBase';

@Injectable()
export class QuestionControlService {
  constructor() { }

  toFormGroup(questions: QuestionBase<any>[]) {
    const group: { [id: string]: FormControl } = {};
    questions = questions || [];

    questions.forEach(question => {
      // default value set to null because NgbDatePicker needs to be null in order to be valid if left blank
        group[question.name] = question.nullable ? new FormControl(question.value || null) :
        new FormControl(question.value || null, Validators.required);
    });
    return new FormGroup(group);
  }
}
