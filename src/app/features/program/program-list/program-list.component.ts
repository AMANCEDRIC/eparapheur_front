import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProgramService } from '../../../core/services/program.service';
import {SignatureProgramDTO, SignatureProgramStepParticipantDTO} from '../../../core/models/signature-program.model';
import { IPaginatedResponse } from '../../../core/models';
import { DateFrPipe } from '../../../shared/date-fr.pipe';
import {LoadingSpinnerComponent} from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-program-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DateFrPipe, LoadingSpinnerComponent],
  templateUrl: './program-list.component.html',
  // styleUrl: './program-list.component.sass'
})
export class ProgramListComponent implements OnInit {
  programs: SignatureProgramDTO[] = [];
  loading = false;
  error = '';
  page = 1;
  pageSize = 20;
  total = 0;
  pageSizeOptions = [10, 20, 50, 100];

  constructor(private programService: ProgramService) {}

  ngOnInit(): void {
    this.loadPrograms();
  }

  loadPrograms(): void {
    this.loading = true;
    this.error = '';

    this.programService.getPrograms(this.page, this.pageSize).subscribe({
      next: (response: IPaginatedResponse<SignatureProgramDTO>) => {
        if (response.statusCode === 7000) {
          this.programs = response.data.items;
          this.total = response.data.total;
          this.page = response.data.page;
          this.pageSize = response.data.pageSize;
        } else {
          this.error = response.statusMessage || 'Erreur lors du chargement des programmes';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des programmes';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.page = page;
      this.loadPrograms();
    }
  }

  onPageSizeChange(): void {
    this.page = 1;
    this.loadPrograms();
  }

  getTotalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get Math() {
    return Math;
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

  private getAllParticipantInitials(program: SignatureProgramDTO): string[] {
    const accountMap = new Map<number, SignatureProgramStepParticipantDTO>();

    (program.steps || []).forEach(step => {
      (step.participants || []).forEach(p => {
        const accountId = p.account.id;
        if (!accountMap.has(accountId)) {
          accountMap.set(accountId, p);
        }
      });
    });

    return Array.from(accountMap.values()).map(p => this.getParticipantInitials(p));
  }

  getVisibleParticipants(program: SignatureProgramDTO): string[] {
    return this.getAllParticipantInitials(program).slice(0, 3);
  }

  getExtraParticipantsCount(program: SignatureProgramDTO): number {
    const total = this.getAllParticipantInitials(program).length;
    return total > 3 ? total - 3 : 0;
  }

  getInitiatorInitials(program: SignatureProgramDTO): string {
    const initiator: any = program.initiator;

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


