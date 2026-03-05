import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { IAccountDetail, IPaginatedResponse } from '../../../core/models';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.sass'
})
export class UserListComponent implements OnInit {
  users: IAccountDetail[] = [];
  filteredUsers: IAccountDetail[] = [];
  loading = false;
  error = '';
  currentPage = 1;
  pageSize = 20;
  total = 0;
  pageSizeOptions = [10, 20, 50, 100];
  searchQuery = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.userService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (response: IPaginatedResponse<IAccountDetail>) => {
        if (response.statusCode === 7000) {
          this.users = response.data.items;
          this.filteredUsers = response.data.items;
          this.total = response.data.total;
          this.currentPage = response.data.page;
          this.pageSize = response.data.pageSize;
          // Appliquer la recherche si une requête existe
          if (this.searchQuery.trim()) {
            this.applySearch();
          }
        } else {
          this.error = response.statusMessage || 'Erreur lors du chargement';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des utilisateurs';
        this.loading = false;
        console.error(error);
      }
    });
  }

  /**
   * Recherche dans la liste des utilisateurs
   */
  onSearch(): void {
    this.applySearch();
  }

  /**
   * Applique la recherche sur les utilisateurs
   */
  applySearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredUsers = this.users;
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredUsers = this.users.filter(user => {
      const fullName = this.getFullName(user).toLowerCase();
      const email = user.login?.toLowerCase() || '';
      return fullName.includes(query) || email.includes(query);
    });
  }

  /**
   * Gère le clic sur le bouton filtres
   */
  onFilterClick(): void {
    // TODO: Implémenter l'ouverture d'un modal ou dropdown de filtres
    console.log('Ouvrir les filtres');
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1; // Retourner à la première page
    this.loadUsers();
  }

  getTotalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get Math() {
    return Math;
  }

  /**
   * Récupère le nom complet de l'utilisateur
   */
  getFullName(user: IAccountDetail): string {
    if (user.person) {
      return `${user.person.firstName} ${user.person.lastName}`;
    }
    return user.login;
  }

  /**
   * Récupère le nom du profil
   */
  getProfileName(user: IAccountDetail): string {
    return user.profile?.name || 'Non défini';
  }

  /**
   * Récupère les initiales de l'utilisateur pour l'avatar par défaut
   */
  getInitials(user: IAccountDetail): string {
    if (user.person) {
      const first = user.person.firstName?.charAt(0) || '';
      const last = user.person.lastName?.charAt(0) || '';
      return (first + last).toUpperCase();
    }
    return user.login?.charAt(0).toUpperCase() || '?';
  }

  /**
   * Génère une couleur pour l'avatar par défaut basée sur l'ID
   */
  getAvatarColor(user: IAccountDetail): string {
    // Palette volontairement désaturée / grisée pour que les avatars restent discrets
    const colors = [
      '#E5E7EB', // gray-200
      '#D1D5DB', // gray-300
      '#CBD5F5', // bleu très pâle
      '#E5E4FF', // violet très pâle
      '#F3E8FF', // mauve clair
      '#E0F2FE', // bleu ciel clair
      '#F1F5F9', // slate-100
      '#E2E8F0'  // slate-200
    ];
    const index = (user.id || 0) % colors.length;
    return colors[index];
  }

  /**
   * Action : Modifier un utilisateur
   */
  onEdit(user: IAccountDetail): void {
    // TODO: Implémenter la navigation vers la page d'édition
    console.log('Modifier utilisateur:', user);
    // Exemple: this.router.navigate(['/admin/users/edit', user.id]);
  }

  /**
   * Action : Bloquer/Débloquer un utilisateur
   */
  onToggleBlock(user: IAccountDetail): void {
    const action = user.active ? 'bloquer' : 'débloquer';
    const confirmMessage = `Êtes-vous sûr de vouloir ${action} l'utilisateur ${this.getFullName(user)} ?`;
    
    if (confirm(confirmMessage)) {
      this.userService.toggleUserStatus(user.id, !user.active).subscribe({
        next: (response) => {
          if (response.status_code === 7000) {
            // Mettre à jour le statut localement
            user.active = !user.active;
            // Optionnel: recharger la liste
            // this.loadUsers();
          } else {
            this.error = response.status_message || `Erreur lors du ${action}`;
          }
        },
        error: (error) => {
          this.error = error.error?.status_message || `Erreur lors du ${action} de l'utilisateur`;
          console.error(error);
        }
      });
    }
  }

  /**
   * Action : Supprimer un utilisateur
   */
  onDelete(user: IAccountDetail): void {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer l'utilisateur ${this.getFullName(user)} ?\nCette action est irréversible.`;
    
    if (confirm(confirmMessage)) {
      this.userService.deleteUser(user.id).subscribe({
        next: (response) => {
          if (response.status_code === 7000) {
            // Recharger la liste des utilisateurs
            this.loadUsers();
          } else {
            this.error = response.status_message || 'Erreur lors de la suppression';
          }
        },
        error: (error) => {
          this.error = error.error?.status_message || 'Erreur lors de la suppression de l\'utilisateur';
          console.error(error);
        }
      });
    }
  }
}

