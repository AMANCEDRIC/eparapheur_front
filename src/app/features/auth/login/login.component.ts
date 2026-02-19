import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.sass'
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  otpForm: FormGroup;
  loading = false;
  error = '';
  showOtp = false;
  tempToken = '';
  showPassword = false;
  otpSent = false;
  userEmail = '';
  
  // Timer OTP
  timerMinutes = 3;
  timerSeconds = 0;
  timerInterval: any;
  
  // Références aux champs OTP
  @ViewChild('otpInput1') otpInput1!: ElementRef;
  @ViewChild('otpInput2') otpInput2!: ElementRef;
  @ViewChild('otpInput3') otpInput3!: ElementRef;
  @ViewChild('otpInput4') otpInput4!: ElementRef;
  @ViewChild('otpInput5') otpInput5!: ElementRef;
  @ViewChild('otpInput6') otpInput6!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.otpForm = this.fb.group({
      otp1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      otp2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      otp3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      otp4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      otp5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      otp6: ['', [Validators.required, Validators.pattern(/^\d$/)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          if (response.status_code === 7000) {
            // Vérifier si OTP est requis ou si le message indique qu'un OTP a été envoyé
            const message = response.status_message || response.data.message || '';
            const requiresOtp = response.data.requiresOtp === true || message.toLowerCase().includes('otp');
            
            if (requiresOtp) {
              // Afficher le champ OTP pour les admins
              this.tempToken = response.data.token || '';
              this.userEmail = this.loginForm.value.login || '';
              this.otpSent = true;
              this.showOtp = true;
              this.error = ''; // Réinitialiser les erreurs
              this.loading = false;
              this.startTimer();
              // Focus sur le premier champ OTP après un court délai
              setTimeout(() => {
                this.focusOtpInput(1);
              }, 100);
            } else {
              // Connexion réussie, rediriger selon le profil
              this.redirectBasedOnProfile();
            }
          } else {
            // Vérifier si le message indique qu'un OTP a été envoyé
            const message = response.status_message || '';
            if (message.toLowerCase().includes('otp')) {
              // Si le backend indique qu'un OTP a été envoyé, afficher le formulaire OTP
              this.tempToken = response.data?.token || '';
              this.userEmail = this.loginForm.value.login || '';
              this.otpSent = true;
              this.showOtp = true;
              this.error = '';
              this.loading = false;
              this.startTimer();
              setTimeout(() => {
                this.focusOtpInput(1);
              }, 100);
            } else {
              this.error = message || 'Erreur lors de la connexion';
              this.loading = false;
            }
          }
        },
        error: (error) => {
          const errorMessage = error.error?.status_message || error.message || 'Erreur lors de la connexion';
          // Vérifier si le message d'erreur indique qu'un OTP a été envoyé
          if (errorMessage.toLowerCase().includes('otp')) {
            this.tempToken = error.error?.data?.token || '';
            this.userEmail = this.loginForm.value.login || '';
            this.otpSent = true;
            this.showOtp = true;
            this.error = '';
            this.loading = false;
            this.startTimer();
            setTimeout(() => {
              this.focusOtpInput(1);
            }, 100);
          } else {
            this.error = errorMessage;
            this.loading = false;
          }
        }
      });
    }
  }

  onVerifyOtp(): void {
    const otpCode = this.getOtpCode();
    if (otpCode.length === 6 && this.tempToken) {
      this.loading = true;
      this.error = '';

      this.authService.verifyOtp({ token: this.tempToken, otp: otpCode }).subscribe({
        next: (response) => {
          if (response.status_code === 7000) {
            this.stopTimer();
            // Rediriger selon le profil de l'utilisateur
            this.redirectBasedOnProfile();
          } else {
            this.error = response.status_message || 'Code OTP invalide';
            this.loading = false;
            // Réinitialiser les champs OTP en cas d'erreur
            this.resetOtpFields();
          }
        },
        error: (error) => {
          this.error = error.error?.status_message || 'Erreur lors de la vérification';
          this.loading = false;
          this.resetOtpFields();
        }
      });
    }
  }

  getOtpCode(): string {
    return (
      this.otpForm.value.otp1 +
      this.otpForm.value.otp2 +
      this.otpForm.value.otp3 +
      this.otpForm.value.otp4 +
      this.otpForm.value.otp5 +
      this.otpForm.value.otp6
    );
  }

  resetOtpFields(): void {
    this.otpForm.reset();
    setTimeout(() => {
      this.focusOtpInput(1);
    }, 100);
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Ne garder que le premier chiffre
    if (value.length > 1) {
      input.value = value.charAt(0);
      this.otpForm.get(`otp${index}`)?.setValue(value.charAt(0));
    }

    // Si un chiffre est entré, passer au champ suivant
    if (value.length === 1 && index < 6) {
      this.focusOtpInput(index + 1);
    }

    // Vérifier si tous les champs sont remplis pour soumettre automatiquement
    if (this.getOtpCode().length === 6) {
      // Optionnel : soumettre automatiquement
      // this.onVerifyOtp();
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    
    // Gérer le backspace
    if (event.key === 'Backspace' && input && !input.value && index > 1) {
      this.focusOtpInput(index - 1);
    }

    // Autoriser uniquement les chiffres
    if (event.key.length === 1 && !/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    for (let i = 0; i < 6; i++) {
      const value = digits[i] || '';
      this.otpForm.get(`otp${i + 1}`)?.setValue(value);
    }

    // Focus sur le dernier champ rempli ou le premier champ vide
    const firstEmptyIndex = digits.length < 6 ? digits.length + 1 : 6;
    this.focusOtpInput(firstEmptyIndex);
  }

  focusOtpInput(index: number): void {
    const inputMap: { [key: number]: ElementRef } = {
      1: this.otpInput1,
      2: this.otpInput2,
      3: this.otpInput3,
      4: this.otpInput4,
      5: this.otpInput5,
      6: this.otpInput6
    };

    const input = inputMap[index];
    if (input && input.nativeElement) {
      input.nativeElement.focus();
    }
  }

  startTimer(): void {
    this.timerMinutes = 3;
    this.timerSeconds = 0;
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
      } else if (this.timerMinutes > 0) {
        this.timerMinutes--;
        this.timerSeconds = 59;
      } else {
        this.stopTimer();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getTimerDisplay(): string {
    const minutes = this.timerMinutes.toString().padStart(1, '0');
    const seconds = this.timerSeconds.toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  resendOtp(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';
      this.resetOtpFields();
      this.stopTimer();

      // Réutiliser le login pour renvoyer l'OTP
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          if (response.status_code === 7000 || response.data?.token) {
            this.tempToken = response.data?.token || '';
            this.otpSent = true;
            this.error = '';
            this.loading = false;
            this.startTimer();
            setTimeout(() => {
              this.focusOtpInput(1);
            }, 100);
          } else {
            this.error = response.status_message || 'Erreur lors de l\'envoi du code';
            this.loading = false;
          }
        },
        error: (error) => {
          this.error = error.error?.status_message || 'Erreur lors de l\'envoi du code';
          this.loading = false;
        }
      });
    }
  }

  private redirectBasedOnProfile(): void {
    // Attendre un peu pour que le token soit bien enregistré et l'utilisateur mis à jour
    setTimeout(() => {
      const route = this.authService.getDashboardRoute();
      this.router.navigate([route]);
    }, 100);
  }

  backToLogin(): void {
    this.showOtp = false;
    this.otpSent = false;
    this.otpForm.reset();
    this.tempToken = '';
    this.error = '';
    this.stopTimer();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
