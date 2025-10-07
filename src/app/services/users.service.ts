import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = '/api/users';

  async getUserById(id: string): Promise<User> {
    const response = await fetch(`${this.apiUrl}?id=${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserByEmail(email: string): Promise<User> {
    const response = await fetch(`${this.apiUrl}?email=${email}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return response.json();
  }

  async createUser(
    name: string,
    email: string,
    password: string
  ): Promise<User> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }

    return response.json();
  }
}
