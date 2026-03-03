import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppNotificationContainerComponent } from './shared/components/app-notification/app-notification-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppNotificationContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent {
  title = 'eparapheur_front';
}
