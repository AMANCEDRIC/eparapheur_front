import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-program-step-four',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './program-step-four.component.html'
})
export class ProgramStepFourComponent {
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


