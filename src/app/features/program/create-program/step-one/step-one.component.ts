import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  SignatureProgramDocumentRequest
} from '../../../../core/models/signature-program.model';
import { ProgramPdfViewerComponent } from '../../../../shared/components/program-pdf-viewer/program-pdf-viewer.component';

@Component({
  selector: 'app-step-one',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProgramPdfViewerComponent],
  templateUrl: './step-one.component.html'
})
export class StepOneComponent implements OnInit {
  @Input() initialValue!: {
    label: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    documents: SignatureProgramDocumentRequest[];
  };

  @Output() validated = new EventEmitter<{
    label: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    documents: SignatureProgramDocumentRequest[];
  }>();

  form: FormGroup;

  documents: SignatureProgramDocumentRequest[] = [];
  loadingFiles = false;
  previewDocument: SignatureProgramDocumentRequest | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      label: ['', [Validators.required]],
      description: ['', [Validators.required]],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    if (this.initialValue) {
      this.form.patchValue({
        label: this.initialValue.label,
        description: this.initialValue.description || '',
        startDate: this.initialValue.startDate || '',
        endDate: this.initialValue.endDate || ''
      });
      this.documents = [...this.initialValue.documents];
    }
  }

  /**
   * Convertit un fichier en base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // On extrait uniquement la partie base64 (sans le préfixe data:application/pdf;base64,)
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    this.loadingFiles = true;
    const files = Array.from(input.files);

    try {
      for (const file of files) {
        // Vérifier que c'est un PDF
        if (file.type !== 'application/pdf') {
          console.warn(`Le fichier ${file.name} n'est pas un PDF. Seuls les PDF sont acceptés.`);
          continue;
        }

        const base64 = await this.fileToBase64(file);

        const doc: SignatureProgramDocumentRequest = {
          documentName: file.name,
          documentSize: file.size,
          documentType: file.type || 'application/pdf',
          binary: base64 // Le back utilisera ce champ pour stocker le fichier
        };
        this.documents.push(doc);
      }
    } catch (error) {
      console.error('Erreur lors de la conversion du fichier en base64:', error);
    } finally {
      this.loadingFiles = false;
      // reset pour pouvoir re-sélectionner les mêmes fichiers si besoin
      input.value = '';
    }
  }

  removeDocument(index: number): void {
    const removed = this.documents[index];
    this.documents.splice(index, 1);

    if (!this.previewDocument) {
      return;
    }

    if (this.documents.length === 0) {
      this.previewDocument = null;
    } else if (removed === this.previewDocument) {
      // Si on supprime le document actuellement prévisualisé,
      // on nettoie simplement l'aperçu. L'utilisateur devra recliquer sur un bouton œil.
      this.previewDocument = null;
    }
  }

  onTogglePreview(doc: SignatureProgramDocumentRequest): void {
    if (this.previewDocument && this.previewDocument === doc) {
      this.previewDocument = null;
      return;
    }
    this.previewDocument = doc;
  }

  isPreviewed(doc: SignatureProgramDocumentRequest): boolean {
    return this.previewDocument === doc;
  }

  get previewSrc(): string | null {
    if (!this.previewDocument) {
      return null;
    }
    if (this.previewDocument.documentPath) {
      return this.previewDocument.documentPath;
    }
    if (this.previewDocument.binary) {
      return `data:application/pdf;base64,${this.previewDocument.binary}`;
    }
    return null;
  }

  isValid(): boolean {
    return this.form.valid && this.documents.length > 0;
  }

  onNext(): void {
    if (this.form.invalid || this.documents.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.validated.emit({
      ...this.form.value,
      documents: this.documents
    });
  }
}

