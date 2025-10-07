import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ButtonComponent } from '../../atoms/button/button.component';
import { InputComponent } from '../../atoms/input/input.component';
import { PageTitleComponent } from '../../atoms/page-title/page-title.component';

// template driven form

@Component({
  selector: 'app-login-form',
  standalone: true,
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
  imports: [FormsModule, ButtonComponent, InputComponent, PageTitleComponent],
})
export class LoginFormComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected email = '';
  protected password = '';
  protected error = '';
  protected loading = false;

  async handleLogin() {
    if (!this.email) {
      this.error = 'Email is required';
      return;
    }

    if (!this.password) {
      this.error = 'Password is required';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.authService.login(this.email, this.password);
      console.log('Login successful');
      // navigate to dash after login
      this.router.navigate(['/dash']);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Login failed';
      console.error('Login error:', err);
    } finally {
      this.loading = false;
    }
  }
}
