import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { IApiResponse, AuthRequest, AuthResponse, OtpRequest, IAccountDetail } from '../models';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/accounts';
  private currentUserSubject = new BehaviorSubject<IAccountDetail | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    // Charger l'utilisateur au démarrage si token présent
    if (this.isAuthenticated()) {
      this.loadCurrentUser().subscribe({
        error: (error) => {
          console.error('Erreur lors du chargement de l\'utilisateur au démarrage', error);
        }
      });
    }
  }

  login(credentials: AuthRequest): Observable<IApiResponse<AuthResponse>> {
    return this.http.post<IApiResponse<AuthResponse>>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      tap(response => {
        if (response.data.token && !response.data.requiresOtp) {
          this.tokenService.setToken(response.data.token);
          // Charger les détails complets de l'utilisateur
          this.loadCurrentUser().subscribe();
        }
      })
    );
  }

  verifyOtp(otpRequest: OtpRequest): Observable<IApiResponse<AuthResponse>> {
    return this.http.post<IApiResponse<AuthResponse>>(
      `${this.apiUrl}/verify-otp`,
      otpRequest
    ).pipe(
      tap(response => {
        if (response.data.token) {
          this.tokenService.setToken(response.data.token);
          // Charger les détails complets de l'utilisateur
          this.loadCurrentUser().subscribe();
        }
      })
    );
  }

  /**
   * Demande l'envoi d'un OTP pour la création d'un programme de signature.
   * Utilise l'endpoint : POST /accounts/otp/send/EMAIL/CREAT_PROGRAM
   */
  requestProgramOtp(detail: string): Observable<IApiResponse<any>> {
    const user = this.getCurrentUser();

    const payload: { email: string | undefined; detail: string; phone?: string | null } = {
      email: user?.login,
      detail,
      phone: user?.person?.phone ?? null
    };

    return this.http.post<IApiResponse<any>>(
      `${this.apiUrl}/otp/send/EMAIL/CREAT_PROGRAM`,
      payload
    );
  }

  logout(): Observable<IApiResponse<any>> {
    return this.http.post<IApiResponse<any>>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.tokenService.removeToken();
        this.currentUserSubject.next(null);
      })
    );
  }

  /**
   * Charge les informations complètes de l'utilisateur connecté
   */
  loadCurrentUser(): Observable<IApiResponse<IAccountDetail>> {
    return this.http.get<IApiResponse<IAccountDetail>>(`${this.apiUrl}/getOne`).pipe(
      tap(response => {
        if (response.status_code === 7000) {
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<IApiResponse<any>> {
    return this.http.post<IApiResponse<any>>(
      `${this.apiUrl}/forgot-password`,
      { email }
    );
  }

  resetPassword(token: string, password: string): Observable<IApiResponse<any>> {
    return this.http.post<IApiResponse<any>>(
      `${this.apiUrl}/reset-password`,
      { token, password }
    );
  }

  register(userData: any): Observable<IApiResponse<any>> {
    return this.http.post<IApiResponse<any>>(
      `${this.apiUrl}/register`,
      userData
    );
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    const token = this.tokenService.getToken();
    return !!token && !this.tokenService.isTokenExpired();
  }

  /**
   * Récupère l'utilisateur actuel (depuis le cache)
   */
  getCurrentUser(): IAccountDetail | null {
    return this.currentUserSubject.value;
  }

  /**
   * Vérifie si l'utilisateur a un profil spécifique
   */
  hasProfile(profileCode: string): boolean {
    const user = this.getCurrentUser();
    return user?.profile?.code === profileCode;
  }

  /**
   * Vérifie si l'utilisateur est ADMIN ou ROOT
   */
  isAdmin(): boolean {
    return this.hasProfile('ADMIN') || this.hasProfile('ROOT');
  }

  /**
   * Vérifie si l'utilisateur est ROOT
   */
  isRoot(): boolean {
    return this.hasProfile('ROOT');
  }

  /**
   * Vérifie si l'utilisateur est AGENT ou MANAGER
   */
  isUser(): boolean {
    const user = this.getCurrentUser();
    return user?.profile?.code === 'AGENT' || user?.profile?.code === 'MANAGER';
  }

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  hasPermission(permissionCode: string): boolean {
    const user = this.getCurrentUser();
    return user?.profile?.permissions?.some(
      p => p.code === permissionCode
    ) ?? false;
  }

  /**
   * Récupère le nom du profil
   */
  getProfileName(): string {
    const user = this.getCurrentUser();
    return user?.profile?.name || 'Non défini';
  }

  /**
   * Récupère la route du dashboard approprié
   */
  getDashboardRoute(): string {
    return this.isAdmin() ? '/admin/dashboard' : '/dashboard';
  }
}

