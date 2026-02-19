import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signature-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signature-chart.component.html',
  styleUrl: './signature-chart.component.sass'
})
export class SignatureChartComponent {
  // Placeholder pour le graphique
  // À implémenter avec Chart.js ou ngx-charts quand disponible
}

