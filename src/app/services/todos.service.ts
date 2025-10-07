import { Injectable, inject } from '@angular/core';
import { Todo } from '../models/todo.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  private apiUrl = '/api/todos';
  private auth = inject(AuthService);

  async getTodosByUserId(userId: string): Promise<Todo[]> {
    const response = await fetch(`${this.apiUrl}?user_id=${userId}`, {
      headers: {
        ...this.auth.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch todos: ${response.statusText}`);
    }

    return response.json();
  }

  async createTodo(
    userId: string,
    text: string,
    dueAt?: string | null,
    priority?: number
  ): Promise<{ id: string }> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.auth.getAuthHeaders(),
      },
      body: JSON.stringify({
        user_id: userId,
        text,
        due_at: dueAt,
        priority,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create todo');
    }

    return response.json();
  }

  async updateTodo(
    id: string,
    updates: Partial<Pick<Todo, 'completed' | 'text' | 'due_at' | 'priority'>>
  ): Promise<Todo> {
    const response = await fetch(this.apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.auth.getAuthHeaders(),
      },
      body: JSON.stringify({
        id,
        ...updates,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update todo');
    }

    return response.json();
  }

  async deleteCompletedTodos(
    userId: string
  ): Promise<{ message: string; count: number }> {
    const response = await fetch(`${this.apiUrl}?user_id=${userId}`, {
      method: 'DELETE',
      headers: {
        ...this.auth.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete completed todos');
    }

    return response.json();
  }
}
