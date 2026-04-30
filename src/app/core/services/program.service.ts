import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IApiResponse, IPaginatedResponse } from '../models';
import {
  CreateSignatureProgramRequest,
  SignatureProgramDTO
} from '../models/signature-program.model';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private apiUrl = 'http://localhost:8081/signature-programs';

  constructor(private http: HttpClient) { }

  /**
   * Création d'un programme de signature
   */
  createProgram(
    payload: CreateSignatureProgramRequest
  ): Observable<IApiResponse<{ programId: number; title: string; status: string }>> {
    return this.http.post<IApiResponse<{ programId: number; title: string; status: string }>>(
      `${this.apiUrl}/create`,
      payload
    );
  }

  /**
   * Récupération paginée des programmes
   */
  getPrograms(
    page: number = 1,
    size: number = 20
  ): Observable<IPaginatedResponse<SignatureProgramDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<IPaginatedResponse<SignatureProgramDTO>>(
      `${this.apiUrl}/liste-all`,
      { params }
    );
  }

  /**
   * Récupère la liste des programmes dont l'utilisateur connecté est l'initiateur.
   */
  getMyCreations(
    page: number = 1,
    size: number = 25
  ): Observable<IPaginatedResponse<SignatureProgramDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<IPaginatedResponse<SignatureProgramDTO>>(
      `${this.apiUrl}/liste-mes-creations`,
      { params }
    );
  }

  /**
   * Récupère la liste des programmes où l'utilisateur connecté est impliqué.
   */
  getInvolvingMe(
    page: number = 1,
    size: number = 25
  ): Observable<IPaginatedResponse<SignatureProgramDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<IPaginatedResponse<SignatureProgramDTO>>(
      `${this.apiUrl}/liste-me-concernant`,
      { params }
    );
  }

  /**
   * Détail d'un programme
   */
  getProgramById(id: number): Observable<IApiResponse<SignatureProgramDTO>> {
    return this.http.get<IApiResponse<SignatureProgramDTO>>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Télécharge un document PDF (Original ou Signé)
   * @param documentId ID du document
   * @param forceRefresh Force le rechargement via un timestamp
   * @returns Observable avec le blob PDF
   */
  downloadDocument(documentId: number, forceRefresh = false): Observable<Blob> {
    let url = `http://localhost:8081/files/documents/${documentId}`;
    if (forceRefresh) {
      url += `?t=${Date.now()}`;
    }
    return this.http.get(url, { responseType: 'blob' });
  }
}


