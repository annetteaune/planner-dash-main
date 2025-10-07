import { Component, OnInit, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { User } from '../../models/user.model';
import { CompletedTodosHistoryComponent } from '../../components/organisms/completed-todos-history/completed-todos-history.component';
import { PageTitleComponent } from '../../components/atoms/page-title/page-title.component';
@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  imports: [
    CompletedTodosHistoryComponent,
    PageTitleComponent,
    MatSlideToggleModule,
  ],
})
export class Profile implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  protected themeService = inject(ThemeService);

  user: User | null = null;
  loading = true;
  error = '';

  constructor() {
    // react to auth changes
    effect(() => {
      this.user = this.authService.currentUser();
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  async ngOnInit() {
    // check if logged in
    if (!this.authService.isLoggedIn()) {
      this.error = 'Please log in to view your profile';
      this.loading = false;
      //  redirect to home if not logged in
      this.router.navigate(['/']);
      return;
    }

    this.user = this.authService.currentUser();
    this.loading = false;
  }
}
