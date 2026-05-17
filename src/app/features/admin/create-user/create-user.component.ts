import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { PhoneInputComponent } from '../../../shared/components/phone-input/phone-input.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CreateUserRequest, IApiResponse } from '../../../core/models';
import { forkJoin } from 'rxjs';

interface DraftUser {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  profileId: number;
  profileLabel: string;
}

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    InputComponent,
    PhoneInputComponent,
    CardComponent
  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.sass'
})
export class CreateUserComponent {
  createUserForm: FormGroup;
  loadingAdd = false;
  loadingCreate = false;
  error = '';
  profiles: number[] = [1, 2, 3, 4, 5];
  selectedDraftIndex: number | null = null;
  draftUsers: DraftUser[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public router: Router
  ) {
    this.createUserForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{7,15}$/)]],
      gender: ['', [Validators.required]],
      profileId: [2, [Validators.required]] // 2 par défaut pour utilisateur normal
    });
  }

  /**
   * Ajoute le formulaire courant à la liste locale des utilisateurs à créer
   * ou met à jour un utilisateur déjà présent si sélectionné
   */
  onAddToDraft(): void {
    if (this.createUserForm.invalid || this.loadingAdd) {
      this.createUserForm.markAllAsTouched();
      return;
    }

    this.loadingAdd = true;
    this.error = '';

    const value = this.createUserForm.value;

    const newDraft: DraftUser = {
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      phone: value.phone,
      gender: value.gender,
      profileId: value.profileId,
      profileLabel: this.getProfileLabel(value.profileId)
    };

    if (this.selectedDraftIndex !== null) {
      // Mise à jour de l'utilisateur sélectionné
      this.draftUsers = this.draftUsers.map((u, index) =>
        index === this.selectedDraftIndex ? newDraft : u
      );
    } else {
      // Ajout d'un nouvel utilisateur
      this.draftUsers = [...this.draftUsers, newDraft];
    }

    this.createUserForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: '',
      profileId: 2
    });
    this.selectedDraftIndex = null;

    // petite pause pour laisser le temps à l'UI de refléter l'état
    setTimeout(() => {
      this.loadingAdd = false;
    }, 150);
  }

  /**
   * Retire un utilisateur de la liste locale
   */
  removeDraftUser(user: DraftUser): void {
    this.draftUsers = this.draftUsers.filter(u => u !== user);
  }

  /**
   * Création de tous les utilisateurs en une seule fois
   */
  onCreateAll(): void {
    if (!this.draftUsers.length || this.loadingCreate) {
      return;
    }

    this.loadingCreate = true;
    this.error = '';

    const requests = this.draftUsers.map((user) => {
      const payload: CreateUserRequest = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        profileId: user.profileId
      };
      return this.userService.createUser(payload);
    });

    forkJoin(requests).subscribe({
      next: (responses: IApiResponse<any>[]) => {
        const hasError = responses.some(r => r.status_code !== 7000);

        if (hasError) {
          const firstError = responses.find(r => r.status_code !== 7000);
          this.error = firstError?.status_message || 'Erreur lors de la création des utilisateurs';
        } else {
          this.draftUsers = [];
          this.router.navigate(['/admin/users']);
        }

        this.loadingCreate = false;
      },
      error: (error: any) => {
        this.error = error?.error?.status_message || 'Erreur lors de la création des utilisateurs';
        this.loadingCreate = false;
      }
    });
  }

  /**
   * TrackBy pour la liste afin d'optimiser le rendu
   */
  trackByDraftUser(_index: number, user: DraftUser): string {
    return user.email;
  }

  /**
   * Charge un utilisateur de la liste dans le formulaire pour édition
   */
  onSelectDraftUser(user: DraftUser, index: number): void {
    this.selectedDraftIndex = index;
    this.createUserForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      gender: user.gender || '',
      profileId: user.profileId
    });
  }

  /**
   * Libellé du profil pour l'affichage du badge
   */
  getProfileLabel(profileId: number): string {
    switch (profileId) {
      case 1:
        return 'Root';
      case 2:
        return 'ADMIN';
      case 3:
        return 'MANAGER';
        case 4:
          return 'AGENT';
          case 5:
            return 'AE';

      default:
        return 'Utilisateur';
    }
  }
}

