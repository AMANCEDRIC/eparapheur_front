import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step-four',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-four.component.html'
})
export class StepFourComponent {
  @Input() loading = false;
  @Input() email = '';

  @Output() back = new EventEmitter<void>();
  @Output() submitOtp = new EventEmitter<{ otp: string }>();

  otp = '';

  onBack(): void {
    this.back.emit();
  }

  onSubmit(): void {
    if (!this.otp.trim()) {
      return;
    }
    this.submitOtp.emit({ otp: this.otp });
  }
}

