import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IApiResponse } from '../models';
import {
  ExecuteSignatureRequest,
  SignatureActionResult,
  SignatureVisual,
  UploadCertificateRequest,
  UploadVisualRequest,
  UserCertificate
} from '../models/signature.model';

const DEFAULT_VISUAL_KEY = 'signatureVisual:default';

@Injectable({
  providedIn: 'root'
})
export class SignatureService {
  private readonly baseUrl = 'http://localhost:8081';

  constructor(private http: HttpClient) {}

  private storageKeyForAccount(accountId: number): string {
    return `${DEFAULT_VISUAL_KEY}:${accountId}`;
  }

  getCurrentVisualId(accountId: number): number | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem(this.storageKeyForAccount(accountId));
    if (raw == null || raw === '') {
      return null;
    }
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  }

  setCurrentVisualId(accountId: number, visualId: number): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(this.storageKeyForAccount(accountId), String(visualId));
  }

  /**
   * Choisit le visuel courant : préférence localStorage, sinon `default` backend, sinon premier actif.
   */
  resolveDefaultVisual(visuals: SignatureVisual[], accountId: number): SignatureVisual | null {
    const list = (visuals || []).filter((v) => v.active);
    if (list.length === 0) {
      return null;
    }
    const fromStorage = this.getCurrentVisualId(accountId);
    if (fromStorage != null) {
      const found = list.find((v) => v.id === fromStorage);
      if (found) {
        return found;
      }
    }
    const def = list.find((v) => v.default);
    if (def) {
      return def;
    }
    return list[0] ?? null;
  }

  uploadVisual(payload: UploadVisualRequest): Observable<IApiResponse<SignatureVisual>> {
    return this.http.post<IApiResponse<SignatureVisual>>(
      `${this.baseUrl}/signature-visuals/upload`,
      payload
    );
  }

  listVisuals(accountId: number): Observable<IApiResponse<SignatureVisual[]>> {
    return this.http.get<IApiResponse<SignatureVisual[]>>(
      `${this.baseUrl}/signature-visuals/account/${accountId}`
    );
  }

  uploadCertificate(
    payload: UploadCertificateRequest
  ): Observable<IApiResponse<UserCertificate>> {
    return this.http.post<IApiResponse<UserCertificate>>(
      `${this.baseUrl}/certificates/upload`,
      payload
    );
  }

  listCertificates(accountId: number): Observable<IApiResponse<UserCertificate[]>> {
    return this.http.get<IApiResponse<UserCertificate[]>>(
      `${this.baseUrl}/certificates/account/${accountId}`
    );
  }

  sendSignatureOtp(email: string): Observable<IApiResponse<null>> {
    return this.http.post<IApiResponse<null>>(
      `${this.baseUrl}/accounts/otp/send/EMAIL/SIGNATURE`,
      { email }
    );
  }

  executeSignature(
    payload: ExecuteSignatureRequest
  ): Observable<IApiResponse<SignatureActionResult>> {
    return this.http.post<IApiResponse<SignatureActionResult>>(
      `${this.baseUrl}/signatures/execute`,
      payload
    );
  }

  /**
   * Formate une URL relative en URL absolue pour le backend,
   * en supprimant le préfixe '/api' si présent (car le backend sert à la racine).
   */
  formatFileUrl(relativeUrl: string | undefined): string {
    if (!relativeUrl) {
      return '';
    }
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    let path = relativeUrl;
    if (path.startsWith('/api')) {
      path = path.substring(4);
    }
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    return `${this.baseUrl}${path}`;
  }
}
