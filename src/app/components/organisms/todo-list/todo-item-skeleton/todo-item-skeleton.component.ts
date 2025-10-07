import { Component } from '@angular/core';
import { SkeletonLoaderComponent } from '../../../atoms/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-todo-item-skeleton',
  standalone: true,
  imports: [SkeletonLoaderComponent],
  templateUrl: './todo-item-skeleton.component.html',
  styleUrl: './todo-item-skeleton.component.scss',
})
export class TodoItemSkeletonComponent {}
