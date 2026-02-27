import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFr',
  standalone: true
})
export class DateFrPipe implements PipeTransform {

  private readonly dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  private readonly shortFormatter = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  });

  transform(value?: string | Date | null, style: 'full' | 'short' = 'full'): string {
    if (!value) {
      return '-';
    }

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
      return '-';
    }

    if (style === 'short') {
      return this.shortFormatter.format(date);
    }

    return this.dateFormatter.format(date);
  }
}

