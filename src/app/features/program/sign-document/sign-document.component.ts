import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgramPdfViewerComponent, PlacementResult } from '../../../shared/components/program-pdf-viewer/program-pdf-viewer.component';
import { SignatureService } from '../../../core/services/signature.service';
import { AppNotificationService } from '../../../core/services/app-notification.service';
import { IApiResponse } from '../../../core/models';
import { SignatureActionResult, SignatureVisual } from '../../../core/models/signature.model';

@Component({
  selector: 'app-sign-document',
  standalone: true,
  imports: [CommonModule, FormsModule, ProgramPdfViewerComponent],
  templateUrl: './sign-document.component.html'
})
export class SignDocumentComponent implements OnInit {
  @Input({ required: true }) documentId!: number;
  @Input({ required: true }) documentBlobUrl!: string;
  @Input({ required: true }) participantId!: number;
  @Input({ required: true }) accountId!: number;
  @Input({ required: true }) email!: string;

  @Output() closed = new EventEmitter<void>();
  @Output() signed = new EventEmitter<SignatureActionResult>();

  @ViewChild('drawCanvas') drawCanvasRef?: ElementRef<HTMLCanvasElement>;

  step = 0; // 0: visuel, 1: position, 2: OTP, 3: confirmation (exécution)

  visuals: SignatureVisual[] = [];
  selectedVisualId: number | null = null;
  newVisualLabel = 'Ma signature';
  newVisualTab: 'upload' | 'draw' = 'upload';
  uploadFileName = '';
  /** Data URL d’affichage pour l’import fichier (étape 1) */
  uploadDataUrl: string | null = null;
  uploadBase64: string | null = null; // public pour le template (désactiver le bouton)
  /** Data URL retenu pour l’aperçu dans le PDF (fichier, dessin, ou visuel de liste). */
  placementDataUrl: string | null = null;
  idLastCreatedVisual: number | null = null;
  lastDrawDataUrl: string | null = null;

  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private drawCtx: CanvasRenderingContext2D | null = null;
  private hasDrawnStroke = false;

  placement: PlacementResult | null = null;
  pageForViewer = 1;

  otp = '';
  sendingOtp = false;
  loading = false;
  listLoading = false;
  finalizing = false;

  constructor(
    private readonly signatureService: SignatureService,
    private readonly appNotificationService: AppNotificationService
  ) {}

  ngOnInit(): void {
    this.loadVisuals();
  }

  loadVisuals(): void {
    this.listLoading = true;
    this.signatureService.listVisuals(this.accountId).subscribe({
      next: (res) => {
        this.listLoading = false;
        if (res.status_code === 7000 && Array.isArray(res.data)) {
          this.visuals = res.data.filter((v) => v.active);
          const def = this.visuals.find((v) => v.default);
          const keep = this.selectedVisualId;
          if (keep && this.visuals.some((v) => v.id === keep)) {
            this.selectedVisualId = keep;
          } else {
            this.selectedVisualId = def?.id ?? this.visuals[0]?.id ?? null;
          }
          this.syncPlacementPreviewForSelection();
        } else {
          this.visuals = [];
        }
      },
      error: (err) => {
        this.listLoading = false;
        this.appNotificationService.error(
          err?.error?.status_message || 'Impossible de charger les visuels de signature',
          'E-Parapheur'
        );
        console.error(err);
      }
    });
  }

  private initDrawContext(canvas: HTMLCanvasElement): void {
    this.drawCtx = canvas.getContext('2d');
    if (this.drawCtx) {
      this.drawCtx.lineWidth = 2;
      this.drawCtx.lineCap = 'round';
      this.drawCtx.lineJoin = 'round';
      this.drawCtx.strokeStyle = '#0f172a';
    }
  }

  drawStart(ev: PointerEvent, canvas: HTMLCanvasElement): void {
    if (!this.drawCtx) {
      this.initDrawContext(canvas);
    }
    this.isDrawing = true;
    const r = canvas.getBoundingClientRect();
    this.lastX = ev.clientX - r.left;
    this.lastY = ev.clientY - r.top;
  }

  drawMove(ev: PointerEvent, canvas: HTMLCanvasElement): void {
    if (!this.isDrawing || !this.drawCtx) {
      return;
    }
    const r = canvas.getBoundingClientRect();
    const x = ev.clientX - r.left;
    const y = ev.clientY - r.top;
    this.hasDrawnStroke = true;
    this.drawCtx.beginPath();
    this.drawCtx.moveTo(this.lastX, this.lastY);
    this.drawCtx.lineTo(x, y);
    this.drawCtx.stroke();
    this.lastX = x;
    this.lastY = y;
  }

  drawEnd(): void {
    this.isDrawing = false;
  }

  clearDraw(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    this.hasDrawnStroke = false;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.uploadFileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.uploadDataUrl = dataUrl;
      this.uploadBase64 = dataUrl.split(',')[1] ?? null;
      this.selectedVisualId = null;
      this.idLastCreatedVisual = null;
    };
    reader.readAsDataURL(file);
  }

  uploadFileVisual(): void {
    if (!this.uploadBase64) {
      this.appNotificationService.warning('Choisissez une image (PNG, JPEG).', 'E-Parapheur');
      return;
    }
    this.loading = true;
    this.signatureService
      .uploadVisual({
        accountId: this.accountId,
        label: this.newVisualLabel || 'Importée',
        type: 'uploaded',
        image: this.uploadBase64
      })
      .subscribe({
        next: (res) => this.onUploadResponse(res, this.uploadDataUrl, 'file')
      });
  }

  drawAndSaveVisual(): void {
    const canvas = this.drawCanvasRef?.nativeElement;
    if (!canvas) {
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    if (!base64 || !this.hasDrawnStroke) {
      this.appNotificationService.warning('Dessinez votre signature.', 'E-Parapheur');
      return;
    }
    this.loading = true;
    this.signatureService
      .uploadVisual({
        accountId: this.accountId,
        label: this.newVisualLabel || 'Dessinée',
        type: 'drawn',
        image: base64
      })
      .subscribe({
        next: (res) => this.onUploadResponse(res, dataUrl, 'draw')
      });
  }

  private onUploadResponse(
    res: IApiResponse<SignatureVisual>,
    dataUrl: string | null,
    kind: 'file' | 'draw'
  ): void {
    this.loading = false;
    if (res.status_code === 7000 && res.data) {
      this.appNotificationService.success('Visuel enregistré.', 'E-Parapheur');
      this.idLastCreatedVisual = res.data.id;
      this.selectedVisualId = res.data.id;
      this.placementDataUrl = dataUrl;
      if (kind === 'draw') {
        this.lastDrawDataUrl = dataUrl;
      } else {
        this.lastDrawDataUrl = null;
      }
      this.loadVisuals();
    } else {
      this.appNotificationService.error(
        res.status_message || "Échec de l'enregistrement",
        'E-Parapheur'
      );
    }
  }

  onSelectExistingVisual(visual: SignatureVisual): void {
    this.selectedVisualId = visual.id;
    this.syncPlacementPreviewForSelection();
  }

  private syncPlacementPreviewForSelection(): void {
    this.placementDataUrl = null;
    if (!this.selectedVisualId) {
      return;
    }
    if (this.idLastCreatedVisual === this.selectedVisualId) {
      this.placementDataUrl =
        this.lastDrawDataUrl || this.uploadDataUrl || this.placeholderDataUrl();
      return;
    }
    this.placementDataUrl = this.placeholderDataUrl();
  }

  private placeholderDataUrl(): string {
    const c = document.createElement('canvas');
    c.width = 200;
    c.height = 64;
    const x = c.getContext('2d');
    if (x) {
      x.fillStyle = '#eef2ff';
      x.fillRect(0, 0, 200, 64);
      x.fillStyle = '#312e81';
      x.font = 'bold 12px system-ui, sans-serif';
      x.fillText('Signature enregistrée', 8, 38);
    }
    return c.toDataURL('image/png');
  }

  canNextFromStep0(): boolean {
    return this.selectedVisualId != null;
  }

  onPlacementChange(p: PlacementResult): void {
    this.placement = p;
  }

  goToPlacement(): void {
    if (!this.canNextFromStep0()) {
      return;
    }
    this.syncPlacementPreviewForSelection();
    this.placement = null;
    this.step = 1;
  }

  goToOtpStep(): void {
    if (!this.placement) {
      this.appNotificationService.warning("Positionnez le cadre d'abord, puis relâchez le curseur pour enregistrer la position.", 'E-Parapheur');
      return;
    }
    this.step = 2;
  }

  requestOtp(): void {
    this.sendingOtp = true;
    this.signatureService.sendSignatureOtp(this.email).subscribe({
      next: (res) => {
        this.sendingOtp = false;
        if (res.status_code === 7000) {
          this.appNotificationService.success("Un code OTP a été envoyé sur votre e-mail.", 'E-Parapheur');
        } else {
          this.appNotificationService.error(
            res.status_message || "Erreur d'envoi du code",
            'E-Parapheur'
          );
        }
      },
      error: (err) => {
        this.sendingOtp = false;
        this.appNotificationService.error(
          err?.error?.status_message || "Erreur d'envoi du code",
          'E-Parapheur'
        );
        console.error(err);
      }
    });
  }

  goToConfirmStep(): void {
    if (this.otp.trim().length !== 6) {
      this.appNotificationService.warning('Saisissez le code à 6 chiffres.', 'E-Parapheur');
      return;
    }
    this.step = 3;
  }

  executeSign(): void {
    if (!this.placement) {
      return;
    }
    this.finalizing = true;
    this.signatureService
      .executeSignature({
        participantId: this.participantId,
        documentId: this.documentId,
        otp: this.otp.trim(),
        visualId: this.selectedVisualId ?? undefined,
        x: this.placement.x,
        y: this.placement.y,
        page: this.placement.page
      })
      .subscribe({
        next: (res) => {
          this.finalizing = false;
          if (res.status_code === 7000 && res.data) {
            this.appNotificationService.success('Signature effectuée avec succès', 'E-Parapheur');
            this.signed.emit(res.data);
            this.closed.emit();
          } else {
            this.appNotificationService.error(
              res.status_message || 'Échec de la signature',
              'E-Parapheur'
            );
          }
        },
        error: (err) => {
          this.finalizing = false;
          this.appNotificationService.error(
            err?.error?.status_message || 'Erreur lors de la signature',
            'E-Parapheur'
          );
          console.error(err);
        }
      });
  }

  onClose(): void {
    this.closed.emit();
  }

  prevStep(): void {
    if (this.step > 0) {
      this.step--;
    }
  }
}
