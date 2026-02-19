import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SignatureProgramDocumentRequest
} from '../../../core/models/signature-program.model';

@Component({
  selector: 'app-program-step-one',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './program-step-one.component.html'
})
export class ProgramStepOneComponent {
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

  form = {
    label: '',
    description: '',
    startDate: '',
    endDate: ''
  };

  documents: SignatureProgramDocumentRequest[] = [];

  ngOnInit(): void {
    if (this.initialValue) {
      this.form = {
        label: this.initialValue.label,
        description: this.initialValue.description || '',
        startDate: this.initialValue.startDate || '',
        endDate: this.initialValue.endDate || ''
      };
      this.documents = [...this.initialValue.documents];
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const files = Array.from(input.files);
    files.forEach(file => {
      const doc: SignatureProgramDocumentRequest = {
        documentName: file.name,
        documentPath: file.name, // TODO: remplacer par le chemin réel après upload
        documentSize: file.size,
        documentType: file.type || 'application/octet-stream'
      };
      this.documents.push(doc);
    });

    // reset pour pouvoir re-sélectionner les mêmes fichiers si besoin
    input.value = '';
  }

  removeDocument(index: number): void {
    this.documents.splice(index, 1);
  }

  onNext(): void {
    if (!this.form.label.trim()) {
      return;
    }

    this.validated.emit({
      ...this.form,
      documents: this.documents
    });
  }
}


