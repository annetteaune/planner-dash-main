import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '../../atoms/page-title/page-title.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { Modal } from '../../molecules/modal/modal';
import { TodosService } from '../../../services/todos.service';
import { AuthService } from '../../../services/auth.service';
import { Todo } from '../../../models/todo.model';
import { TodoItemSkeletonComponent } from '../todo-list/todo-item-skeleton/todo-item-skeleton.component';

@Component({
  selector: 'app-completed-todos-history',
  standalone: true,
  templateUrl: './completed-todos-history.component.html',
  styleUrl: './completed-todos-history.component.scss',
  imports: [
    CommonModule,
    PageTitleComponent,
    ButtonComponent,
    Modal,
    TodoItemSkeletonComponent,
  ],
})
export class CompletedTodosHistoryComponent implements OnInit {
  private todosService = inject(TodosService);
  private authService = inject(AuthService);

  completedTodos: Todo[] = [];
  loading = true;
  error = '';
  isConfirmModalOpen = false;
  isDeleting = false;
  deleteSuccess = false;

  async ngOnInit() {
    await this.loadCompletedTodos();
  }

  async loadCompletedTodos() {
    const userId = this.authService.getCurrentUserId();

    if (!userId) {
      this.error = 'Please log in to view completed todos';
      this.loading = false;
      return;
    }

    try {
      const allTodos = await this.todosService.getTodosByUserId(userId);

      this.completedTodos = allTodos
        .filter((todo) => todo.completed)
        .sort((a, b) => {
          // sort by updated_at
          const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
          return dateB - dateA;
        });
    } catch (err) {
      this.error =
        err instanceof Error ? err.message : 'Failed to load completed todos';
      console.error('Error fetching completed todos:', err);
    } finally {
      this.loading = false;
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  openConfirmModal() {
    this.isConfirmModalOpen = true;
  }

  closeConfirmModal() {
    this.isConfirmModalOpen = false;
    this.isDeleting = false;
    this.deleteSuccess = false;
  }

  async confirmClearHistory() {
    if (this.isDeleting) return;

    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      alert('Please log in to clear history');
      return;
    }

    this.isDeleting = true;

    try {
      const result = await this.todosService.deleteCompletedTodos(userId);
      console.log(`Deleted ${result.count} completed todos`);

      this.deleteSuccess = true;
      await new Promise((resolve) => setTimeout(resolve, 1500));

      this.closeConfirmModal();
      await this.loadCompletedTodos();
    } catch (err) {
      console.error('Error clearing history:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to clear history';
      alert(`Failed to clear history: ${errorMessage}`);
      this.isDeleting = false;
    }
  }
}
