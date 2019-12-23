import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

enum SelectedGroup {
  Hours,
  Minutes,
  Seconds
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[appTimeInput]'
})
export class TimeInputDirective {

  private _time: NgbTimeStruct;
  private _selectedGroup: SelectedGroup = SelectedGroup.Hours;

  @Input() showSeconds = false;
  @Input() allowedMinuteValues: number[] = null; // null = any or a list of allowed values [0, 15, 30, 45]
  @Input() allowedSecondValues: number[] = null; // same as above

  @Output() appTimeInputChange = new EventEmitter<NgbTimeStruct>();
  @Input('appTimeInput')
  get time() {
    return this._time;
  }
  set time(t) {
    if (!t || !this.timeIsValid(t)) {
      t = { hour: 0, minute: 0, second: 0 };
    }
    this._time = this.timeIsAllowed(t) ? t : this.time;
    this.appTimeInputChange.emit(this._time);
    this.writeToInput();
  }

  @HostListener('focus', ['$event.target.value'])
  onFocus(value) {
    this._selectedGroup = SelectedGroup.Hours;
    this.highlight(this._selectedGroup);
  }
  @HostListener('click', ['$event.target.value'])
  onClick(value) {
    const clickLocation = this.clickLocation();

    this._selectedGroup = SelectedGroup.Minutes;
    if (clickLocation < 3) {
      this._selectedGroup = SelectedGroup.Hours;
    } else if (this.showSeconds && clickLocation >= 6) {
      this._selectedGroup = SelectedGroup.Seconds;
    }
    this.highlight(this._selectedGroup);
  }
  @HostListener('blur', ['$event.target.value'])
  onBlur(value) {
    // validate and restore if invalid
    this.time = this.readFromInput();
  }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    let preventDefault = true;
    switch (event.key) {
      case 'ArrowDown':
      case 'Down':
        const downTime = this.down(this.time, this._selectedGroup);
        this.time = this.timeIsAllowed(downTime) ? downTime : this.time;
        break;
      case 'ArrowUp':
      case 'Up':
        const upTime = this.up(this.time, this._selectedGroup);
        this.time = this.timeIsAllowed(upTime) ? upTime : this.time;
        break;
      case 'ArrowLeft':
      case 'Left':
        this.left(this._selectedGroup);
        break;
      case 'ArrowRight':
      case 'Right':
        this.right(this._selectedGroup);
        break;
      case 'Tab':
        this.time = this.readFromInput();
        if (event.shiftKey) {
          preventDefault = this.left(this._selectedGroup);
        } else {
          preventDefault = this.right(this._selectedGroup);
        }
        break;
      default:
        preventDefault = false;
        break;
    }

    if (preventDefault) {
      event.preventDefault();
      this.highlight(this._selectedGroup);
    }
  }

  // Handle up key per group and depending if an allowed list of value is provided or not
  private up(time: NgbTimeStruct, group: SelectedGroup): NgbTimeStruct {
    let t = Object.assign({}, time);

    switch (group) {
      case SelectedGroup.Hours:
        const h = time.hour + 1;
        t.hour = h > 23 ? 0 : h;
        break;
      case SelectedGroup.Minutes:
        if (this.allowedMinuteValues) {
          const minuteIndex = this.allowedMinuteValues.indexOf(time.minute) + 1;
          if (minuteIndex >= this.allowedMinuteValues.length) {
            t.minute = this.allowedMinuteValues[0];
            t = this.up(t, SelectedGroup.Hours);
          } else {
            t.minute = this.allowedMinuteValues[minuteIndex];
          }
        } else {
          const m = time.minute + 1;
          if (m > 59) {
            t.minute = 0;
            t = this.up(t, SelectedGroup.Hours);
          } else {
            t.minute = m;
          }
        }
        break;
      case SelectedGroup.Seconds:
        if (this.allowedSecondValues) {
          const secondIndex = this.allowedSecondValues.indexOf(time.second) + 1;
          if (secondIndex >= this.allowedSecondValues.length) {
            t.second = this.allowedSecondValues[0];
            t = this.up(t, SelectedGroup.Minutes);
          } else {
            t.second = this.allowedSecondValues[secondIndex];
          }
        } else {
          const s = time.second + 1;
          if (s > 59) {
            t.second = 0;
            t = this.up(t, SelectedGroup.Minutes);
          } else {
            t.second = s;
          }
        }
        break;
      default:
        break;
    }

    return t;
  }
  // Handle down key per group and depending if an allowed list of value is provided or not
  private down(time: NgbTimeStruct, group: SelectedGroup): NgbTimeStruct {
    let t = Object.assign({}, time);

    switch (group) {
      case SelectedGroup.Hours:
        const h = time.hour - 1;
        t.hour = h < 0 ? 23 : h;
        break;
      case SelectedGroup.Minutes:
        if (this.allowedMinuteValues) {
          const minuteIndex = this.allowedMinuteValues.indexOf(time.minute) - 1;
          if (minuteIndex < 0) {
            t.minute = this.allowedMinuteValues[this.allowedMinuteValues.length - 1];
            t = this.down(t, SelectedGroup.Hours);
          } else {
            t.minute = this.allowedMinuteValues[minuteIndex];
          }
        } else {
          const m = time.minute - 1;
          if (m < 0) {
            t.minute = 59;
            t = this.down(t, SelectedGroup.Hours);
          } else {
            t.minute = m;
          }
        }
        break;
      case SelectedGroup.Seconds:
        if (this.allowedSecondValues) {
          const secondIndex = this.allowedSecondValues.indexOf(time.second) - 1;
          if (secondIndex < 0) {
            t.second = this.allowedSecondValues[this.allowedSecondValues.length - 1];
            t = this.down(t, SelectedGroup.Minutes);
          } else {
            t.second = this.allowedSecondValues[secondIndex];
          }
        } else {
          const s = time.second - 1;
          if (s < 0) {
            t.second = 59;
            t = this.down(t, SelectedGroup.Minutes);
          } else {
            t.second = s;
          }
        }
        break;
      default:
        break;
    }

    return t;
  }
  private left(group: SelectedGroup): boolean {
    let preventDefault = true;
    switch (group) {
      case SelectedGroup.Hours:
        preventDefault = false;
        break;
      case SelectedGroup.Minutes:
        this._selectedGroup = SelectedGroup.Hours;
        break;
      case SelectedGroup.Seconds:
        this._selectedGroup = SelectedGroup.Minutes;
        break;
      default:
        preventDefault = false;
        break;
    }
    return preventDefault;
  }
  private right(group: SelectedGroup): boolean {
    let preventDefault = true;
    switch (group) {
      case SelectedGroup.Hours:
        this._selectedGroup = SelectedGroup.Minutes;
        break;
      case SelectedGroup.Minutes:
        if (this.showSeconds) {
          this._selectedGroup = SelectedGroup.Seconds;
        } else {
          preventDefault = false;
        }
        break;
      case SelectedGroup.Seconds:
        preventDefault = false;
        break;
      default:
        preventDefault = false;
        break;
    }
    return preventDefault;
  }
  private highlight(group: SelectedGroup): void {
    switch (group) {
      case SelectedGroup.Hours:
        this.el.nativeElement.setSelectionRange(0, 2);
        break;
      case SelectedGroup.Minutes:
        this.el.nativeElement.setSelectionRange(3, 5);
        break;
      case SelectedGroup.Seconds:
        this.el.nativeElement.setSelectionRange(6, 8);
        break;
      default:
        this.highlight(SelectedGroup.Hours);
        break;
    }
  }
  private clickLocation(): number {
    let start = 0;
    if ('selectionStart' in this.el.nativeElement) {
      start = this.el.nativeElement.selectionStart;
    }
    return start;
  }
  // This is similar to ng-bootstrap/src/datepicker/ngb-date-parser-formatter.ts
  private readFromInput(): NgbTimeStruct {
    const s: string = this.el.nativeElement.value;
    const tokens: string[] = s.trim().split(':');
    const t: NgbTimeStruct = Object.assign({}, this.time);

    if (tokens.length >= 1 && this.isNumber(tokens[0])) {
      const hour = this.toInteger(tokens[0]);
      if ((hour >= 0) && (hour <= 23)) {
        t.hour = hour;
      }
    }
    if (tokens.length >= 2 && this.isNumber(tokens[1])) {
      const minute = this.toInteger(tokens[1]);
      if ((minute >= 0) && (minute <= 59)) {
        t.minute = minute;
      }
    }
    if (tokens.length >= 3 && this.isNumber(tokens[2])) {
      const second = this.toInteger(tokens[2]);
      if ((second >= 0) && (second <= 59)) {
        t.second = second;
      }
    }

    return t;
  }
  private writeToInput(): void {
    const t = this.padNumber(this._time.hour)
      + ':' + this.padNumber(this._time.minute)
      + (this.showSeconds ? ':' + this.padNumber(this._time.second) : '');
    if (this.el.nativeElement.value !== t) {
      this.el.nativeElement.value = t;
    }
  }

  // Based on ng-bootstrap/src/util/util.ts
  toInteger(value: any): number {
    return parseInt(`${value}`, 10);
  }
  isNumber(value: any): value is number {
    return !isNaN(this.toInteger(value));
  }
  padNumber(value: number) {
    if (this.isNumber(value)) {
      return `0${value}`.slice(-2);
    } else {
      return '';
    }
  }

  timeIsValid(time: NgbTimeStruct): boolean {

    if (!(this.isNumber(time.hour) && (time.hour >= 0) && (time.hour <= 23))) {
      return false;
    }
    if (!(this.isNumber(time.minute) && (time.minute >= 0) && (time.minute <= 59))) {
      return false;
    }
    if (!(this.isNumber(time.second) && (time.second >= 0) && (time.second <= 59))) {
      return false;
    }

    return true;
  }
  timeIsAllowed(time: NgbTimeStruct): boolean {

    if (this.allowedSecondValues) {
      if (!this.allowedSecondValues.includes(time.second)) {
        return false;
      }
    }
    if (this.allowedMinuteValues) {
      if (!this.allowedMinuteValues.includes(time.minute)) {
        return false;
      }
    }

    return true;
  }

  constructor(private el: ElementRef) {
    this._time = { hour: -1, minute: -1, second: -1 };
  }
}
