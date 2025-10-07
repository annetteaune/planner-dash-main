import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageTitleComponent } from '../../atoms/page-title/page-title.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';
import { TodoItemSkeletonComponent } from './todo-item-skeleton/todo-item-skeleton.component';
import { Modal } from '../../molecules/modal/modal';
import { AddTodo } from '../add-todo/add-todo';
import { TodosService } from '../../../services/todos.service';
import { AuthService } from '../../../services/auth.service';
import { Todo } from '../../../models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss',
  imports: [
    PageTitleComponent,
    ButtonComponent,
    CheckboxComponent,
    TodoItemSkeletonComponent,
    Modal,
    AddTodo,
    CommonModule,
    FormsModule,
  ],
})
export class TodoListComponent implements OnInit {
  private todosService = inject(TodosService);
  private authService = inject(AuthService);

  todos: Todo[] = [];
  loading = true;
  error = '';
  isModalOpen = false;

  async ngOnInit() {
    await this.loadTodos();
  }

  async loadTodos() {
    const userId = this.authService.getCurrentUserId();

    if (!userId) {
      this.error = 'Please log in to view todos';
      this.loading = false;
      return;
    }

    try {
      const allTodos = await this.todosService.getTodosByUserId(userId);
      // filter out completed
      this.todos = allTodos.filter((todo) => !todo.completed);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load todos';
      console.error('Error fetching todos:', err);
    } finally {
      this.loading = false;
    }
  }

  async toggleTodo(todo: Todo) {
    const previousState = todo.completed;
    todo.completed = !todo.completed;

    try {
      await this.todosService.updateTodo(todo.id, {
        completed: todo.completed,
      });

      //  remove completed
      if (todo.completed) {
        this.todos = this.todos.filter((t) => t.id !== todo.id);
      }
    } catch (err) {
      // revert on error
      todo.completed = previousState;
      console.error('Error updating todo:', err);
      alert('Failed to update todo. Please try again.');
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  async onTodoAdded() {
    this.closeModal();
    await this.loadTodos();
  }
}
