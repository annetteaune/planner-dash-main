import { Component, OnInit, OnDestroy } from '@angular/core';
import { WeatherService } from '../../../services/weather.service';
import { WeatherWidgetSkeletonComponent } from './weather-widget-skeleton/weather-widget-skeleton.component';
import {
  LocationStateService,
  LocationData,
} from '../../../services/location-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-weather-widget',
  templateUrl: './weather-widget.component.html',
  styleUrl: './weather-widget.component.scss',
  standalone: true,
  imports: [WeatherWidgetSkeletonComponent],
})
export class WeatherWidgetComponent implements OnInit, OnDestroy {
  temperature?: number;
  symbol?: string;
  locationName = 'Getting location...';
  private locationSubscription?: Subscription;

  constructor(
    private weatherService: WeatherService,
    private locationStateService: LocationStateService
  ) {}

  ngOnInit() {
    // Subscribe to location changes
    this.locationSubscription = this.locationStateService
      .getCurrentLocationData()
      .subscribe((locationData: LocationData | null) => {
        if (locationData) {
          this.locationName = locationData.shortName;
          this.getWeather(locationData.lat, locationData.lon);
        }
      });

    // Also subscribe to location name changes for display
    this.locationStateService
      .getCurrentLocation()
      .subscribe((locationName: string) => {
        this.locationName = locationName;
      });
  }

  getWeather(lat: number, lon: number) {
    this.weatherService.getWeather(lat, lon).subscribe((data) => {
      this.temperature = data.temperature;
      this.symbol = data.symbol;
    });
  }

  ngOnDestroy() {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
  }
}
