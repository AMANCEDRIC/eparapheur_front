import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-validate-account',
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
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <img class="mx-auto h-12 w-auto" src="assets/images/logos/Cryptoneo_logo.png" alt="E-Parapheur">
          <h2 class="mt-6 text-3xl font-extrabold text-slate-900">
            Activation de votre compte
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            Bienvenue sur e-Parapheur. Veuillez choisir un mot de passe pour finaliser l'activation de votre compte.
          </p>
        </div>

        <app-card>
          <form [formGroup]="validateForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <app-alert *ngIf="error" type="error" [message]="error"></app-alert>
            <app-alert *ngIf="success" type="success" message="Compte activé avec succès ! Redirection vers la page de connexion..."></app-alert>            <div class="space-y-4">
              <app-input
                label="Nouveau mot de passe"
                type="password"
                formControlName="password"
                placeholder="••••••••"
                [required]="true"
                icon="lock">
              </app-input>

              <!-- Password Strength Indicator & Instructions -->
              <div class="p-3 bg-blue-50 border border-blue-100 rounded-lg space-y-3">
                <div class="flex items-center gap-2 text-blue-800 font-medium text-xs">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                  </svg>
                  Exigences du mot de passe
                </div>
                
                <div class="flex gap-1 h-1">
                  <div *ngFor="let step of [1,2,3,4]" 
                       class="flex-1 rounded-full transition-colors duration-300"
                       [class.bg-blue-200]="passwordStrength < step"
                       [class.bg-red-500]="passwordStrength >= step && passwordStrength === 1"
                       [class.bg-orange-500]="passwordStrength >= step && passwordStrength === 2"
                       [class.bg-yellow-500]="passwordStrength >= step && passwordStrength === 3"
                       [class.bg-emerald-500]="passwordStrength >= step && passwordStrength === 4">
                  </div>
                </div>

                <ul class="text-[10px] space-y-1.5">
                  <li class="flex items-center gap-1.5" [class.text-emerald-600]="hasLength" [class.text-blue-400]="!hasLength">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    Au moins 8 caractères
                  </li>
                  <li class="flex items-center gap-1.5" [class.text-emerald-600]="hasUpper" [class.text-blue-400]="!hasUpper">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    Une majuscule
                  </li>
                  <li class="flex items-center gap-1.5" [class.text-emerald-600]="hasNumber" [class.text-blue-400]="!hasNumber">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    Un chiffre
                  </li>
                  <li class="flex items-center gap-1.5" [class.text-emerald-600]="hasSpecial" [class.text-blue-400]="!hasSpecial">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    Un caractère spécial (!&#64;#$%^&*)
                  </li>
                </ul>
              </div>

              <app-input
                label="Confirmer le mot de passe"
                type="password"
                formControlName="confirmPassword"
                placeholder="••••••••"
                [required]="true"
                icon="lock">
              </app-input>
              <p *ngIf="validateForm.errors?.['passwordMismatch'] && validateForm.get('confirmPassword')?.touched" class="text-xs text-red-500">
                Les mots de passe ne correspondent pas.
              </p>
            </div>

            <div class="pt-4">
              <app-button
                type="submit"
                [loading]="loading"
                [disabled]="validateForm.invalid || passwordStrength < 4"
                class="w-full">
                Activer mon compte
              </app-button>
            </div>
          </form>
        </app-card>
      </div>
    </div>
  `
})
export class ValidateAccountComponent implements OnInit {
  validateForm: FormGroup;
  loading = false;
  error = '';
  success = false;
  token = '';

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
    this.validateForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.validateForm.get('password')?.valueChanges.subscribe(val => {
      this.checkPasswordStrength(val);
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.error = 'Token d\'activation manquant. Veuillez utiliser le lien reçu par email.';
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  checkPasswordStrength(password: string): void {
    this.hasLength = password.length >= 8;
    this.hasUpper = /[A-Z]/.test(password);
    this.hasNumber = /[0-9]/.test(password);
    this.hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    this.passwordStrength = [this.hasLength, this.hasUpper, this.hasNumber, this.hasSpecial].filter(v => v).length;
  }

  onSubmit(): void {
    if (this.validateForm.valid && this.token && this.passwordStrength >= 4) {
      this.loading = true;
      this.error = '';

      this.authService.validateAccount(this.token, this.validateForm.value.password).subscribe({
        next: (response) => {
          if (response.status_code === 7000) {
            this.success = true;
            setTimeout(() => this.router.navigate(['/login']), 3000);
          } else {
            this.error = response.status_message || 'Erreur lors de l\'activation';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.status_message || 'Erreur lors de l\'activation. Le token est peut-être expiré.';
          this.loading = false;
        }
      });
    }
  }
}
