import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';

// Configuration du worker PDF.js
declare const pdfjsLib: any;

export type PlacementResult = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

@Component({
  selector: 'app-program-pdf-viewer',
  standalone: true,
  imports: [CommonModule, PdfViewerModule],
  templateUrl: './program-pdf-viewer.component.html'
})
export class ProgramPdfViewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() src: string | Uint8Array | null = null;
  @Input() page: number = 1;
  @Input() zoom: number = 0.8; // Zoom par défaut un peu réduit
  @Input() placementMode = false;
  @Input() placementImage: string | null = null; // data URL
  @Input() placementSize: { width: number; height: number } = { width: 150, height: 60 };
  @Output() placementChange = new EventEmitter<PlacementResult>();
  @Output() pageChangeOutput = new EventEmitter<number>();

  minZoom = 0.5;
  maxZoom = 2;
  zoomStep = 0.1;

  // 'scroll' = toutes les pages, 'page' = une page à la fois
  viewMode: 'scroll' | 'page' = 'scroll';
  totalPages = 0;
  private savedViewMode: 'scroll' | 'page' = 'scroll';

  private activeDragCleanup: (() => void) | null = null;
  private lastEventSource: { pageNumber: number; viewport: any } | null = null;
  private lastBoxPosition: { left: number; top: number; page: number } | null = null;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {}

  /** En mode placement : une seule page à la fois, pour positionner le cadre. */
  get effectiveShowAll(): boolean {
    if (this.placementMode) {
      return false;
    }
    return this.viewMode === 'scroll';
  }

  get showAll(): boolean {
    return this.viewMode === 'scroll';
  }

  ngOnInit(): void {
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['placementMode'] || changes['placementImage']) {
      if (this.placementMode) {
        this.savedViewMode = this.viewMode;
        this.viewMode = 'page';
        if (this.page < 1) {
          this.page = 1;
        }
      } else {
        this.viewMode = this.savedViewMode;
        this.removeAllPlacementOverlays();
        this.clearDrag();
      }
    }
  }

  ngOnDestroy(): void {
    this.removeAllPlacementOverlays();
    this.clearDrag();
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
    if (this.placementMode) {
      return;
    }
    this.viewMode = mode;
    if (this.viewMode === 'page' && this.page < 1) {
      this.page = 1;
    }
  }

  // ----- Navigation par page -----
  nextPage(): void {
    if (this.totalPages && this.page < this.totalPages) {
      this.page++;
      this.lastBoxPosition = null;
      this.pageChangeOutput.emit(this.page);
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.lastBoxPosition = null;
      this.pageChangeOutput.emit(this.page);
    }
  }

  onPageRendered(event: any): void {
    if (this.placementMode && this.placementImage) {
      const e = event?.detail && typeof event.detail === 'object' ? event.detail : event;
      const pageNumber = e?.pageNumber ?? 0;
      const pageDiv = e?.source?.div;
      const viewport = e?.source?.viewport;
      if (!pageNumber || !pageDiv || !viewport) {
        return;
      }
      if (pageNumber !== this.page) {
        return;
      }
      this.lastEventSource = { pageNumber, viewport };
      this.removePlacementOverlaysInPageDiv(pageDiv);
      this.installPlacementBox(pageNumber, pageDiv, viewport);
    } else if (!this.placementMode) {
      this.removeAllPlacementOverlays();
    }
  }

  onAfterLoadComplete(pdf: { numPages?: number }): void {
    this.totalPages = pdf.numPages || 0;
    if (this.page > this.totalPages) {
      this.page = this.totalPages;
    }
  }

  private clearDrag(): void {
    if (this.activeDragCleanup) {
      this.activeDragCleanup();
      this.activeDragCleanup = null;
    }
  }

  private removeAllPlacementOverlays(): void {
    this.elementRef.nativeElement.querySelectorAll('.sig-placement-box').forEach((el) => {
      el.remove();
    });
  }

  private removePlacementOverlaysInPageDiv(pageDiv: HTMLElement): void {
    pageDiv.querySelectorAll('.sig-placement-box').forEach((el) => {
      el.remove();
    });
  }

  private installPlacementBox(
    pageNumber: number,
    pageDiv: HTMLElement,
    viewport: { convertToPdfPoint: (x: number, y: number) => number[]; width: number; height: number }
  ): void {
    this.clearDrag();

    const w = this.placementSize.width;
    const h = this.placementSize.height;
    this.renderer.setStyle(pageDiv, 'position', 'relative');

    const pw = pageDiv.clientWidth || 0;
    const ph = pageDiv.clientHeight || 0;
    let left: number;
    let top: number;
    if (
      this.lastBoxPosition &&
      this.lastBoxPosition.page === pageNumber
    ) {
      left = this.lastBoxPosition.left;
      top = this.lastBoxPosition.top;
    } else {
      left = Math.max(8, pw - w - 24);
      top = Math.max(8, ph - h - 24);
    }
    left = this.clamp(left, 0, Math.max(0, pw - w));
    top = this.clamp(top, 0, Math.max(0, ph - h));

    const box = this.renderer.createElement('div') as HTMLDivElement;
    this.renderer.addClass(box, 'sig-placement-box');
    this.renderer.setStyle(box, 'position', 'absolute');
    this.renderer.setStyle(box, 'left', `${left}px`);
    this.renderer.setStyle(box, 'top', `${top}px`);
    this.renderer.setStyle(box, 'width', `${w}px`);
    this.renderer.setStyle(box, 'height', `${h}px`);
    this.renderer.setStyle(box, 'zIndex', '20');
    this.renderer.setStyle(box, 'boxSizing', 'border-box');
    this.renderer.setStyle(box, 'border', '2px dashed #4f46e5');
    this.renderer.setStyle(box, 'background', 'rgba(255,255,255,0.9)');
    this.renderer.setStyle(box, 'cursor', 'move');
    this.renderer.setStyle(box, 'userSelect', 'none');
    this.renderer.setStyle(box, 'touchAction', 'none');

    const img = this.renderer.createElement('img') as HTMLImageElement;
    img.setAttribute('src', this.placementImage!);
    this.renderer.setStyle(img, 'width', '100%');
    this.renderer.setStyle(img, 'height', '100%');
    this.renderer.setStyle(img, 'objectFit', 'contain');
    this.renderer.setStyle(img, 'pointerEvents', 'none');
    this.renderer.appendChild(box, img);
    this.renderer.appendChild(pageDiv, box);

    const getLocalPoint = (clientX: number, clientY: number) => {
      const r = pageDiv.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    };

    let startX = 0;
    let startY = 0;
    let startLeft = left;
    let startTop = top;

    const onPointerMove = (e: PointerEvent) => {
      e.preventDefault();
      const p = getLocalPoint(e.clientX, e.clientY);
      const nextLeft = this.clamp(
        startLeft + (p.x - startX),
        0,
        Math.max(0, pageDiv.clientWidth - w)
      );
      const nextTop = this.clamp(
        startTop + (p.y - startY),
        0,
        Math.max(0, pageDiv.clientHeight - h)
      );
      this.renderer.setStyle(box, 'left', `${nextLeft}px`);
      this.renderer.setStyle(box, 'top', `${nextTop}px`);
    };

    const onPointerUp = (e: PointerEvent) => {
      e.preventDefault();
      const finalLeft = parseFloat(box.style.left) || 0;
      const finalTop = parseFloat(box.style.top) || 0;
      this.lastBoxPosition = { left: finalLeft, top: finalTop, page: pageNumber };
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      this.activeDragCleanup = null;
      this.emitPlacement(pageNumber, viewport, finalLeft, finalTop);
    };

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      const p = getLocalPoint(e.clientX, e.clientY);
      startX = p.x;
      startY = p.y;
      startLeft = parseFloat(box.style.left) || left;
      startTop = parseFloat(box.style.top) || top;
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp, { once: true });
      this.activeDragCleanup = () => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
      };
    };

    this.renderer.listen(box, 'pointerdown', onPointerDown);
    this.emitPlacement(pageNumber, viewport, left, top);
  }

  private emitPlacement(
    pageNumber: number,
    viewport: { convertToPdfPoint: (x: number, y: number) => number[] },
    left: number,
    top: number
  ): void {
    const w = this.placementSize.width;
    const h = this.placementSize.height;
    const topleft = viewport.convertToPdfPoint(left, top);
    const topright = viewport.convertToPdfPoint(left + w, top);
    const bottomleft = viewport.convertToPdfPoint(left, top + h);
    const wPdf = Math.abs(topright[0] - topleft[0]);
    const hPdf = Math.abs(topleft[1] - bottomleft[1]);
    const anchor = viewport.convertToPdfPoint(left, top + h);
    this.placementChange.emit({
      page: pageNumber,
      x: anchor[0],
      y: anchor[1],
      width: wPdf,
      height: hPdf
    });
  }

  private clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
  }
}