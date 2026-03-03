import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AppNotification,
  AppNotificationService
} from '../../../core/services/app-notification.service';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-notification-container.component.html',
  styleUrl: './app-notification-container.component.sass'
})
export class AppNotificationContainerComponent {
  notifications$: Observable<AppNotification[]>;

  constructor(private appNotificationService: AppNotificationService) {
    this.notifications$ = this.appNotificationService.notifications$;
  }

  trackById(index: number, notif: AppNotification): number {
    return notif.id;
  }

  dismiss(id: number): void {
    this.appNotificationService.dismiss(id);
  }
}

