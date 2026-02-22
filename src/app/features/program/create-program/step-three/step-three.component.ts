import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CreateSignatureProgramRequest
} from '../../../../core/models/signature-program.model';

@Component({
  selector: 'app-step-three',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-three.component.html'
})
export class StepThreeComponent {
  @Input() program!: Omit<CreateSignatureProgramRequest, 'otp' | 'email'>;
  @Input() loading = false;

  @Output() back = new EventEmitter<void>();
  @Output() requestOtp = new EventEmitter<void>();

  onBack(): void {
    this.back.emit();
  }

  onRequestOtp(): void {
    this.requestOtp.emit();
  }
}

