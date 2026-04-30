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
      class="relative flex flex-col justify-between rounded-2xl bg-white/80 backdrop-blur
             border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5
             transition-all duration-200 p-4 h-full">

      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <h2 class="text-base font-semibold text-slate-900 mb-1 line-clamp-2" [title]="program.title">
            {{ program.title }}
          </h2>
          <p class="text-[11px] uppercase tracking-wide app-label-important">
            Type :
            <span class="font-medium text-slate-700">
              {{ program.programType }}
            </span>
          </p>
        </div>

        <span
          class="app-badge flex-shrink-0"
          [ngClass]="{
            'app-badge-success': program.status === 'ACTIVE' || program.status === 'DRAFT',
            'app-badge-danger': program.status === 'CANCELLED'
          }">
          {{ program.status }}
        </span>
      </div>

      <div class="mt-3 space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[11px] app-label-important">Signataires</span>
          <span class="text-[11px] app-label-important">Initiateur</span>
        </div>

        <div class="flex items-center justify-between rounded-full bg-slate-50 px-3 py-1.5">
          <!-- Signataires -->
          <div class="flex items-center gap-1 -space-x-1.5">
            <div
              *ngFor="let initials of getVisibleParticipants()"
              class="h-7 w-7 rounded-full bg-slate-200 text-[11px] text-slate-600
             flex items-center justify-center border border-white">
              {{ initials }}
            </div>
            <div
              *ngIf="getExtraParticipantsCount() > 0"
              class="h-7 w-7 rounded-full bg-slate-100 text-[10px] text-slate-500
             flex items-center justify-center border border-dashed border-slate-300">
              +{{ getExtraParticipantsCount() }}
            </div>
          </div>

          <div
            class="h-7 w-7 rounded-full app-bg-primary text-[11px] text-white
           flex items-center justify-center border border-white">
            {{ getInitiatorInitials() }}
          </div>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-500">
        <div>
          <div class="uppercase tracking-wide text-[10px] app-label-important">Début</div>
          <div class="font-medium text-slate-800">
            {{ program.startDate | dateFr:'short' }}
          </div>
        </div>
        <div>
          <div class="uppercase tracking-wide text-[10px] app-label-important">Fin</div>
          <div class="font-medium text-slate-800">
            {{ program.endDate | dateFr:'short' }}
          </div>
        </div>
      </div>

      <!-- Pied de carte : action discrète avec icône oeil -->
      <div class="mt-5 flex items-center justify-between text-xs text-slate-500">
        <div class="text-[11px] text-slate-400 line-clamp-1 flex-1 mr-2">
          {{ program.description }}
        </div>

        <button
          (click)="onDetailClick()"
          class="app-btn app-btn-outline px-2 py-1 rounded border border-slate-300 hover:bg-slate-100 flex-shrink-0"
          title="Voir le détail">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
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
      const initials = `${first}${last}`.trim();
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
      const initials = `${first}${last}`.trim();
      return initials || (initiator.login ? initiator.login.slice(0, 2).toUpperCase() : 'IN');
    }

    if (initiator?.login) {
      return initiator.login.slice(0, 2).toUpperCase();
    }

    return 'IN';
  }
}
