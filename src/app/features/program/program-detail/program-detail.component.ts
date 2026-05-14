import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProgramService } from '../../../core/services/program.service';
import { SafeUrlPipe } from '../../../shared/safe-url.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { SignatureService } from '../../../core/services/signature.service';
import { AppNotificationService } from '../../../core/services/app-notification.service';
import {
  SignatureProgramDTO,
  SignatureProgramDocumentRequest,
  SignatureProgramDocumentDTO,
  SignatureProgramStepParticipantDTO,
  SignatureActionType,
  SignatureProgramStepDTO
} from '../../../core/models/signature-program.model';
import { IApiResponse } from '../../../core/models';
import { SignatureVisual } from '../../../core/models/signature.model';
import {
  ProgramPdfViewerComponent,
  PlacementResult
} from '../../../shared/components/program-pdf-viewer/program-pdf-viewer.component';

export type SignFlowState = 'idle' | 'placing' | 'sendingOtp' | 'otp' | 'finalizing';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProgramPdfViewerComponent, SafeUrlPipe],
  templateUrl: './program-detail.component.html'
})
export class ProgramDetailComponent implements OnInit, OnDestroy {
  program: SignatureProgramDTO | null = null;
  documents: SignatureProgramDocumentRequest[] = [];
  selectedDocument: SignatureProgramDocumentRequest | null = null;
  selectedStep: SignatureProgramStepDTO | null = null;
  loading = false;
  loadingPdf = false;
  error = '';
  pdfBlobUrl: string | null = null;
  private programIdForReload: number | null = null;

  currentUserAccountId: number | null = null;
  currentUserEmail: string | null = null;

  /** Visuels actifs (pour vérifier la présence d’au moins un visuel). */
  myVisuals: SignatureVisual[] = [];
  currentVisual: SignatureVisual | null = null;
  visualsLoading = false;

  /** Flux de signature inline. */
  signing: SignFlowState = 'idle';
  currentPlacement: PlacementResult | null = null;
  signOtp = '';
  private pendingParticipant: SignatureProgramStepParticipantDTO | null = null;

  private readonly tinyPngDataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAgMBgQK8/5kAAAAASUVORK5CYII=';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private programService: ProgramService,
    private authService: AuthService,
    private signatureService: SignatureService,
    private appNotificationService: AppNotificationService
  ) {}

  ngOnInit(): void {
    this.syncCurrentUser();
    this.authService.currentUser$.subscribe(() => {
      this.syncCurrentUser();
      this.loadMyVisuals();
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.programIdForReload = parseInt(id, 10);
      this.loadProgram(this.programIdForReload);
    } else {
      this.error = 'ID de programme manquant';
    }
    this.loadMyVisuals();
  }

  ngOnDestroy(): void {
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl);
    }
  }

  private syncCurrentUser(): void {
    const u = this.authService.getCurrentUser();
    this.currentUserAccountId = u?.id ?? null;
    this.currentUserEmail = u?.login ?? null;
  }

  private loadMyVisuals(): void {
    const acc = this.currentUserAccountId;
    if (acc == null) {
      return;
    }
    this.visualsLoading = true;
    this.signatureService.listVisuals(acc).subscribe({
      next: (res) => {
        this.visualsLoading = false;
        if (res.status_code === 7000 && Array.isArray(res.data)) {
          this.myVisuals = res.data.filter((v) => v.active);
          this.currentVisual = this.signatureService.resolveDefaultVisual(this.myVisuals, acc);
        } else {
          this.myVisuals = [];
          this.currentVisual = null;
        }
      },
      error: () => {
        this.visualsLoading = false;
        this.myVisuals = [];
        this.currentVisual = null;
      }
    });
  }

  loadProgram(id: number): void {
    this.loading = true;
    this.error = '';

    this.programService.getProgramById(id).subscribe({
      next: (response: IApiResponse<SignatureProgramDTO>) => {
        if (response.status_code === 7000) {
          this.program = response.data;
          this.extractDocumentsFromSteps(response.data);
          if (this.program.steps && this.program.steps.length > 0) {
            this.selectedStep = this.program.steps[0];
          }
          if (this.documents.length > 0) {
            this.selectDocument(this.documents[0]);
          }
        } else {
          this.error = response.status_message || 'Erreur lors du chargement du programme';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du programme';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private extractDocumentsFromSteps(program: SignatureProgramDTO): void {
    this.documents = [];
    if (program.steps && program.steps.length > 0) {
      program.steps.forEach((step) => {
        if (step.documents && Array.isArray(step.documents)) {
          step.documents.forEach((doc: SignatureProgramDocumentDTO) => {
            const existingDoc = this.documents.find((d) => d.id === doc.id);
            if (!existingDoc) {
              this.documents.push({
                id: doc.id,
                documentName: doc.documentName,
                documentPath: doc.documentPath,
                documentSize: doc.documentSize,
                documentType: doc.documentType,
                documentUrl: doc.documentUrl
              });
            }
          });
        }
      });
    }
  }

  selectDocument(doc: SignatureProgramDocumentRequest): void {
    this.cancelSignFlow();
    this.selectedDocument = doc;
    if (this.program?.steps) {
      const step = this.program.steps.find((s) => s.documents?.some((d) => d.id === doc.id));
      if (step) {
        this.selectedStep = step;
      }
    }
    this.loadPdfForDocument(doc);
  }

  refreshCurrentDocument(): void {
    if (this.selectedDocument) {
      this.loadPdfForDocument(this.selectedDocument, true);
    }
  }

  selectStep(step: SignatureProgramStepDTO): void {
    this.selectedStep = step;
  }

  private loadPdfForDocument(doc: SignatureProgramDocumentRequest, forceRefresh = false): void {
    if (!doc || !doc.id) {
      return;
    }
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
    }
    this.loadingPdf = true;
    this.programService.downloadDocument(doc.id, forceRefresh).subscribe({
      next: (blob: Blob) => {
        this.pdfBlobUrl = URL.createObjectURL(blob);
        this.loadingPdf = false;
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du PDF:', err);
        this.error = 'Impossible de charger le document PDF';
        this.loadingPdf = false;
      }
    });
  }

  getPdfSrc(doc: SignatureProgramDocumentRequest | null): string | null {
    if (!doc) {
      return null;
    }
    if (this.pdfBlobUrl && this.selectedDocument === doc) {
      return this.pdfBlobUrl;
    }
    if (doc.binary) {
      return `data:application/pdf;base64,${doc.binary}`;
    }
    return null;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/programs']);
  }

  getParticipantName(participant: SignatureProgramStepParticipantDTO): string {
    if (participant.account.person) {
      const firstName = participant.account.person.firstName || '';
      const lastName = participant.account.person.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || participant.account.login;
    }
    return participant.account.login;
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 border';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-100 border';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-100 border';
      case 'CANCELLED':
        return 'bg-slate-50 text-slate-500 border-slate-100 border';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100 border';
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'Terminé';
      case 'PENDING':
        return 'En attente';
      case 'REJECTED':
        return 'Rejeté';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return status || 'Inconnu';
    }
  }

  getActionLabel(action: SignatureActionType): string {
    switch (action) {
      case 'SIGN':
        return 'Signature';
      case 'VALIDATION':
        return 'Validation';
      case 'PARAPHER':
        return 'Parapheur';
      default:
        return action;
    }
  }

  get steps() {
    return this.program?.steps || [];
  }

  private getStepForSelectedDocument(): SignatureProgramStepDTO | null {
    if (!this.selectedDocument?.id || !this.program?.steps) {
      return null;
    }
    return (
      this.program.steps.find((s) => s.documents?.some((d) => d.id === this.selectedDocument?.id)) ??
      null
    );
  }

  getSignableParticipantForSelection(): SignatureProgramStepParticipantDTO | null {
    const userId = this.currentUserAccountId;
    if (!userId) {
      return null;
    }
    const step = this.getStepForSelectedDocument();
    if (!step || this.selectedDocument?.id == null) {
      return null;
    }
    if (step.actionType !== 'SIGN') {
      return null;
    }
    const inStep = step.documents?.some((d) => d.id === this.selectedDocument!.id) ?? false;
    if (!inStep) {
      return null;
    }
    return (
      step.participants?.find(
        (p) =>
          p.idAccount === userId && p.status === 'PENDING' && p.action === 'SIGN'
      ) ?? null
    );
  }

  canShowSignButton(): boolean {
    return this.getSignableParticipantForSelection() != null;
  }

  canStartSignFlow(): boolean {
    return (
      this.signing === 'idle' &&
      this.canShowSignButton() &&
      !!this.pdfBlobUrl &&
      !!this.currentUserAccountId &&
      !!this.currentUserEmail
    );
  }

  get placementModeActive(): boolean {
    return this.signing === 'placing' || this.signing === 'otp' || this.signing === 'sendingOtp';
  }

  get placementImageUrl(): string | null {
    return this.asPlacementDataUrl(this.currentVisual);
  }

  asPlacementDataUrl(visual: SignatureVisual | null): string | null {
    if (!visual) {
      return this.tinyPngDataUrl;
    }
    if (visual.visualUrl) {
      return this.signatureService.formatFileUrl(visual.visualUrl);
    }
    const i = visual.image;
    if (!i?.trim()) {
      return this.tinyPngDataUrl;
    }
    if (i.startsWith('data:')) {
      return i;
    }
    return `data:image/png;base64,${i}`;
  }

  onPlacementChange(p: PlacementResult): void {
    this.currentPlacement = p;
  }

  onSignClick(): void {
    this.pendingParticipant = this.getSignableParticipantForSelection();
    if (!this.pendingParticipant || this.selectedDocument?.id == null) {
      return;
    }
    if (this.currentUserAccountId == null) {
      return;
    }
    this.signatureService.listVisuals(this.currentUserAccountId).subscribe({
      next: (res) => {
        if (res.status_code === 7000 && Array.isArray(res.data)) {
          this.myVisuals = res.data.filter((v) => v.active);
          this.currentVisual = this.signatureService.resolveDefaultVisual(
            this.myVisuals,
            this.currentUserAccountId!
          );
        }
        if (this.myVisuals.length === 0) {
          this.appNotificationService.info(
            'Aucun visuel actif. Configurez d’abord une signature.',
            "E-Parapheur"
          );
          this.router.navigate(['/dashboard/signatures']);
          return;
        }
        this.signOtp = '';
        this.currentPlacement = null;
        this.signing = 'placing';
      },
      error: (err) => {
        this.appNotificationService.error(
          err?.error?.status_message || "Impossible de vérifier vos visuels",
          "E-Parapheur"
        );
      }
    });
  }

  onConfirmPlacement(): void {
    if (this.signing !== 'placing' || !this.currentPlacement) {
      this.appNotificationService.warning("Positionnez le visuel sur le document.", "E-Parapheur");
      return;
    }
    if (!this.currentUserEmail) {
      return;
    }
    this.signing = 'sendingOtp';
    this.signatureService.sendSignatureOtp(this.currentUserEmail).subscribe({
      next: (res) => {
        if (res.status_code === 7002) {
          this.appNotificationService.success("Code OTP envoyé sur votre e-mail.", "E-Parapheur");
          this.signOtp = '';
          this.signing = 'otp';
        } else {
          this.appNotificationService.error(
            res.status_message || "Envoi du code échoué",
            "E-Parapheur"
          );
          this.signing = 'placing';
        }
      },
      error: (err) => {
        this.appNotificationService.error(
          err?.error?.status_message || "Erreur envoi OTP",
          "E-Parapheur"
        );
        this.signing = 'placing';
        console.error(err);
      }
    });
  }

  onValidateOtpAndSign(): void {
    if (this.signOtp.trim().length !== 6) {
      this.appNotificationService.warning("Saisissez le code à 6 chiffres.", "E-Parapheur");
      return;
    }
    const p = this.pendingParticipant;
    const docId = this.selectedDocument?.id;
    const v = this.currentVisual;
    const pl = this.currentPlacement;
    if (!p || docId == null || !v || !pl) {
      return;
    }
    this.signing = 'finalizing';
    this.signatureService
      .executeSignature({
        participantId: p.id,
        documentId: docId,
        otp: this.signOtp.trim(),
        visualId: v.id,
        x: pl.x,
        y: pl.y,
        page: pl.page
      })
      .subscribe({
        next: (r) => {
          if (r.status_code === 7000) {
            this.signing = 'idle';
            this.pendingParticipant = null;
            this.currentPlacement = null;
            this.signOtp = '';
            this.appNotificationService.success("Signature effectuée avec succès", "E-Parapheur");
            if (this.programIdForReload != null) {
              this.loadProgram(this.programIdForReload);
            }
            this.refreshCurrentDocument();
          } else {
            this.signing = 'otp';
            this.appNotificationService.error(
              r.status_message || "La signature a échoué",
              "E-Parapheur"
            );
          }
        },
        error: (err) => {
          this.signing = 'otp';
          this.appNotificationService.error(
            err?.error?.status_message || "Erreur lors de la signature",
            "E-Parapheur"
          );
          console.error(err);
        }
      });
  }

  cancelSignFlow(): void {
    this.signing = 'idle';
    this.currentPlacement = null;
    this.signOtp = '';
    this.pendingParticipant = null;
  }

  formatUrl(url: string | undefined): string {
    return this.signatureService.formatFileUrl(url);
  }
}
