import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProgramService } from '../../../core/services/program.service';
import { SignatureProgramDTO, SignatureProgramDocumentRequest, SignatureProgramDocumentDTO, SignatureProgramStepParticipantDTO, SignatureActionType, SignatureProgramStepDTO } from '../../../core/models/signature-program.model';
import { IApiResponse } from '../../../core/models';
import { ProgramPdfViewerComponent } from '../../../shared/components/program-pdf-viewer/program-pdf-viewer.component';

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ProgramPdfViewerComponent],
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
  pdfBlobUrl: string | null = null; // URL du blob pour le viewer

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private programService: ProgramService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProgram(parseInt(id, 10));
    } else {
      this.error = 'ID de programme manquant';
    }
  }

  ngOnDestroy(): void {
    // Nettoyer l'URL blob si elle existe
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl);
    }
  }

  loadProgram(id: number): void {
    this.loading = true;
    this.error = '';

    this.programService.getProgramById(id).subscribe({
      next: (response: IApiResponse<SignatureProgramDTO>) => {
        if (response.status_code === 7000) {
          this.program = response.data;
          
          // Extraire les documents depuis steps[].documents[]
          this.extractDocumentsFromSteps(response.data);

          // Étape sélectionnée par défaut : première étape si disponible
          if (this.program.steps && this.program.steps.length > 0) {
            this.selectedStep = this.program.steps[0];
          }
          
          // Sélectionner le premier document si disponible
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

  /**
   * Extrait tous les documents depuis les étapes
   * Selon la doc backend, les documents sont dans steps[].documents[]
   */
  private extractDocumentsFromSteps(program: SignatureProgramDTO): void {
    this.documents = [];
    
    if (program.steps && program.steps.length > 0) {
      program.steps.forEach(step => {
        // Le backend retourne des documents avec la structure SignatureProgramDocumentDTO
        if (step.documents && Array.isArray(step.documents)) {
          step.documents.forEach((doc: SignatureProgramDocumentDTO) => {
            // Éviter les doublons (même document dans plusieurs étapes)
            const existingDoc = this.documents.find(d => d.id === doc.id);
            if (!existingDoc) {
              this.documents.push({
                id: doc.id,
                documentName: doc.documentName,
                documentPath: doc.documentPath,
                documentSize: doc.documentSize,
                documentType: doc.documentType
              });
            }
          });
        }
      });
    }
  }

  selectDocument(doc: SignatureProgramDocumentRequest): void {
    this.selectedDocument = doc;
    // Charger le PDF si nécessaire
    this.loadPdfForDocument(doc);
  }

  selectStep(step: SignatureProgramStepDTO): void {
    this.selectedStep = step;
  }

  /**
   * Charge le PDF via l'endpoint /documents/{id}/download
   */
  private loadPdfForDocument(doc: SignatureProgramDocumentRequest): void {
    if (!doc || !doc.id) {
      return;
    }

    // Nettoyer l'ancienne URL blob
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
    }

    this.loadingPdf = true;

    this.programService.downloadDocument(doc.id).subscribe({
      next: (blob: Blob) => {
        // Créer une URL blob pour le viewer
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

  /**
   * Construit la source PDF pour le viewer
   * Utilise l'URL blob créée depuis le téléchargement
   */
  getPdfSrc(doc: SignatureProgramDocumentRequest | null): string | null {
    if (!doc) return null;

    // Si on a une URL blob (téléchargement réussi), l'utiliser
    if (this.pdfBlobUrl && this.selectedDocument === doc) {
      return this.pdfBlobUrl;
    }

    // Fallback : si on a binary (base64) - pour la prévisualisation locale
    if (doc.binary) {
      return `data:application/pdf;base64,${doc.binary}`;
    }

    return null;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/programs']);
  }

  /**
   * Méthode pour obtenir le nom complet d'un participant
   */
  getParticipantName(participant: SignatureProgramStepParticipantDTO): string {
    if (participant.account.person) {
      const firstName = participant.account.person.firstName || '';
      const lastName = participant.account.person.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || participant.account.login;
    }
    return participant.account.login;
  }

  /**
   * Méthode pour obtenir la classe CSS du statut
   */
  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

  /**
   * Méthode pour obtenir le libellé du statut en français
   */
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

  /**
   * Méthode pour obtenir le libellé de l'action
   */
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

  /**
   * Getter pour obtenir les steps de manière sûre
   */
  get steps() {
    return this.program?.steps || [];
  }
}

