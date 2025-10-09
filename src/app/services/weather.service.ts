import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private baseUrl = '/api/weather';

  constructor(private http: HttpClient) {}

  getWeather(lat: number, lon: number, altitude?: number): Observable<any> {
    let params = new HttpParams().set('lat', lat).set('lon', lon);

    if (altitude) {
      params = params.set('altitude', altitude);
    }

    return this.http.get<any>(this.baseUrl, { params }).pipe(
      map((data) => {
        const details = data.properties.timeseries[0].data.instant.details;
        const nextSymbol =
          data.properties.timeseries[0].data.next_1_hours?.summary.symbol_code;

        return {
          temperature: Math.round(details.air_temperature),
          symbol: nextSymbol,
        };
      })
    );
  }
}
