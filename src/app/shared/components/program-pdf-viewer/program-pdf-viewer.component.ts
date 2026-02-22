import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';

// Configuration du worker PDF.js
declare const pdfjsLib: any;

@Component({
  selector: 'app-program-pdf-viewer',
  standalone: true,
  imports: [CommonModule, PdfViewerModule],
  templateUrl: './program-pdf-viewer.component.html'
})
export class ProgramPdfViewerComponent implements OnInit {
  @Input() src: string | Uint8Array | null = null;
  @Input() page: number = 1;
  @Input() zoom: number = 0.8; // Zoom par défaut un peu réduit

  minZoom = 0.5;
  maxZoom = 2;
  zoomStep = 0.1;

  // 'scroll' = toutes les pages, 'page' = une page à la fois
  viewMode: 'scroll' | 'page' = 'scroll';
  totalPages = 0;

  ngOnInit(): void {
    // Configuration du worker PDF.js
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';
    }
  }

  get showAll(): boolean {
    return this.viewMode === 'scroll';
  }

  // ----- Zoom -----
  zoomIn(): void {
    this.zoom = Math.min(this.zoom + this.zoomStep, this.maxZoom);
  }

  zoomOut(): void {
    this.zoom = Math.max(this.zoom - this.zoomStep, this.minZoom);
  }

  resetZoom(): void {
    this.zoom = 0.8;
  }

  // ----- Changement de mode -----
  setViewMode(mode: 'scroll' | 'page'): void {
    this.viewMode = mode;
    if (this.viewMode === 'page' && this.page < 1) {
      this.page = 1;
    }
  }

  // ----- Navigation par page -----
  nextPage(): void {
    if (this.totalPages && this.page < this.totalPages) {
      this.page++;
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  onPageRendered(event: any): void {
    // Point d'accroche pour placer visuellement les zones de signature
    // À implémenter plus tard pour la gestion des signatures
  }

  onAfterLoadComplete(pdf: any): void {
    // pdf.numPages contient le nombre total de pages
    this.totalPages = pdf.numPages || 0;
    // On s'assure que la page actuelle est dans les bornes
    if (this.page > this.totalPages) {
      this.page = this.totalPages;
    }
  }
}

