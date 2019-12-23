import { Action } from '@ngrx/store';
import { DnvButton } from './dnv-nav.state';

export enum dnvNavActionType {
  LOAD_BUTTONS = '[dnv-nav] LoadButtons',
  LOAD_BUTTONS_SUCCESS = '[dnv-nav] LoadButtonsSuccess',
  BUTTON_PRESSED = '[dnv-nav] ButtonPressed',
  BUTTON_RELEASED = '[dnv-nav] ButtonReleased',
  TOGGLE_MORE_PANEL = '[dnv-nav] ToggleMorePanel'
}

export class LoadButtons implements Action {
  readonly type = dnvNavActionType.LOAD_BUTTONS;
  constructor(public payload: string) { }
}

export class LoadButtonsSuccess implements Action {
  readonly type = dnvNavActionType.LOAD_BUTTONS_SUCCESS;
  constructor(public payload: DnvButton[]) { }
}

export class ButtonPressed implements Action {
  readonly type = dnvNavActionType.BUTTON_PRESSED;
  constructor(public payload: DnvButton) { }
}

export class ButtonReleased implements Action {
  readonly type = dnvNavActionType.BUTTON_RELEASED;
  constructor(public payload: DnvButton) { }
}

export class ToggleMorePanel implements Action {
  readonly type = dnvNavActionType.TOGGLE_MORE_PANEL;
  constructor(public payload: any = null) { }
}

export type DnvNavAction =
  LoadButtons |
  LoadButtonsSuccess |
  ButtonPressed |
  ButtonReleased |
  ToggleMorePanel;
