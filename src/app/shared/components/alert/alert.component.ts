import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

export type AppAlertType = 'success' | 'error' | 'warning' | 'info';


@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.sass'
})
export class AlertComponent {
  @Input() type: AppAlertType = 'info';
  @Input() title?: string;
  @Input() message: string = '';
  @Input() closable = true;

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    if (this.closable) {
      this.close.emit();
    }
  }

  get icon(): string {
    switch (this.type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'exclamation-circle';
      case 'warning':
        return 'exclamation-triangle';
      default:
        return 'information-circle';
    }
  }

}
