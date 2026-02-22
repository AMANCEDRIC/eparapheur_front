import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CreateSignatureProgramRequest
} from '../../../core/models/signature-program.model';
import { ProgramService } from '../../../core/services/program.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { IAccountDetail, IPaginatedResponse } from '../../../core/models';
import { StepOneComponent } from './step-one/step-one.component';
import { StepTwoComponent } from './step-two/step-two.component';
import { StepThreeComponent } from './step-three/step-three.component';
import { StepFourComponent } from './step-four/step-four.component';

@Component({
  selector: 'app-create-program',
  standalone: true,
  imports: [
    CommonModule,
    StepOneComponent,
    StepTwoComponent,
    StepThreeComponent,
    StepFourComponent
  ],
  templateUrl: './create-program.component.html'
})
export class CreateProgramComponent {
  currentStep = 1;

  draftProgram: Omit<CreateSignatureProgramRequest, 'otp' | 'email'> = {
    label: '',
    description: '',
    programType: 'INTERNAL_FLOW',
    startDate: '',
    endDate: '',
    documents: [],
    steps: []
  };

  otp = '';
  email = '';
  loading = false;
  error = '';
  success = '';
  users: IAccountDetail[] = [];

  constructor(
    private programService: ProgramService,
    private userService: UserService,
    private authService: AuthService
  ) {
    const currentUser = this.authService.getCurrentUser();
    this.email = currentUser?.login ?? '';
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers(1, 100).subscribe({
      next: (response: IPaginatedResponse<IAccountDetail>) => {
        if (response.statusCode === 7000) {
          this.users = response.data.items;
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs pour les participants', err);
      }
    });
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  onUpdateGeneral(payload: {
    label: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    documents: CreateSignatureProgramRequest['documents'];
  }): void {
    this.draftProgram = {
      ...this.draftProgram,
      ...payload,
      programType: 'INTERNAL_FLOW'
    };
    this.goToStep(2);
  }

  onUpdateSteps(steps: CreateSignatureProgramRequest['steps']): void {
    this.draftProgram = {
      ...this.draftProgram,
      steps
    };
    this.goToStep(3);
  }

  onRequestOtp(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    const detail = this.draftProgram.label || 'Création de programme de signature';

    this.authService.requestProgramOtp(detail).subscribe({
      next: (res) => {
        this.success = res.status_message || 'Un code OTP vient de vous être envoyé.';
        this.goToStep(4); 
        this.loading = false;
      },
      error: (err) => {
        this.error =
          err?.error?.status_message || 'Erreur lors de l’envoi du code OTP.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmitProgram(data: { otp: string }): void {
    this.otp = data.otp;

    const payload: CreateSignatureProgramRequest = {
      ...this.draftProgram,
      otp: this.otp,
      email: this.email
    };

    this.loading = true;
    this.error = '';
    this.success = '';

    this.programService.createProgram(payload).subscribe({
      next: (res) => {
        if (res.status_code === 7000) {
          this.success = 'Programme créé avec succès.';
        } else {
          this.error = res.status_message || 'Erreur lors de la création du programme.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error =
          err?.error?.status_message || 'Erreur lors de la création du programme.';
        this.loading = false;
        console.error(err);
      }
    });
  }
}


