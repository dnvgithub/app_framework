export interface QuestionBase<T> {
  value: T;
  name: string;
  alias: string;
  editable: boolean;
  controlType: string;
  nullable: boolean;
  readonly: boolean;
  options: any;
}

export interface TextQuestion extends QuestionBase<string> { }

export interface TextAreaQuestion extends QuestionBase<string> { }

export interface RadioQuestion extends QuestionBase<string> { }

export interface DropdownQuestion extends QuestionBase<string> { }

export interface FileQuestion extends QuestionBase<string> { }

export interface DateQuestion extends QuestionBase<string> { }

export interface FeatureClickedPayload {
  objectId: number;
  url: string;
  writeUrl: string;
  assetId: string;
  excludeFeatureInfo: string[];
  tableLayers?: any[];
}

// tslint:disable-next-line: no-empty-interface
export interface DnvDynamicFormPayload { }
