import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersService = new UsersService();

  // Signal to track current user
  currentUser = signal<User | null>(null);
  private tokenKey = 'authToken';

  constructor() {
    // Load user from localStorage on init
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem(this.tokenKey);
    if (storedUser) this.currentUser.set(JSON.parse(storedUser));
    if (token) {
      // no-op; presence enables authenticated requests via getAuthHeaders
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid email or password');
      }

      const { user, token } = await response.json();
      this.currentUser.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem(this.tokenKey, token);
      return user as User;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to login'
      );
    }
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem(this.tokenKey);
  }

  getCurrentUserId(): string | null {
    return this.currentUser()?.id || null;
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  async register(name: string, email: string, password: string): Promise<User> {
    try {
      await this.usersService.createUser(name, email, password);
      // After successful creation, perform login to obtain JWT and user payload
      return await this.login(email, password);
    } catch (error) {
      throw error;
    }
  }

  getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem(this.tokenKey);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
