import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    InputComponent,
    CardComponent
  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.sass'
})
export class CreateUserComponent {
  createUserForm: FormGroup;
  loading = false;
  error = '';
  success = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public router: Router
  ) {
    this.createUserForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      gender: [''],
      profileId: [2, [Validators.required]] // 2 par défaut pour utilisateur normal
    });
  }

  onSubmit(): void {
    if (this.createUserForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = false;

      this.userService.createUser(this.createUserForm.value).subscribe({
        next: (response) => {
          if (response.status_code === 7000) {
            this.success = true;
            setTimeout(() => {
              this.router.navigate(['/admin/users']);
            }, 2000);
          } else {
            this.error = response.status_message || 'Erreur lors de la création';
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = error.error?.status_message || 'Erreur lors de la création de l\'utilisateur';
          this.loading = false;
        }
      });
    }
  }
}

