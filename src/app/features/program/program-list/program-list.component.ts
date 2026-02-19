import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProgramService } from '../../../core/services/program.service';
import { SignatureProgramDTO } from '../../../core/models/signature-program.model';
import { IPaginatedResponse } from '../../../core/models';

@Component({
  selector: 'app-program-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
}


