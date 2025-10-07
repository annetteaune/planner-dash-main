import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ButtonComponent } from '../../atoms/button/button.component';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matMenuOutline,
  matCloseOutline,
} from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, ButtonComponent, NgIconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  viewProviders: [provideIcons({ matMenuOutline, matCloseOutline })],
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loggedIn = computed(() => this.authService.currentUser() !== null);
  mobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.mobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.closeMobileMenu();
  }
}
