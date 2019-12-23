import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Self, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

// Manage the format of a text input
// YYYY-MM-DD (default format)
// <input [(appTimeInput)]="searchTime" [allowedMinuteValues]="[0]" [allowedSecondValues]="[0]" [showSeconds]="false">


enum SelectedGroup {
  Year,
  Month,
  Day
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[appDateInput]'
})
export class DateInputDirective {

  private _date: NgbDateStruct = null;
  private _selectedGroup: SelectedGroup = SelectedGroup.Year;
  private is31Days = [1, 3, 5, 7, 8, 10, 12];
  private is30Days = [4, 6, 9, 11];
  private oldestYear = 1950;

  @Input() allowedYearValue: number[];
  @Input() allowedMonthValues: number[] = null; // null = any or a list of allowed values [1,2,3,...,12]
  @Input() allowedDayValues: number[] = null; // same as above
  @Input() nullable = false;

  @Input('appDateInput')
  get date() {
    return this._date;
  }
  set date(t: NgbDateStruct) {
    if ('' === t as any as string) {
      return;
    }
    if (this.nullable && !t) {
      return;
    }

    if (!this.dateIsValid(t)) {
      const today = new Date();
      t = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
    }

    if (t && this.dateIsAllowed(t)) {
      this._date = t;
      this.writeToInput();
    }
  }

  @HostListener('click', ['$event.target.value'])
  onClick(value) {
    const clickLocation = this.clickLocation();

    this._selectedGroup = SelectedGroup.Day;
    if (clickLocation < 7 && clickLocation > 4) {
      this._selectedGroup = SelectedGroup.Month;
    } else if (clickLocation < 4) {
      this._selectedGroup = SelectedGroup.Year;
    }
    this.highlight(this._selectedGroup);
  }
  @HostListener('blur', ['$event.target.value'])
  onBlur(value) {
    // validate and restore if invalid
    this.date = this.readFromInput();
  }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    let preventDefault = true;
    switch (event.key) {
      case 'ArrowDown':
      case 'Down':
        const downDate = this.down(this.readFromInput(), this._selectedGroup);
        this.date = this.dateIsAllowed(downDate) ? downDate : this.date;
        break;
      case 'ArrowUp':
      case 'Up':
        const upDate = this.up(this.readFromInput(), this._selectedGroup);
        this.date = this.dateIsAllowed(upDate) ? upDate : this.date;
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
        this.date = this.readFromInput();
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
  private up(date: NgbDateStruct, group: SelectedGroup): NgbDateStruct {
    const d = Object.assign({}, date);

    switch (group) {
      case SelectedGroup.Year:
        const currentYear = new Date().getFullYear();
        const y = date.year + 1;
        d.year = y > currentYear ? currentYear : y;
        break;
      case SelectedGroup.Month:
        if (this.allowedMonthValues) {
          const monthIndex = this.allowedMonthValues.indexOf(date.month) + 1;
          if (monthIndex >= this.allowedMonthValues.length) {
            d.month = this.allowedMonthValues[0];
            // d = this.up(d, SelectedGroup.Month);
          } else {
            d.month = this.allowedMonthValues[monthIndex];
          }
        } else {
          const m = date.month + 1;
          if (m > 12) {
            d.month = 1;
          } else {
            d.month = m;
          }
        }
        break;
      case SelectedGroup.Day:
        if (this.allowedDayValues) {
          const dayIndex = this.allowedDayValues.indexOf(date.day) + 1;
          if (dayIndex >= this.allowedDayValues.length) {
            d.day = this.allowedDayValues[0];
          } else {
            d.day = this.allowedDayValues[dayIndex];
          }
        } else {
          const dp = date.day + 1;
          const mon = date.month;
          const yr = date.year;
          if (dp > 28) {
            if (this.is31Days.includes(mon)) {
              if (dp <= 31) {
                d.day = dp;
              } else {
                d.day = 1;
              }
            } else if (this.is30Days.includes(mon)) {
              if (dp <= 30) {
                d.day = dp;
              } else {
                d.day = 1;
              }
            } else {
              // february
              if (this.isLeapYear(yr)) {
                if (dp <= 29) {
                  d.day = dp;
                } else {
                  d.day = 1;
                }
              } else {
                if (dp <= 28) {
                  d.day = dp;
                } else {
                  d.day = 1;
                }
              }
            }

          } else {
            d.day = dp;
          }
        }
        break;
      default:
        break;
    }

    return d;
  }
  // Handle down key per group and depending if an allowed list of value is provided or not
  private down(date: NgbDateStruct, group: SelectedGroup): NgbDateStruct {
    let d = Object.assign({}, date);

    switch (group) {
      case SelectedGroup.Year:
        const y = date.year - 1;
        d.year = y < this.oldestYear ? this.oldestYear : y;
        break;
      case SelectedGroup.Month:
        if (this.allowedMonthValues) {
          const monthIndex = this.allowedMonthValues.indexOf(date.month) - 1;
          if (monthIndex < 0) {
            d.month = this.allowedMonthValues[this.allowedMonthValues.length - 1];
            d = this.down(d, SelectedGroup.Month);
          } else {
            d.month = this.allowedMonthValues[monthIndex];
          }
        } else {
          const m = date.month - 1;
          if (m < 1) {
            d.month = 12;
          } else {
            d.month = m;
          }
        }
        break;
      case SelectedGroup.Day:
        if (this.allowedDayValues) {
          const dayIndex = this.allowedDayValues.indexOf(date.day) - 1;
          if (dayIndex < 0) {
            d.day = this.allowedDayValues[this.allowedDayValues.length - 1];
            d = this.down(d, SelectedGroup.Month);
          } else {
            d.day = this.allowedDayValues[dayIndex];
          }
        } else {
          const dp = date.day - 1;
          const mon = date.month;
          const yr = date.year;
          if (dp < 1) {
            if (this.is31Days.includes(mon)) {
              d.day = 31;
            } else if (this.is30Days.includes(mon)) {
              d.day = 30;
            } else {
              // february
              if (this.isLeapYear(yr)) {
                d.day = 29;
              } else {
                d.day = 28;
              }
            }
          } else {
            d.day = dp;
          }
        }
        break;
      default:
        break;
    }

    return d;
  }
  private left(group: SelectedGroup): boolean {
    let preventDefault = true;
    switch (group) {
      case SelectedGroup.Year:
        this.readFromInput();
        preventDefault = false;
        break;
      case SelectedGroup.Month:
        this._selectedGroup = SelectedGroup.Year;
        this.readFromInput();
        break;
      case SelectedGroup.Day:
        this._selectedGroup = SelectedGroup.Month;
        this.readFromInput();
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
      case SelectedGroup.Year:
        this.readFromInput();
        this._selectedGroup = SelectedGroup.Month;
        break;
      case SelectedGroup.Month:
        this.readFromInput();
        this._selectedGroup = SelectedGroup.Day;
        break;
      case SelectedGroup.Day:
        this.readFromInput();
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
      case SelectedGroup.Year:
        this.el.nativeElement.setSelectionRange(0, 4);
        break;
      case SelectedGroup.Month:
        this.el.nativeElement.setSelectionRange(5, 7);
        break;
      case SelectedGroup.Day:
        this.el.nativeElement.setSelectionRange(8, 10);
        break;
      default:
        this.highlight(SelectedGroup.Year);
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
  private readFromInput(): NgbDateStruct {
    if (this.ngControl) {
      if (this.ngControl.control) {
        return this.ngControl.control.value;
      }
    }
  }
  private writeToInput(): void {
    if (this.ngControl) {
      if (this.ngControl.control) {
        this.ngControl.control.setValue(this._date);
      }
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

  dateIsValid(date: NgbDateStruct): boolean {
    // guard against a null date
    if (!date) {
      return false;
    }

    const currentYear = new Date().getFullYear();
    const isLeap = this.isLeapYear(date.year);
    const month = date.month;

    if (!(this.isNumber(date.year) && (date.year >= this.oldestYear) && (date.year <= currentYear))) {
      return false;
    }
    if (!(this.isNumber(date.month) && (date.month >= 1) && (date.month <= 12))) {
      return false;
    }
    if (!(this.isNumber(date.day) && (date.day >= 1) &&
      ((this.is31Days.includes(month) && date.day <= 31) ||
        (this.is30Days.includes(month) && date.day <= 30) || (isLeap && date.day <= 29) || (!isLeap && date.day <= 28)))) {
      return false;
    }

    return true;
  }

  dateIsAllowed(date: NgbDateStruct): boolean {
    if (this.allowedYearValue) {
      if (!this.allowedYearValue.includes(date.year)) {
        return false;
      }
    }

    if (this.allowedDayValues) {
      if (!this.allowedDayValues.includes(date.day)) {
        return false;
      }
    }
    if (this.allowedMonthValues) {
      if (!this.allowedMonthValues.includes(date.month)) {
        return false;
      }
    }

    return true;
  }

  isLeapYear(year) {
    return (year % 100 === 0) ? (year % 400 === 0) : (year % 4 === 0);
  }

  constructor(private el: ElementRef,
    @Self()
    @Optional()
    private ngControl: NgControl
  ) {

  }
}
