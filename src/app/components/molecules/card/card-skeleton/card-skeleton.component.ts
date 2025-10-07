import { Component } from '@angular/core';
import { SkeletonLoaderComponent } from '../../../atoms/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-card-skeleton',
  standalone: true,
  imports: [SkeletonLoaderComponent],
  templateUrl: './card-skeleton.component.html',
  styleUrl: './card-skeleton.component.scss',
})
export class CardSkeletonComponent {}
