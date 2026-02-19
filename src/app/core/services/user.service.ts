import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IApiResponse, IPaginatedResponse, IAccountDetail, CreateUserRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8081/accounts';

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste paginée des utilisateurs
   */
  getUsers(page: number = 1, size: number = 20): Observable<IPaginatedResponse<IAccountDetail>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<IPaginatedResponse<IAccountDetail>>(
      `${this.apiUrl}/liste-users`,
      { params }
    );
  }

  /**
   * Crée un nouvel utilisateur
   */
  createUser(userData: CreateUserRequest): Observable<IApiResponse<any>> {
    return this.http.post<IApiResponse<any>>(
      `${this.apiUrl}/create-user`,
      userData
    );
  }

  /**
   * Récupère les statistiques (nombre total d'utilisateurs)
   */
  getStats(): Observable<IApiResponse<number>> {
    return this.http.get<IApiResponse<number>>(`${this.apiUrl}/stats`);
  }

  /**
   * Modifie un utilisateur
   */
  updateUser(userId: number, userData: Partial<IAccountDetail>): Observable<IApiResponse<IAccountDetail>> {
    return this.http.put<IApiResponse<IAccountDetail>>(
      `${this.apiUrl}/update-user/${userId}`,
      userData
    );
  }

  /**
   * Supprime un utilisateur
   */
  deleteUser(userId: number): Observable<IApiResponse<any>> {
    return this.http.delete<IApiResponse<any>>(
      `${this.apiUrl}/delete-user/${userId}`
    );
  }

  /**
   * Bloque ou débloque un utilisateur
   */
  toggleUserStatus(userId: number, active: boolean): Observable<IApiResponse<any>> {
    return this.http.patch<IApiResponse<any>>(
      `${this.apiUrl}/toggle-status/${userId}`,
      { active }
    );
  }
}

