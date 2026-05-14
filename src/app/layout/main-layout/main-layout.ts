import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  menuOpen = false

  constructor(public auth: AuthService) {}

  logout(): void {
    this.auth.logout()
  }
}
