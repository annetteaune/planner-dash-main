import { Component, inject } from '@angular/core';
import { LoginFormComponent } from '../../components/organisms/login-form/login-form.component';
import { AuthService } from '../../services/auth.service';
import { PageTitleComponent } from '../../components/atoms/page-title/page-title.component';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [LoginFormComponent, PageTitleComponent, ButtonComponent],
})
export class Home {
  protected authService = inject(AuthService);
  protected router = inject(Router);

  protected navigateToDash() {
    this.router.navigate(['/dash']);
  }
}
