import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IAccountDetail } from '../../../core/models';

@Component({
  selector: 'app-user-selection-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-selection-modal.component.html'
})
export class UserSelectionModalComponent implements OnInit, OnChanges {
  @Input() users: IAccountDetail[] = [];
  @Input() selectedUserIds: number[] = []; // IDs déjà sélectionnés (pour exclure)
  @Input() isOpen = false;

  @Output() close = new EventEmitter<void>();
  @Output() validate = new EventEmitter<IAccountDetail[]>();

  searchQuery = '';
  selectedUsers: IAccountDetail[] = [];

  ngOnInit(): void {
    if (this.isOpen) {
      this.resetSelection();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.resetSelection();
    }
  }

  resetSelection(): void {
    this.selectedUsers = [];
    this.searchQuery = '';
  }

  get filteredUsers(): IAccountDetail[] {
    if (!this.searchQuery.trim()) {
      return this.users.filter(u => !this.selectedUserIds.includes(u.id));
    }

    const query = this.searchQuery.toLowerCase();
    return this.users.filter(user => {
      // Exclure les utilisateurs déjà sélectionnés
      if (this.selectedUserIds.includes(user.id)) {
        return false;
      }

      // Recherche par nom, prénom, email, téléphone
      const firstName = user.person?.firstName?.toLowerCase() || '';
      const lastName = user.person?.lastName?.toLowerCase() || '';
      const email = user.login?.toLowerCase() || '';
      const phone = user.person?.phone?.toLowerCase() || '';

      return firstName.includes(query) ||
             lastName.includes(query) ||
             email.includes(query) ||
             phone.includes(query);
    });
  }

  toggleUserSelection(user: IAccountDetail): void {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    if (index === -1) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(index, 1);
    }
  }

  isUserSelected(user: IAccountDetail): boolean {
    return this.selectedUsers.some(u => u.id === user.id);
  }

  getUserFullName(user: IAccountDetail): string {
    if (user.person) {
      const first = user.person.firstName || '';
      const last = user.person.lastName || '';
      return `${first} ${last}`.trim() || user.login;
    }
    return user.login;
  }

  getUserInitials(user: IAccountDetail): string {
    if (user.person) {
      const first = user.person.firstName?.charAt(0) || '';
      const last = user.person.lastName?.charAt(0) || '';
      return (first + last).toUpperCase() || user.login.charAt(0).toUpperCase();
    }
    return user.login.charAt(0).toUpperCase();
  }

  getUserFunction(user: IAccountDetail): string {
    return user.profile?.name || 'Non défini';
  }

  getAvatarColor(user: IAccountDetail): string {
    const colors = ['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
    const index = (user.id || 0) % colors.length;
    return colors[index];
  }

  onClose(): void {
    this.resetSelection();
    this.close.emit();
  }

  onValidate(): void {
    if (this.selectedUsers.length > 0) {
      this.validate.emit([...this.selectedUsers]);
      this.resetSelection();
      this.close.emit();
    }
  }

  get canValidate(): boolean {
    return this.selectedUsers.length > 0;
  }
}

