import { Injectable } from '@angular/core';
import { fetchWeatherApi } from 'openmeteo';

export interface WeatherIconInfo {
  icon: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private url = 'https://api.open-meteo.com/v1/forecast';

  async getWeather(latitude: number, longitude: number) {
    const params = {
      latitude,
      longitude,
      hourly: ['temperature_2m', 'weather_code'],
      models: 'metno_nordic',
      current: ['temperature_2m', 'is_day', 'weather_code'],
      timezone: 'Europe/Berlin',
      forecast_days: 1,
    };

    const responses = await fetchWeatherApi(this.url, params);
    const response = responses[0];

    const utcOffsetSeconds = response.utcOffsetSeconds();
    const current = response.current()!;
    const hourly = response.hourly()!;

    return {
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        temperature_2m: current.variables(0)!.value(),
        is_day: current.variables(1)!.value(),
        weather_code: current.variables(2)!.value(),
      },
      hourly: {
        time: [
          ...Array(
            (Number(hourly.timeEnd()) - Number(hourly.time())) /
              hourly.interval()
          ),
        ].map(
          (_, i) =>
            new Date(
              (Number(hourly.time()) +
                i * hourly.interval() +
                utcOffsetSeconds) *
                1000
            )
        ),
        temperature_2m: hourly.variables(0)!.valuesArray(),
        weather_code: hourly.variables(1)!.valuesArray(),
      },
    };
  }

  /**
   * Interprets weather codes into appropriate icons and descriptions
   * @param weatherCode - WMO weather code
   * @param isDay - Whether it's day time (for day/night icon variants)
   * @returns WeatherIconInfo with icon path and description
   */
  getWeatherIcon(weatherCode: number, isDay: boolean = true): WeatherIconInfo {
    const timeOfDay = isDay ? 'day' : 'night';

    switch (weatherCode) {
      case 0:
        return {
          icon: `assets/weather-icons/clearsky_${timeOfDay}.svg`,
          description: 'Clear sky',
        };

      case 1:
        return {
          icon: `assets/weather-icons/fair_${timeOfDay}.svg`,
          description: 'Mainly clear',
        };

      case 2:
      case 3:
        return {
          icon: `assets/weather-icons/partlycloudy_${timeOfDay}.svg`,
          description: weatherCode === 2 ? 'Partly cloudy' : 'Overcast',
        };

      case 45:
      case 48:
        return {
          icon: 'assets/weather-icons/fog.svg',
          description: weatherCode === 45 ? 'Fog' : 'Depositing rime fog',
        };

      case 51:
      case 53:
      case 55:
        return {
          icon: 'assets/weather-icons/lightrain.svg',
          description: `Drizzle: ${
            weatherCode === 51
              ? 'Light'
              : weatherCode === 53
              ? 'Moderate'
              : 'Dense'
          } intensity`,
        };

      case 56:
      case 57:
        return {
          icon: 'assets/weather-icons/lightsleet.svg',
          description: `Freezing Drizzle: ${
            weatherCode === 56 ? 'Light' : 'Dense'
          } intensity`,
        };

      case 61:
      case 63:
      case 65:
        return {
          icon:
            weatherCode === 61
              ? 'assets/weather-icons/lightrain.svg'
              : weatherCode === 63
              ? 'assets/weather-icons/rain.svg'
              : 'assets/weather-icons/heavyrain.svg',
          description: `Rain: ${
            weatherCode === 61
              ? 'Slight'
              : weatherCode === 63
              ? 'Moderate'
              : 'Heavy'
          } intensity`,
        };

      case 66:
      case 67:
        return {
          icon: 'assets/weather-icons/sleet.svg',
          description: `Freezing Rain: ${
            weatherCode === 66 ? 'Light' : 'Heavy'
          } intensity`,
        };

      case 71:
      case 73:
      case 75:
        return {
          icon:
            weatherCode === 71
              ? 'assets/weather-icons/lightsnow.svg'
              : weatherCode === 73
              ? 'assets/weather-icons/snow.svg'
              : 'assets/weather-icons/heavysnow.svg',
          description: `Snow fall: ${
            weatherCode === 71
              ? 'Slight'
              : weatherCode === 73
              ? 'Moderate'
              : 'Heavy'
          } intensity`,
        };

      case 77:
        return {
          icon: 'assets/weather-icons/snow.svg',
          description: 'Snow grains',
        };

      case 80:
      case 81:
      case 82:
        return {
          icon: `assets/weather-icons/${
            weatherCode === 80
              ? 'light'
              : weatherCode === 81
              ? 'rain'
              : 'heavyrain'
          }showers_${timeOfDay}.svg`,
          description: `Rain showers: ${
            weatherCode === 80
              ? 'Slight'
              : weatherCode === 81
              ? 'Moderate'
              : 'Violent'
          }`,
        };

      case 85:
      case 86:
        return {
          icon: `assets/weather-icons/${
            weatherCode === 85 ? 'light' : 'heavy'
          }snowshowers_${timeOfDay}.svg`,
          description: `Snow showers: ${
            weatherCode === 85 ? 'Slight' : 'Heavy'
          }`,
        };

      case 95:
        return {
          icon: 'assets/weather-icons/rainandthunder.svg',
          description: 'Thunderstorm: Slight or moderate',
        };

      case 96:
      case 99:
        return {
          icon: 'assets/weather-icons/heavyrainandthunder.svg',
          description: `Thunderstorm with ${
            weatherCode === 96 ? 'slight' : 'heavy'
          } hail`,
        };

      default:
        return {
          icon: 'assets/weather-icons/cloudy.svg',
          description: 'Unknown weather condition',
        };
    }
  }
}
