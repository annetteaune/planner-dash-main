import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PageTitleComponent } from '../../components/atoms/page-title/page-title.component';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { InputComponent } from '../../components/atoms/input/input.component';

// check if passwords match
function passwordsMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value
    ? null
    : { passwordsDontMatch: true };
}

@Component({
  selector: 'app-register ',
  standalone: true,
  templateUrl: './register.html',
  styleUrl: './register.scss',
  imports: [
    ReactiveFormsModule,
    PageTitleComponent,
    ButtonComponent,
    InputComponent,
  ],
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected loading = false;
  protected error = '';
  protected success = false;

  registerForm = new FormGroup(
    {
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(150),
        Validators.pattern(/.*\S.*/), //min one non whitespace char
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^\S+@\S+\.\S+$/), // no whitespace
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        ),
      ]),
      confirmPassword: new FormControl('', Validators.required),
    },
    { validators: passwordsMatchValidator }
  );

  protected async handleSubmit() {
    if (!this.registerForm.valid) {
      this.error = 'Please fix the form errors';
      return;
    }

    const { name, email, password } = this.registerForm.value;

    if (!name || !email || !password) {
      this.error = 'All fields are required';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    try {
      await this.authService.register(name, email, password);
      this.success = true;
      console.log('Registration successful');
      // navigate to profile after successful registration
      setTimeout(() => {
        this.router.navigate(['/profile']);
      }, 1000);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Registration failed';
      console.error('Registration error:', err);
    } finally {
      this.loading = false;
    }
  }

  get passwordsDontMatch(): boolean {
    return (
      this.registerForm.hasError('passwordsDontMatch') &&
      (this.registerForm.get('confirmPassword')?.touched ?? false)
    );
  }

  get passwordValue(): string {
    return this.registerForm.get('password')?.value || '';
  }

  hasMinLength(): boolean {
    return this.passwordValue.length >= 8;
  }

  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.passwordValue);
  }

  hasLowerCase(): boolean {
    return /[a-z]/.test(this.passwordValue);
  }

  hasNumber(): boolean {
    return /\d/.test(this.passwordValue);
  }

  hasSpecialChar(): boolean {
    return /[@$!%*?&]/.test(this.passwordValue);
  }
}
