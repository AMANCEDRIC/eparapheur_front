import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SignatureService } from '../../core/services/signature.service';
import { AppNotificationService } from '../../core/services/app-notification.service';
import { IApiResponse } from '../../core/models';
import { SignatureVisual } from '../../core/models/signature.model';

@Component({
  selector: 'app-signature-visuals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signature-visuals.component.html'
})
export class SignatureVisualsComponent implements OnInit {
  @ViewChild('drawCanvas') drawCanvasRef?: ElementRef<HTMLCanvasElement>;

  accountId: number | null = null;
  visuals: SignatureVisual[] = [];
  listLoading = false;
  saving = false;
  showAddForm = false;
  newTab: 'upload' | 'draw' = 'upload';
  newLabel = 'Ma signature';
  uploadFileName = '';
  uploadDataUrl: string | null = null;
  uploadBase64: string | null = null;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private drawCtx: CanvasRenderingContext2D | null = null;
  private hasDrawnStroke = false;

  constructor(
    private readonly authService: AuthService,
    private readonly signatureService: SignatureService,
    private readonly notifications: AppNotificationService
  ) {}

  ngOnInit(): void {
    const u = this.authService.getCurrentUser();
    this.accountId = u?.id ?? null;
    if (this.accountId) {
      this.loadVisuals();
    }
  }

  loadVisuals(): void {
    if (this.accountId == null) {
      return;
    }
    this.listLoading = true;
    this.signatureService.listVisuals(this.accountId).subscribe({
      next: (res) => {
        this.listLoading = false;
        if (res.status_code === 7000 && Array.isArray(res.data)) {
          this.visuals = res.data.filter((v) => v.active);
        } else {
          this.visuals = [];
        }
      },
      error: (err) => {
        this.listLoading = false;
        this.notifications.error(
          err?.error?.status_message || 'Impossible de charger les visuels',
          'E-Parapheur'
        );
        console.error(err);
      }
    });
  }

  isDefaultVisual(v: SignatureVisual): boolean {
    if (this.accountId == null) {
      return false;
    }
    return this.signatureService.getCurrentVisualId(this.accountId) === v.id;
  }

  setAsDefault(v: SignatureVisual): void {
    if (this.accountId == null) {
      return;
    }
    this.signatureService.setCurrentVisualId(this.accountId, v.id);
    this.notifications.success('Visuel enregistré par défaut pour la signature.', 'E-Parapheur');
  }

  getVisualImageSrc(v: SignatureVisual): string {
    if (v.visualUrl) {
      return this.signatureService.formatFileUrl(v.visualUrl);
    }
    if (!v.image?.trim()) {
      return '';
    }
    if (v.image.startsWith('data:')) {
      return v.image;
    }
    return `data:image/png;base64,${v.image}`;
  }

  hasImage(v: SignatureVisual): boolean {
    return !!v.visualUrl || !!v.image?.trim();
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
    };
    reader.readAsDataURL(file);
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

  uploadFileVisual(): void {
    if (this.accountId == null || !this.uploadBase64) {
      this.notifications.warning("Choisissez une image.", "E-Parapheur");
      return;
    }
    this.saving = true;
    this.signatureService
      .uploadVisual({
        accountId: this.accountId,
        label: this.newLabel || 'Importée',
        type: 'uploaded',
        image: this.uploadBase64
      })
      .subscribe({ next: (r) => this.onUploadDone(r) });
  }

  drawAndSave(): void {
    const canvas = this.drawCanvasRef?.nativeElement;
    if (!canvas || this.accountId == null) {
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    if (!base64 || !this.hasDrawnStroke) {
      this.notifications.warning("Dessinez d'abord votre signature.", "E-Parapheur");
      return;
    }
    this.saving = true;
    this.signatureService
      .uploadVisual({
        accountId: this.accountId,
        label: this.newLabel || 'Dessinée',
        type: 'drawn',
        image: base64
      })
      .subscribe({ next: (r) => this.onUploadDone(r) });
  }

  private onUploadDone(res: IApiResponse<SignatureVisual>): void {
    this.saving = false;
    if (res.status_code === 7000 && res.data) {
      this.notifications.success('Visuel enregistré.', "E-Parapheur");
      if (this.accountId) {
        this.signatureService.setCurrentVisualId(this.accountId, res.data.id);
      }
      this.showAddForm = false;
      this.resetAddForm();
      this.loadVisuals();
    } else {
      this.notifications.error(res.status_message || "Échec de l'enregistrement", "E-Parapheur");
    }
  }

  private resetAddForm(): void {
    this.newLabel = "Ma signature";
    this.newTab = "upload";
    this.uploadFileName = "";
    this.uploadDataUrl = null;
    this.uploadBase64 = null;
    this.hasDrawnStroke = false;
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetAddForm();
    }
  }
}
