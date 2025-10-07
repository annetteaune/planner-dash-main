import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TodosService } from '../../../services/todos.service';
import { AuthService } from '../../../services/auth.service';
import { ButtonComponent } from '../../atoms/button/button.component';
import { InputComponent } from '../../atoms/input/input.component';
import { Validator } from '@angular/forms';

@Component({
  selector: 'app-add-todo',
  standalone: true,
  imports: [FormsModule, CommonModule, ButtonComponent, InputComponent],
  templateUrl: './add-todo.html',
  styleUrl: './add-todo.scss',
})
export class AddTodo {
  private todosService = inject(TodosService);
  private authService = inject(AuthService);

  @Output() todoAdded = new EventEmitter<void>();

  todoText = '';
  loading = false;
  error = '';

  async onSubmit() {
    const maxLength = 150;

    if (!this.todoText.trim()) {
      this.error = 'Please enter a todo';
      return;
    }
    if (this.todoText.length > maxLength) {
      this.error = `Todo must be ${maxLength} characters or less`;
      return;
    }

    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.error = 'Please log in to add todos';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.todosService.createTodo(userId, this.todoText.trim());
      this.todoText = '';
      this.todoAdded.emit();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to add todo';
      console.error('Error adding todo:', err);
    } finally {
      this.loading = false;
    }
  }
}
