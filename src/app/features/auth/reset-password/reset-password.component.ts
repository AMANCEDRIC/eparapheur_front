import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import {AlertComponent} from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    InputComponent,
    CardComponent,
    AlertComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.sass'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  loading = false;
  error = '';
  success = false;
  token: string = '';

  passwordStrength = 0;
  hasLength = false;
  hasUpper = false;
  hasNumber = false;
  hasSpecial = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.resetPasswordForm.get('password')?.valueChanges.subscribe(val => {
      this.checkPasswordStrength(val);
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.error = 'Token de réinitialisation manquant.';
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  checkPasswordStrength(password: string): void {
    this.hasLength = (password || '').length >= 8;
    this.hasUpper = /[A-Z]/.test(password || '');
    this.hasNumber = /[0-9]/.test(password || '');
    this.hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password || '');

    this.passwordStrength = [this.hasLength, this.hasUpper, this.hasNumber, this.hasSpecial].filter(v => v).length;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.token && this.passwordStrength >= 4) {
      this.loading = true;
      this.error = '';

      this.authService.resetPassword(this.token, this.resetPasswordForm.value.password).subscribe({
        next: (response) => {
          if (response.status_code === 7000) {
            this.success = true;
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000);
          } else {
            this.error = response.status_message || 'Erreur lors de la réinitialisation';
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = error.error?.status_message || 'Erreur lors de la réinitialisation';
          this.loading = false;
        }
      });
    }
  }
}

