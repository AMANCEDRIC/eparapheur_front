import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IAccountDetail } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.sass'
})
export class ProfileComponent implements OnInit {
  currentUser: IAccountDetail | null = null;

  constructor(public authService: AuthService) {}

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

  getProfileName(): string {
    return this.currentUser?.profile?.name || 'Non défini';
  }

  getStatusLabel(): string {
    return this.currentUser?.active ? 'Actif' : 'Inactif';
  }

  getStatusColor(): string {
    return this.currentUser?.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }
}

