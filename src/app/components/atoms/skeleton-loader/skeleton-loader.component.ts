import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss',
})
export class SkeletonLoaderComponent {
  @Input() width: string = '100%';
  @Input() height: string = '20px';
  @Input() borderRadius: string = 'var(--border-radius-small)';
}
