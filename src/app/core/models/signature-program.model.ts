import { IPaginatedResponse } from './ipaginated-response.model';

export type SignatureActionType = 'SIGN' | 'VALIDATION' | 'PARAPHER';

export interface SignatureProgramDocumentRequest {
  documentName: string;
  documentPath: string;
  documentSize: number;
  documentType: string;
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
  programType: string;
  status: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}


