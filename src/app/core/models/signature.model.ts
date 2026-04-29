export type SignatureVisualType = 'drawn' | 'uploaded' | 'typed';

export interface SignatureVisual {
  id: number;
  idAccount: number;
  label: string;
  visualType: SignatureVisualType;
  visualPath?: string;
  default: boolean;
  active: boolean;
  /** Contenu image base64 (avec ou sans préfixe data:), si renvoyé par l’API */
  image?: string;
  visualUrl?: string;
}

export interface UserCertificate {
  id: number;
  idAccount: number;
}

export interface UploadVisualRequest {
  accountId: number;
  label?: string;
  type?: SignatureVisualType;
  image: string; // base64 sans préfixe data:
}

export interface UploadCertificateRequest {
  accountId: number;
  certificatePem: string;
}

export interface ExecuteSignatureRequest {
  participantId: number;
  documentId: number;
  otp: string;
  visualId?: number;
  certificateId?: number;
  x?: number;
  y?: number;
  page?: number;
}

export interface SignatureActionResult {
  id: number;
  idStepParticipant: number;
  idDocument: number;
}
