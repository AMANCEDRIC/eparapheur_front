import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IAccountDetail } from '../../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.sass'
})
export class HeaderComponent implements OnInit {
  @Input() isSidebarOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  currentUser: IAccountDetail | null = null;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner aux changements de l'utilisateur
    this.authService.currentUser$.subscribe((user: IAccountDetail | null) => {
      this.currentUser = user;
    });

    // Charger l'utilisateur si pas encore chargé
    if (this.authService.isAuthenticated() && !this.currentUser) {
      this.authService.loadCurrentUser().subscribe();
    }
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  getFullName(): string {
    if (this.currentUser?.person) {
      return `${this.currentUser.person.firstName} ${this.currentUser.person.lastName}`;
    }
    return this.currentUser?.login || 'Utilisateur';
  }

  getProfileName(): string {
    return this.currentUser?.profile?.name || 'Non défini';
  }

  getInitials(): string {
    if (this.currentUser?.person) {
      const first = this.currentUser.person.firstName?.charAt(0) || '';
      const last = this.currentUser.person.lastName?.charAt(0) || '';
      return (first + last).toUpperCase();
    }
    return this.currentUser?.login?.charAt(0).toUpperCase() || 'U';
  }

  hasPermission(permissionCode: string): boolean {
    return this.authService.hasPermission(permissionCode);
  }

  goToProfile(): void {
    this.router.navigate(['/dashboard/profile']);
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
}

