import { Component, OnInit } from '@angular/core';
import {
  WeatherService,
  WeatherIconInfo,
} from '../../../services/weather.service';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-weather-widget',
  standalone: true,
  templateUrl: './weather-widget.component.html',
  styleUrl: './weather-widget.component.scss',
  imports: [DatePipe, DecimalPipe],
})
export class WeatherWidgetComponent implements OnInit {
  weatherData: any = null;
  loading = true;
  currentWeatherIcon: WeatherIconInfo | null = null;

  constructor(private weatherService: WeatherService) {}

  async ngOnInit() {
    this.weatherData = await this.weatherService.getWeather(59.5535, 11.3258);
    this.currentWeatherIcon = this.weatherService.getWeatherIcon(
      this.weatherData.current.weather_code,
      this.weatherData.current.is_day
    );
    this.loading = false;
  }
}
