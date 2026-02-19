import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.sass'
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() value: number | string = 0;
  @Input() icon: string = '';
  @Input() color: 'indigo' | 'emerald' | 'sky' | 'rose' | 'blue' | 'green' | 'orange' | 'red' = 'indigo';
  @Input() trend: string = '';
  @Input() isUp: boolean = true;

  getIconColorClass(): string {
    const colors: { [key: string]: string } = {
      indigo: 'bg-indigo-500 bg-opacity-10 text-indigo-600',
      emerald: 'bg-emerald-500 bg-opacity-10 text-emerald-600',
      sky: 'bg-sky-500 bg-opacity-10 text-sky-600',
      rose: 'bg-rose-500 bg-opacity-10 text-rose-600',
      blue: 'bg-indigo-500 bg-opacity-10 text-indigo-600',
      green: 'bg-emerald-500 bg-opacity-10 text-emerald-600',
      orange: 'bg-rose-500 bg-opacity-10 text-rose-600',
      red: 'bg-rose-500 bg-opacity-10 text-rose-600'
    };
    return colors[this.color] || colors['indigo'];
  }

  getTrendColorClass(): string {
    return this.isUp ? 'text-emerald-600' : 'text-rose-600';
  }

  getIconPath(): string {
    const icons: { [key: string]: string } = {
      'document-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'clock': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      'check-circle': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'x-circle': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return icons[this.icon] || icons['document-text'];
  }
}

