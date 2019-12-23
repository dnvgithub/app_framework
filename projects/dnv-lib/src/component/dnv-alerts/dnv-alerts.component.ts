import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'dnv-alerts',
  template: `
    <div class="dnv-alerts {{level}}" [hidden]="hidden">
    <i class="fas fa-times-circle"></i> {{message}}
    <a id="dnv-retry" class="btn btn-sm btn-link alert-link" (click)="retryClicked()">Retry</a>
    </div>
    `,
  styles: []
})
export class DnvAlertsComponent {
  @Input() message: string;
  @Input() hidden: boolean;
  @Input() level: string;

  @Output() onRetry = new EventEmitter();

  retryClicked() {
    this.onRetry.emit();
  }
}
