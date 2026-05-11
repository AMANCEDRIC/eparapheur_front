import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SignatureProgramDTO, SignatureProgramStepParticipantDTO } from '../../../core/models/signature-program.model';
import { DateFrPipe } from '../../date-fr.pipe';

@Component({
  selector: 'app-item-program',
  standalone: true,
  imports: [CommonModule, RouterModule, DateFrPipe],
  template: `
    <div
      class="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group h-full cursor-pointer"
      (click)="onDetailClick()">
      
      <!-- Card Header area -->
      <div class="h-24 bg-primary/5 p-4 flex items-start justify-between">
        <div class="size-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
          <span class="material-symbols-outlined text-primary text-[20px]">
            {{ program.programType === 'SIGNATURE' ? 'signature' : 'description' }}
          </span>
        </div>
        <span 
          class="px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded"
          [ngClass]="{
            'bg-emerald-100 text-emerald-700': program.status === 'ACTIVE',
            'bg-amber-100 text-amber-700': program.status === 'DRAFT' || program.status === 'PENDING',
            'bg-slate-100 text-slate-600': program.status === 'ARCHIVED' || program.status === 'CANCELLED'
          }">
          {{ program.status }}
        </span>
      </div>

      <!-- Card Body -->
      <div class="p-4 flex-1">
        <h3 class="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1" [title]="program.title">
          {{ program.title }}
        </h3>
        <p class="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
          {{ program.description || 'Aucune description disponible pour ce programme.' }}
        </p>
      </div>

      <!-- Card Footer -->
      <div class="px-4 py-3 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
        <!-- Signatories Avatars -->
        <div class="flex -space-x-2">
          <div
            *ngFor="let initials of getVisibleParticipants()"
            class="size-7 rounded-full border-2 border-white bg-slate-100 text-[9px] font-bold text-slate-600 flex items-center justify-center"
            [title]="initials">
            {{ initials }}
          </div>
          <div
            *ngIf="getExtraParticipantsCount() > 0"
            class="size-7 rounded-full border-2 border-white bg-slate-200 text-[9px] font-bold text-slate-500 flex items-center justify-center">
            +{{ getExtraParticipantsCount() }}
          </div>
        </div>

        <!-- Initiator -->
        <div class="flex items-center gap-2">
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Initiateur</span>
          <div 
            class="size-7 rounded-full ring-2 ring-primary/10 bg-primary text-white flex items-center justify-center text-[9px] font-bold"
            [title]="getInitiatorInitials()">
            {{ getInitiatorInitials() }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class ItemProgramComponent {
  @Input({ required: true }) program!: SignatureProgramDTO;
  @Output() actionClick = new EventEmitter<number>();

  onDetailClick(): void {
    this.actionClick.emit(this.program.id);
  }

  getParticipantInitials(participant: SignatureProgramStepParticipantDTO): string {
    const person = participant.account.person;
    if (person?.firstName || person?.lastName) {
      const first = (person.firstName || '').charAt(0).toUpperCase();
      const last = (person.lastName || '').charAt(0).toUpperCase();
      const initials = (first + last).trim();
      return initials || participant.account.login.slice(0, 2).toUpperCase();
    }
    return participant.account.login.slice(0, 2).toUpperCase();
  }

  private getAllParticipantInitials(): string[] {
    const accountMap = new Map<number, SignatureProgramStepParticipantDTO>();

    (this.program.steps || []).forEach(step => {
      (step.participants || []).forEach(p => {
        const accountId = p.account.id;
        if (!accountMap.has(accountId)) {
          accountMap.set(accountId, p);
        }
      });
    });

    return Array.from(accountMap.values()).map(p => this.getParticipantInitials(p));
  }

  getVisibleParticipants(): string[] {
    return this.getAllParticipantInitials().slice(0, 3);
  }

  getExtraParticipantsCount(): number {
    const total = this.getAllParticipantInitials().length;
    return total > 3 ? total - 3 : 0;
  }

  getInitiatorInitials(): string {
    const initiator: any = this.program.initiator;

    if (initiator?.person?.firstName || initiator?.person?.lastName) {
      const first = (initiator.person.firstName || '').charAt(0).toUpperCase();
      const last = (initiator.person.lastName || '').charAt(0).toUpperCase();
      const initials = (first + last).trim();
      return initials || (initiator.login ? initiator.login.slice(0, 2).toUpperCase() : 'IN');
    }

    if (initiator?.login) {
      return initiator.login.slice(0, 2).toUpperCase();
    }

    return 'IN';
  }
}
