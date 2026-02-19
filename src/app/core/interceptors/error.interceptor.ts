import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Non autorisé - rediriger vers login
        authService.logout().subscribe({
          next: () => {
            router.navigate(['/login']);
          },
          error: () => {
            router.navigate(['/login']);
          }
        });
      } else if (error.status === 403) {
        // Accès interdit
        router.navigate(['/dashboard']);
      }

      return throwError(() => error);
    })
  );
};

