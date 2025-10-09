import { Component, OnInit, inject, effect, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { User } from '../../models/user.model';
import { CompletedTodosHistoryComponent } from '../../components/organisms/completed-todos-history/completed-todos-history.component';
import { PageTitleComponent } from '../../components/atoms/page-title/page-title.component';
import { LocationPickerComponent } from '../../components/organisms/location-picker/location-picker.component';
import { LocationStateService } from '../../services/location-state.service';
import { Subscription } from 'rxjs';
import { ButtonComponent } from '../../components/atoms/button/button.component';
@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  imports: [
    CompletedTodosHistoryComponent,
    PageTitleComponent,
    MatSlideToggleModule,
    LocationPickerComponent,
    ButtonComponent,
  ],
})
export class Profile implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  protected themeService = inject(ThemeService);
  private locationStateService = inject(LocationStateService);

  user: User | null = null;
  loading = true;
  error = '';
  preferredLocationName = '';
  isReverting = false;
  private locationSubscription?: Subscription;

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

    // react to location changes
    this.locationSubscription = this.locationStateService
      .getCurrentLocation()
      .subscribe((locationName) => {
        this.preferredLocationName = locationName;
      });

    this.loading = false;
  }

  async revertToLiveLocation() {
    this.isReverting = true;
    try {
      await this.locationStateService.revertToLiveLocation();
    } catch (error) {
      console.error('Error reverting to live location:', error);
    } finally {
      this.isReverting = false;
    }
  }

  ngOnDestroy() {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
  }
}
