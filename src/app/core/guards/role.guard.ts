import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Charger l'utilisateur si pas encore chargé
  if (!authService.getCurrentUser()) {
    return authService.loadCurrentUser().pipe(
      map(response => {
        if (response.status_code === 7000 && authService.isAdmin()) {
          return true;
        }
        router.navigate(['/dashboard']);
        return false;
      }),
      catchError(() => {
        router.navigate(['/dashboard']);
        return of(false);
      })
    );
  }

  // Vérifier si l'utilisateur est admin
  if (authService.isAdmin()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

