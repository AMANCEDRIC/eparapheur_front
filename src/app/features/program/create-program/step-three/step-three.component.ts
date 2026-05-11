import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CreateSignatureProgramRequest,
  SignatureProgramStepRequest
} from '../../../../core/models/signature-program.model';
import { IAccountDetail } from '../../../../core/models';

@Component({
  selector: 'app-step-three',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-three.component.html'
})
export class StepThreeComponent {
  @Input() program!: Omit<CreateSignatureProgramRequest, 'otp' | 'email'>;
  @Input() loading = false;
  @Input() users: IAccountDetail[] = [];

  @Output() back = new EventEmitter<void>();
  @Output() requestOtp = new EventEmitter<void>();

  onBack(): void {
    this.back.emit();
  }

  getTotalParticipants(): number {
    if (!this.program.steps) return 0;
    const ids = new Set<number>();
    this.program.steps.forEach(step => {
      step.participants.forEach(p => ids.add(p.accountId));
    });
    return ids.size;
  }

  onRequestOtp(): void {
    this.requestOtp.emit();
  }

  getStepDocumentsLabel(step: SignatureProgramStepRequest): string {
    if (!step.documentIds || step.documentIds.length === 0) {
      return 'aucun';
    }

    if (!this.program || !this.program.documents) {
      return step.documentIds.join(', ');
    }

    const labels = step.documentIds
      .map(index => this.program.documents[index])
      .filter(doc => !!doc)
      .map((doc, idx) => `${idx + 1}. ${doc!.documentName}`);

    return labels.join(', ');
  }

  getUserLabel(user: IAccountDetail): string {
    if (user.person) {
      const first = user.person.firstName ?? '';
      const last = user.person.lastName ?? '';
      const full = `${first} ${last}`.trim();
      if (full) {
        return `${full} (${user.login})`;
      }
    }
    return user.login;
  }

  getParticipantName(accountId: number): string {
    const user = this.users.find(u => u.id === accountId);
    if (user) {
      return this.getUserLabel(user);
    }
    return `Compte #${accountId}`;
  }

  getDocumentLabel(index: number): string {
    if (!this.program || !this.program.documents) {
      return `Document ${index + 1}`;
    }
    const doc = this.program.documents[index];
    if (!doc) {
      return `Document ${index + 1}`;
    }
    return doc.documentName || doc.documentPath || `Document ${index + 1}`;
  }
}

