import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonComponent,
    InputComponent,
    CardComponent
  ],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.sass'
})
export class VerifyOtpComponent implements OnInit {
  otpForm: FormGroup;
  loading = false;
  error = '';
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.router.navigate(['/login']);
      }
    });
  }

  onSubmit(): void {
    if (this.otpForm.valid && this.token) {
      this.loading = true;
      this.error = '';

      this.authService.verifyOtp({ token: this.token, otp: this.otpForm.value.otp }).subscribe({
        next: (response) => {
          if (response.status_code === 7000) {
            this.router.navigate(['/dashboard']);
          } else {
            this.error = response.status_message || 'Code OTP invalide';
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = error.error?.status_message || 'Erreur lors de la vérification';
          this.loading = false;
        }
      });
    }
  }
}

