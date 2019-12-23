import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { DnvButton, DnvNavState, initialDnvNavState } from './dnv-nav.state';
import { ButtonPressed, ButtonReleased, ToggleMorePanel } from './dnv-nav.actions';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dnv-nav',
  templateUrl: './dnv-nav.component.html',
  styleUrls: ['./dnv-nav.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnvNavComponent implements OnInit {

  public _dnvNavState = initialDnvNavState;
  hideNavbar = false;

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onButtonPressed = new EventEmitter<ButtonPressed>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onButtonReleased = new EventEmitter<ButtonReleased>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onToggleMore = new EventEmitter<ToggleMorePanel>();

  @Input() set dnvNavState(dnvNavState: DnvNavState) {
    this._dnvNavState = dnvNavState;
  }

  constructor() { }

  ngOnInit() { }

  isActive(dnvButton: DnvButton): boolean {
    return dnvButton.isActive;
  }

  onClick(dnvButton: DnvButton) {
    if (dnvButton.name === this._dnvNavState.moreButtonLabel) {
      this.onToggleMore.emit(new ToggleMorePanel());
    } else {

      // The button clicked is the active one so we just need to release it
      if (dnvButton.isActive) {
        this.onButtonReleased.emit(new ButtonReleased(dnvButton));
      } else {
        // First find the currently active button, if any, and release it
        const activeButton = this._dnvNavState.dnvButtons.find(b => b.isActive);
        if (activeButton) {
          this.onButtonReleased.emit(new ButtonReleased(activeButton));
        }
        // Then mark the clicked button as active
        this.onButtonPressed.emit(new ButtonPressed(dnvButton));
      }
    }
  }

  buttonCountExceedCutOff(): boolean {
    return this._dnvNavState.dnvButtons.length > this._dnvNavState.moreCutoff;
  }

  visibleClass(i: number): boolean {
    return !(i < (this._dnvNavState.moreCutoff - 1));
  }

  theMoreButton() {
    return { name: 'More', fontAwesome: 'fa-ellipsis-h', isActive: false };
  }

  buttonsOverCutOff(): DnvButton[] {
    return this._dnvNavState.dnvButtons.slice(this._dnvNavState.moreCutoff - 1);
  }

  // This is required to keep the state in sync with the 3rd party autoclose behavior
  onOpenClose(event: any) {
    if (this._dnvNavState.morePanelOpen === event) {
      this.onToggleMore.emit(new ToggleMorePanel());
    }
  }

}
