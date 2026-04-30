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
    path: 'accounts',
    children: [
      {
        path: 'validate',
        loadComponent: () => import('./features/auth/validate-account/validate-account.component')
          .then(m => m.ValidateAccountComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component')
          .then(m => m.ResetPasswordComponent)
      }
    ]
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
        path: 'signatures',
        loadComponent: () => import('./features/signature-visuals/signature-visuals.component')
          .then(m => m.SignatureVisualsComponent)
      },
      {
        path: 'programs',
        children: [
          {
            path: '',
            redirectTo: 'all',
            pathMatch: 'full'
          },
          {
            path: 'all',
            loadComponent: () => import('./features/program/program-list/program-list.component')
              .then(m => m.ProgramListComponent),
            data: { listType: 'all' }
          },
          {
            path: 'my-creations',
            loadComponent: () => import('./features/program/program-list/program-list.component')
              .then(m => m.ProgramListComponent),
            data: { listType: 'creations' }
          },
          {
            path: 'involved',
            loadComponent: () => import('./features/program/program-list/program-list.component')
              .then(m => m.ProgramListComponent),
            data: { listType: 'involved' }
          },
          {
            path: 'create',
            loadComponent: () => import('./features/program/create-program/create-program.component')
              .then(m => m.CreateProgramComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/program/program-detail/program-detail.component')
              .then(m => m.ProgramDetailComponent)
          }
        ]
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
