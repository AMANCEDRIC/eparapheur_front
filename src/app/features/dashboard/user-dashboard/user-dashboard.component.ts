import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SignatureService } from '../../../core/services/signature.service';
import { SignatureVisual } from '../../../core/models/signature.model';

interface StatCard {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  trend: string;
  isUp: boolean;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.sass'
})
export class UserDashboardComponent implements OnInit {
  stats: StatCard[] = [
    { 
      label: 'Programmes créés', 
      value: 20, 
      icon: 'doc',
      color: 'indigo',
      trend: '+12.5%',
      isUp: true
    },
    { 
      label: 'En attente', 
      value: 8, 
      icon: 'clock',
      color: 'emerald',
      trend: '+5.2%',
      isUp: true
    },
    { 
      label: 'Terminés', 
      value: 12, 
      icon: 'check',
      color: 'sky',
      trend: '-2.4%',
      isUp: false
    },
    { 
      label: 'En cours', 
      value: 5, 
      icon: 'activity',
      color: 'rose',
      trend: '+1.0%',
      isUp: true
    }
  ];

  signatureWidgetLoading = false;
  mySignatureVisual: SignatureVisual | null = null;

  programs = [
    {
      title: 'Accord virement',
      date: 'Du 26 Avr. au 30 Avr. 2024',
      signers: ['AK', 'AK', 'AK', '+10'],
      status: '75%',
      state: 'En cours'
    },
    {
      title: 'Accord virement',
      date: 'Du 26 Avr. au 30 Avr. 2024',
      signers: ['AK', 'AK', 'AK', '+10'],
      status: 'Terminé',
      state: 'Terminé'
    },
    {
      title: 'Accord virement',
      date: 'Du 26 Avr. au 30 Avr. 2024',
      signers: ['AK', 'AK', 'AK', '+10'],
      status: '95%',
      state: 'Terminé'
    }
  ];

  constructor(
    public authService: AuthService,
    private router: Router,
    private readonly signatureService: SignatureService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }
    this.loadSignatureForWidget();
  }

  private loadSignatureForWidget(): void {
    const u = this.authService.getCurrentUser();
    if (!u?.id) {
      return;
    }
    this.signatureWidgetLoading = true;
    this.signatureService.listVisuals(u.id).subscribe({
      next: (res) => {
        this.signatureWidgetLoading = false;
        if (res.status_code === 7000 && Array.isArray(res.data)) {
          const active = res.data.filter((v) => v.active);
          this.mySignatureVisual = this.signatureService.resolveDefaultVisual(active, u.id);
        } else {
          this.mySignatureVisual = null;
        }
      },
      error: () => {
        this.signatureWidgetLoading = false;
        this.mySignatureVisual = null;
      }
    });
  }

  getSignatureImageSrc(visual: SignatureVisual): string {
    if (visual.visualUrl) {
      return this.signatureService.formatFileUrl(visual.visualUrl);
    }
    if (!visual.image?.trim()) {
      return '';
    }
    if (visual.image.startsWith('data:')) {
      return visual.image;
    }
    return `data:image/png;base64,${visual.image}`;
  }

  hasVisualImage(visual: SignatureVisual | null): boolean {
    if (!visual) return false;
    return !!visual.visualUrl || !!visual.image?.trim();
  }

  getIconColorClass(color: string): string {
    const colors: { [key: string]: string } = {
      indigo: 'bg-indigo-500 bg-opacity-10 text-indigo-600',
      emerald: 'bg-emerald-500 bg-opacity-10 text-emerald-600',
      sky: 'bg-sky-500 bg-opacity-10 text-sky-600',
      rose: 'bg-rose-500 bg-opacity-10 text-rose-600'
    };
    return colors[color] || colors['indigo'];
  }

  getTrendColorClass(isUp: boolean): string {
    return isUp ? 'text-emerald-600' : 'text-rose-600';
  }
}

