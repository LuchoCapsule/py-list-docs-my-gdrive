import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-app-not-found',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './app-not-found.component.html',
  styleUrl: './app-not-found.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppNotFoundComponent { }
