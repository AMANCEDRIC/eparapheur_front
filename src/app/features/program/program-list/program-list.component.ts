import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProgramService } from '../../../core/services/program.service';
import { SignatureProgramDTO } from '../../../core/models/signature-program.model';
import { IPaginatedResponse } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ItemProgramComponent } from '../../../shared/components/item-program/item-program.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-program-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingSpinnerComponent,
    ItemProgramComponent,
    PaginationComponent
  ],
  templateUrl: './program-list.component.html',
})
export class ProgramListComponent implements OnInit {
  programs: SignatureProgramDTO[] = [];
  loading = false;
  error = '';
  page = 1;
  pageSize = 20;
  total = 0;
  pageSizeOptions = [10, 20, 50, 100];
  listType: 'all' | 'creations' | 'involved' = 'all';

  constructor(
    private programService: ProgramService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.listType = data['listType'] || 'all';
      this.page = 1; // Reset to first page on type change
      this.loadPrograms();
    });
  }

  loadPrograms(): void {
    this.loading = true;
    this.error = '';

    const obs = this.getObservableForType();

    obs.subscribe({
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

  private getObservableForType() {
    switch (this.listType) {
      case 'creations':
        return this.programService.getMyCreations(this.page, this.pageSize);
      case 'involved':
        return this.programService.getInvolvingMe(this.page, this.pageSize);
      default:
        return this.programService.getPrograms(this.page, this.pageSize);
    }
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadPrograms();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.page = 1;
    this.loadPrograms();
  }

  onViewDetail(programId: number): void {
    this.router.navigate(['/dashboard/programs', programId]);
  }

  getListTitle(): string {
    switch (this.listType) {
      case 'creations':
        return 'Mes programmes créés';
      case 'involved':
        return 'Programmes me concernant';
      default:
        return 'Tous les programmes de signature';
    }
  }

  getListDescription(): string {
    switch (this.listType) {
      case 'creations':
        return 'Consultez les programmes dont vous êtes l’initiateur.';
      case 'involved':
        return 'Consultez les programmes où vous êtes impliqué (initiateur ou participant).';
      default:
        return 'Consultez tous les programmes de signature de la plateforme.';
    }
  }
}


