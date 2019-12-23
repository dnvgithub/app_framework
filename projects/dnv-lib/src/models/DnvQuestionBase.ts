export class QuestionBase<T> {
  value: T;
  name: string;
  alias: string;
  editable: boolean;
  controlType: string;
  nullable: boolean;
  readonly: boolean;

  constructor(options: {
    value?: T,
    name?: string,
    alias?: string,
    editable?: boolean,
    controlType?: string,
    nullable?: boolean,
    readonly?: boolean
  } = {}) {
    this.value = options.value;
    this.name = options.name || '';
    this.alias = options.alias || '';
    this.editable = options.editable || true;
    this.controlType = options.controlType;
    this.nullable = options.nullable || true;
    this.readonly = options.readonly || false;
  }
}

export class TextQuestion extends QuestionBase<string> {
  controlType = 'text';
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
  }
}

export class TextAreaQuestion extends QuestionBase<string> {
  controlType = 'textarea';
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
  }
}

export class RadioQuestion extends QuestionBase<string> {
  controlType = 'radio';
  options: { name: string, code: string }[] = [];

  constructor(options: {} = {}) {
    super(options);
    this.options = options['options'] || [];
  }
}

export class DropdownQuestion extends QuestionBase<string> {
  controlType = 'dropdown';
  options: { name: string, code: string }[] = [];

  constructor(options: {} = {}) {
    super(options);
    this.options = options['options'] || [];
  }
}

export class FileQuestion extends QuestionBase<string> {
  controlType = 'file';
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
  }
}

export class DateQuestion extends QuestionBase<string> {
  controlType = 'date';
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
  }
}
