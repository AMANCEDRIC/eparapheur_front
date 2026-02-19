import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'verify-otp',
    loadComponent: () => import('./features/auth/verify-otp/verify-otp.component')
      .then(m => m.VerifyOtpComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component')
      .then(m => m.ResetPasswordComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./layouts/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/user-dashboard/user-dashboard.component')
          .then(m => m.UserDashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component')
          .then(m => m.ProfileComponent)
      },
      {
        path: 'programs',
        loadComponent: () => import('./features/program/program-list/program-list.component')
          .then(m => m.ProgramListComponent)
      },
      {
        path: 'programs/create',
        loadComponent: () => import('./features/program/create-program/create-program.component')
          .then(m => m.CreateProgramComponent)
      }
    ]
  },
  {
    path: 'admin',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./layouts/main-layout/main-layout.component')
          .then(m => m.MainLayoutComponent),
        canActivate: [authGuard, adminGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/dashboard/admin-dashboard/admin-dashboard.component')
              .then(m => m.AdminDashboardComponent)
          }
        ]
      },
      {
        path: 'users',
        loadComponent: () => import('./layouts/main-layout/main-layout.component')
          .then(m => m.MainLayoutComponent),
        canActivate: [authGuard, adminGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/user-list/user-list.component')
              .then(m => m.UserListComponent)
          }
        ]
      },
      {
        path: 'users/create',
        loadComponent: () => import('./layouts/main-layout/main-layout.component')
          .then(m => m.MainLayoutComponent),
        canActivate: [authGuard, adminGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/create-user/create-user.component')
              .then(m => m.CreateUserComponent)
          }
        ]
      }
    ]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
