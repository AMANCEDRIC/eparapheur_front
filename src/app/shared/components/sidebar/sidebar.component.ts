import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IAccountDetail } from '../../../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.sass'
})
export class SidebarComponent implements OnInit {
  @Input() isOpen: boolean = true;
  @Input() currentRoute: string = '';
  currentUser: IAccountDetail | null = null;
  isProgramsMenuOpen: boolean = false;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    // S'abonner aux changements de l'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Charger l'utilisateur si pas encore chargé
    if (this.authService.isAuthenticated() && !this.currentUser) {
      this.authService.loadCurrentUser().subscribe();
    }

    // Ouvrir le menu si on est déjà sur une route de programme
    if (window.location.pathname.includes('/dashboard/programs')) {
      this.isProgramsMenuOpen = true;
    }
  }

  toggleProgramsMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isProgramsMenuOpen = !this.isProgramsMenuOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        window.location.href = '/login';
      },
      error: () => {
        window.location.href = '/login';
      }
    });
  }

  // Vérifie si l'utilisateur peut voir la section administration
  canAccessAdminSection(): boolean {
    // isAdmin() vérifie déjà ADMIN ou ROOT, donc pas besoin de vérifier isRoot() séparément
    return this.authService.isAdmin();
  }

  // Vérifie si l'utilisateur peut gérer les utilisateurs
  canManageUsers(): boolean {
    return this.authService.hasPermission('CAN_MANAGE_USER_ACCOUNTS') || 
           this.authService.isAdmin() || 
           this.authService.isRoot();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getProfileName(): string {
    return this.authService.getProfileName();
  }

  getFullName(): string {
    if (this.currentUser?.person) {
      return `${this.currentUser.person.firstName} ${this.currentUser.person.lastName}`;
    }
    return this.currentUser?.login || 'Utilisateur';
  }

  getInitials(): string {
    if (this.currentUser?.person) {
      const first = this.currentUser.person.firstName?.charAt(0) || '';
      const last = this.currentUser.person.lastName?.charAt(0) || '';
      return (first + last).toUpperCase();
    }
    return this.currentUser?.login?.charAt(0).toUpperCase() || 'U';
  }
}

