import { Component } from '@angular/core';
import { SkeletonLoaderComponent } from '../../../atoms/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-weather-widget-skeleton',
  standalone: true,
  imports: [SkeletonLoaderComponent],
  templateUrl: './weather-widget-skeleton.component.html',
  styleUrl: './weather-widget-skeleton.component.scss',
})
export class WeatherWidgetSkeletonComponent {}
