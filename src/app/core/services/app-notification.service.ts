import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppNotificationStatus = 'success' | 'error' | 'info' | 'warning';

export interface AppNotification {
  id: number;
  status: AppNotificationStatus;
  description: string;
  title?: string;
  createdAt: number;
  durationMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppNotificationService {
  private readonly notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  readonly notifications$ = this.notificationsSubject.asObservable();

  private idCounter = 1;

  /**
   * Méthode générique pour afficher une notification.
   * Signature inspirée de l'ancien AppNotificationService (status + description + options).
   */
  show(
    status: AppNotificationStatus,
    description: string,
    options?: {
      title?: string;
      durationMs?: number;
    }
  ): void {
    const duration = options?.durationMs ?? 5000;

    const notification: AppNotification = {
      id: this.idCounter++,
      status,
      description,
      title: options?.title,
      createdAt: Date.now(),
      durationMs: duration
    };

    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, notification]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(notification.id), duration);
    }
  }

  success(description: string, title?: string): void {
    this.show('success', description, { title });
  }

  error(description: string, title?: string): void {
    this.show('error', description, { title });
  }

  info(description: string, title?: string): void {
    this.show('info', description, { title });
  }

  warning(description: string, title?: string): void {
    this.show('warning', description, { title });
  }

  dismiss(id: number): void {
    const remaining = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(remaining);
  }

  clear(): void {
    this.notificationsSubject.next([]);
  }
}

