import {
  Component, ChangeDetectionStrategy, OnInit, Input, Self, Optional
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ControlValueAccessor, NgControl } from '@angular/forms';


// Based on https://ackerapple.github.io/angular-file/
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dnv-file-uploader',
  templateUrl: './dnv-file-uploader.component.html',
  styleUrls: ['./dnv-file-uploader.component.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DnvFileUploaderComponent implements OnInit, ControlValueAccessor {
  @Input() fileFieldID = 'file-upload';
  @Input() disabled: boolean;

  accept = '*';
  files: File[] = [];
  hasBaseDropZoneOver = false;
  httpEmitter: Subscription;
  dragFiles: any;
  lastInvalids: any;
  fileDropDisabled: any;
  maxSize: any;
  baseDropValid: any;

  constructor(
    @Self()
    @Optional()
    private ngControl: NgControl
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  filesChange(event: File[]): void {
    this.files = event;
    this.onChange(event);
  }

  ngOnInit(): void { }

  writeValue(value: File[]): void {
    if (value) {
      this.files = value;
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private onChange(_: any) { }
  private onTouched(_: any) { }

}
