import { Action } from '@ngrx/store';

export enum ToasterActionType {
  ToastUserNotification = '[Toastr] ToastUserNotification'
}

export class ToastUserNotification implements Action {
  readonly type = ToasterActionType.ToastUserNotification;
  constructor(public payload: any) { }
}

export type toasterAction =
  ToastUserNotification;
