import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReverseGeocodeService {
  private reverseGeocodeUrl = '/api/reverse-geocode';

  constructor(private http: HttpClient) {}

  getLocationName(lat: number, lon: number): Observable<string> {
    const url = `${this.reverseGeocodeUrl}?lat=${lat}&lon=${lon}`;

    return this.http.get<any>(url).pipe(
      map((data) => {
        // Extract city name from the address components
        const address = data.address;
        if (address) {
          // Try different address components in order of preference
          return (
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county ||
            address.state ||
            address.country ||
            'Unknown Location'
          );
        }
        return 'Unknown Location';
      })
    );
  }
}
