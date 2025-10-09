import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private nominatimUrl = '/api/geocode';

  constructor(private http: HttpClient) {}

  searchLocation(query: string): Observable<any[]> {
    const url = `${this.nominatimUrl}?query=${encodeURIComponent(
      query
    )}&limit=5`;
    return this.http.get<any[]>(url).pipe(
      map((results: any[]) =>
        results.map((r) => ({
          displayName: r.display_name,
          lat: +r.lat,
          lon: +r.lon,
        }))
      )
    );
  }
}
