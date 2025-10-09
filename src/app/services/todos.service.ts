import { Injectable, inject } from '@angular/core';
import { Todo } from '../models/todo.model';
import { AuthService } from './auth.service';
import { ValidationService } from './validation.service';
import { TodoSchema, CreateTodoSchema, UpdateTodoSchema } from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  private apiUrl = '/api/todos';
  private auth = inject(AuthService);
  private validationService = new ValidationService();

  async getTodosByUserId(userId: string): Promise<Todo[]> {
    const response = await fetch(`${this.apiUrl}?user_id=${userId}`, {
      headers: {
        ...this.auth.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch todos: ${response.statusText}`);
    }

    const data = await response.json();
    // Validate API response
    return data.map((todo: unknown) =>
      this.validationService.parseApiResponse(TodoSchema, todo)
    );
  }

  async createTodo(
    userId: string,
    text: string,
    dueAt?: string | null,
    priority?: number
  ): Promise<{ id: string }> {
    // Validate input data
    const validationResult = this.validationService.validateFormData(
      CreateTodoSchema,
      { user_id: userId, text, due_at: dueAt, priority }
    );

    if (!validationResult.success) {
      throw new Error(validationResult.errors?.join(', ') || 'Invalid input');
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.auth.getAuthHeaders(),
      },
      body: JSON.stringify(validationResult.data),
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
    // Validate input data
    const validationResult = this.validationService.validateFormData(
      UpdateTodoSchema,
      { id, ...updates }
    );

    if (!validationResult.success) {
      throw new Error(validationResult.errors?.join(', ') || 'Invalid input');
    }

    const response = await fetch(this.apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.auth.getAuthHeaders(),
      },
      body: JSON.stringify(validationResult.data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update todo');
    }

    const data = await response.json();
    // Validate API response
    return this.validationService.parseApiResponse(TodoSchema, data);
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
