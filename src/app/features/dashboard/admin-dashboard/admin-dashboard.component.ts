import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { StatsCardComponent } from '../components/stats-card/stats-card.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatsCardComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.sass'
})
export class AdminDashboardComponent implements OnInit {
  totalUsers = 0;
  loading = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.userService.getStats().subscribe({
      next: (response) => {
        if (response.status_code === 7000) {
          this.totalUsers = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stats', error);
        this.loading = false;
      }
    });
  }
}

