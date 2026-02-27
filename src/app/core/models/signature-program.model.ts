import { IPaginatedResponse } from './ipaginated-response.model';

export type SignatureActionType = 'SIGN' | 'VALIDATION' | 'PARAPHER';

export interface SignatureProgramDocumentRequest {
  id?: number;            // ID du document (retourné par le backend)
  documentName: string;
  documentPath?: string;  // URL/chemin serveur, rempli au retour du back
  documentSize: number;
  documentType: string;
  binary?: string;        // base64 pour la création/la prévisualisation
}

// Interface pour un document retourné par le backend (dans steps[])
export interface SignatureProgramDocumentDTO {
  id: number;
  documentName: string;
  documentPath: string;  // Chemin relatif
  documentSize: number;
  documentType: string;
  uploadedByAccount?: number;
  uploadedAt?: string;
  createdAt?: string;
}

// Interface pour un participant retourné par le backend (dans steps[].participants[])
export interface SignatureProgramStepParticipantDTO {
  id: number;
  idStep: number;
  idAccount: number;
  action: SignatureActionType;
  position: number;
  required: boolean;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';  // Statuts possibles
  account: {
    id: number;
    login: string;
    person?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

// Interface pour une étape retournée par le backend
export interface SignatureProgramStepDTO {
  id: number;
  idProgram: number;
  stepOrder: number;
  name: string;
  actionType: SignatureActionType;
  description?: string;
  required: boolean;
  status?: string;
  createdAt?: string;
  documents?: SignatureProgramDocumentDTO[];  // Documents de l'étape
  participants?: SignatureProgramStepParticipantDTO[];  // Participants de l'étape
}

export interface SignatureProgramStepParticipantRequest {
  accountId: number;
  position?: number;
  required?: boolean;
}

export interface SignatureProgramStepRequest {
  stepOrder: number;
  name: string;
  actionType: SignatureActionType;
  description?: string;
  required?: boolean;
  documentIds: number[];
  participants: SignatureProgramStepParticipantRequest[];
}

export interface CreateSignatureProgramRequest {
  otp: string;
  email: string;
  label: string;
  description?: string;
  programType: string;
  startDate?: string;
  endDate?: string;
  documents: SignatureProgramDocumentRequest[];
  steps: SignatureProgramStepRequest[];
}

export interface SignatureProgramDTO {
  id: number;
  title: string;
  description?: string;
  idInitiatorAccount: number;
  initiator?: any;  // Détails de l'initiateur
  programType: string;
  status: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
  documents?: SignatureProgramDocumentRequest[];
  steps?: SignatureProgramStepDTO[];
}


