import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="total > 0" class="mt-4 bg-gray-50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-4">
      <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <div class="text-sm text-gray-700">
          Affichage de {{ (page - 1) * pageSize + 1 }} à {{ Math.min(page * pageSize, total) }} sur {{ total }} résultats
        </div>
        <div class="flex items-center space-x-2">
          <label for="pageSize" class="text-sm text-gray-700">Éléments par page :</label>
          <select
            id="pageSize"
            [(ngModel)]="pageSize"
            (change)="onPageSizeChange()"
            class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option *ngFor="let size of pageSizeOptions" [value]="size">{{ size }}</option>
          </select>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button
          (click)="onPageChange(1)"
          [disabled]="page === 1"
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Première page">
          ««
        </button>
        <button
          (click)="onPageChange(page - 1)"
          [disabled]="page === 1"
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Précédent
        </button>
        <span class="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">
          Page {{ page }} sur {{ getTotalPages() }}
        </span>
        <button
          (click)="onPageChange(page + 1)"
          [disabled]="page >= getTotalPages()"
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Suivant
        </button>
        <button
          (click)="onPageChange(getTotalPages())"
          [disabled]="page >= getTotalPages()"
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Dernière page">
          »»
        </button>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() total = 0;
  @Input() page = 1;
  @Input() pageSize = 20;
  @Input() pageSizeOptions = [10, 20, 50, 100];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(): void {
    this.pageSizeChange.emit(this.pageSize);
  }

  getTotalPages(): number {
    return Math.ceil(this.total / this.pageSize) || 1;
  }

  protected readonly Math = Math;
}
