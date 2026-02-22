import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SignatureProgramDocumentRequest,
  SignatureProgramStepRequest,
  SignatureProgramStepParticipantRequest
} from '../../../../core/models/signature-program.model';
import { IAccountDetail } from '../../../../core/models';
import { UserSelectionModalComponent } from '../../../../shared/components/user-selection-modal/user-selection-modal.component';

@Component({
  selector: 'app-step-two',
  standalone: true,
  imports: [CommonModule, FormsModule, UserSelectionModalComponent],
  templateUrl: './step-two.component.html'
})
export class StepTwoComponent implements OnInit {
  @Input() documents: SignatureProgramDocumentRequest[] = [];
  @Input() initialSteps: SignatureProgramStepRequest[] = [];
  @Input() users: IAccountDetail[] = [];

  @Output() back = new EventEmitter<void>();
  @Output() validated = new EventEmitter<SignatureProgramStepRequest[]>();

  steps: SignatureProgramStepRequest[] = [];
  isModalOpen = false;
  currentStepForModal: SignatureProgramStepRequest | null = null;

  ngOnInit(): void {
    this.steps = this.initialSteps && this.initialSteps.length
      ? this.initialSteps.map(step => ({
          ...step,
          documentIds: [...step.documentIds],
          participants: step.participants.map(p => ({ ...p }))
        }))
      : [];
  }

  addStep(): void {
    const newStep: SignatureProgramStepRequest = {
      stepOrder: this.steps.length + 1,
      name: 'Signature', // nom automatique basé sur actionType
      actionType: 'SIGN',
      description: '',
      required: true, // toujours true
      documentIds: [],
      participants: []
    };
    this.steps.push(newStep);
  }

  /**
   * Retourne le nom automatique basé sur le type d'action
   */
  getStepNameFromActionType(actionType: string): string {
    const names: Record<string, string> = {
      'SIGN': 'Signature',
      'VALIDATION': 'Validation',
      'PARAPHER': 'Parapheur'
    };
    return names[actionType] || 'Étape';
  }

  /**
   * Met à jour le nom de l'étape quand le type change
   */
  onActionTypeChange(step: SignatureProgramStepRequest): void {
    step.name = this.getStepNameFromActionType(step.actionType);
  }

  removeStep(index: number): void {
    this.steps.splice(index, 1);
    this.steps.forEach((s, i) => (s.stepOrder = i + 1));
  }

  toggleDocumentForStep(step: SignatureProgramStepRequest, docIndex: number): void {
    const idx = step.documentIds.indexOf(docIndex);
    if (idx === -1) {
      step.documentIds.push(docIndex);
    } else {
      step.documentIds.splice(idx, 1);
    }
  }

  isDocumentSelected(step: SignatureProgramStepRequest, docIndex: number): boolean {
    return step.documentIds.includes(docIndex);
  }

  openParticipantModal(step: SignatureProgramStepRequest): void {
    this.currentStepForModal = step;
    this.isModalOpen = true;
  }

  onUsersSelected(selectedUsers: IAccountDetail[]): void {
    if (this.currentStepForModal && selectedUsers.length > 0) {
      const currentParticipantIds = this.currentStepForModal.participants.map(p => p.accountId);
      
      selectedUsers.forEach(user => {
        // Ne pas ajouter si déjà présent
        if (!currentParticipantIds.includes(user.id)) {
          const participant: SignatureProgramStepParticipantRequest = {
            accountId: user.id,
            position: this.currentStepForModal!.participants.length,
            required: true
          };
          this.currentStepForModal!.participants.push(participant);
        }
      });

      this.updateParticipantPositions(this.currentStepForModal);
    }
    this.isModalOpen = false;
    this.currentStepForModal = null;
  }

  onModalClose(): void {
    this.isModalOpen = false;
    this.currentStepForModal = null;
  }

  getSelectedUserIdsForStep(step: SignatureProgramStepRequest): number[] {
    return step.participants.map(p => p.accountId);
  }

  /**
   * Réajuste les positions des participants après suppression
   */
  updateParticipantPositions(step: SignatureProgramStepRequest): void {
    step.participants.forEach((p, index) => {
      p.position = index;
    });
  }

  removeParticipant(step: SignatureProgramStepRequest, index: number): void {
    step.participants.splice(index, 1);
    this.updateParticipantPositions(step);
  }

  getUserLabel(user: IAccountDetail): string {
    if (user.person) {
      const first = user.person.firstName ?? '';
      const last = user.person.lastName ?? '';
      const full = `${first} ${last}`.trim();
      if (full) {
        return `${full} (${user.login})`;
      }
    }
    return user.login;
  }

  getParticipantName(accountId: number): string {
    const user = this.users.find(u => u.id === accountId);
    if (user) {
      return this.getUserLabel(user);
    }
    return `Utilisateur #${accountId}`;
  }

  onBack(): void {
    this.back.emit();
  }

  /**
   * Valide que tous les champs requis sont remplis
   */
  isValid(): boolean {
    if (this.steps.length === 0) {
      return false;
    }

    for (const step of this.steps) {
      // Vérifier que le type d'action est défini (toujours le cas)
      if (!step.actionType) {
        return false;
      }

      // Vérifier qu'au moins un document est sélectionné
      if (step.documentIds.length === 0) {
        return false;
      }

      // Vérifier qu'il y a au moins un participant
      if (step.participants.length === 0) {
        return false;
      }

      // Vérifier que tous les participants ont un accountId valide
      for (const p of step.participants) {
        if (!p.accountId || p.accountId === 0) {
          return false;
        }
      }
    }

    return true;
  }

  onNext(): void {
    if (!this.isValid()) {
      return; // ne pas émettre si invalide
    }

    // S'assurer que required est toujours true et que les positions sont à jour
    this.steps.forEach(step => {
      step.required = true;
      this.updateParticipantPositions(step);
      step.participants.forEach(p => {
        p.required = true;
      });
    });

    this.validated.emit(this.steps);
  }
}

