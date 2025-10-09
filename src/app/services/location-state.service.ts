import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ReverseGeocodeService } from './reverse-geocode.service';

export interface LocationData {
  lat: number;
  lon: number;
  shortName: string;
  displayName?: string;
  isLiveLocation: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LocationStateService {
  private locationSubject = new BehaviorSubject<string>('Getting location...');
  private locationDataSubject = new BehaviorSubject<LocationData | null>(null);

  constructor(private reverseGeocodeService: ReverseGeocodeService) {
    // Initialize with saved location if available, otherwise get live location
    this.initializeLocation();
  }

  getCurrentLocation(): Observable<string> {
    return this.locationSubject.asObservable();
  }

  getCurrentLocationData(): Observable<LocationData | null> {
    return this.locationDataSubject.asObservable();
  }

  updateLocation(location: any): void {
    const shortName =
      location?.shortName ||
      (location?.displayName
        ? String(location.displayName).split(',')[0].trim()
        : '');

    const locationData: LocationData = {
      lat: location.lat,
      lon: location.lon,
      shortName,
      displayName: location.displayName,
      isLiveLocation: false,
    };

    this.locationDataSubject.next(locationData);
    this.locationSubject.next(shortName);
  }

  async revertToLiveLocation(): Promise<void> {
    try {
      const position = await this.getCurrentPosition();
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Get the actual location name via reverse geocoding
      this.reverseGeocodeService.getLocationName(lat, lon).subscribe({
        next: (locationName) => {
          const locationData: LocationData = {
            lat,
            lon,
            shortName: locationName,
            isLiveLocation: true,
          };

          this.locationDataSubject.next(locationData);
          this.locationSubject.next(locationName);
        },
        error: (error) => {
          console.error('Error getting location name:', error);
          // Fallback to generic name if reverse geocoding fails
          const locationData: LocationData = {
            lat,
            lon,
            shortName: 'Current Location',
            isLiveLocation: true,
          };

          this.locationDataSubject.next(locationData);
          this.locationSubject.next('Current Location');
        },
      });

      // Clear saved location
      localStorage.removeItem('preferredLocation');
    } catch (error) {
      console.error('Error getting live location:', error);
      this.locationSubject.next('Location unavailable');
    }
  }

  private async initializeLocation(): Promise<void> {
    try {
      const saved = localStorage.getItem('preferredLocation');
      if (saved) {
        const loc = JSON.parse(saved);
        const shortName =
          loc?.shortName ||
          (loc?.displayName
            ? String(loc.displayName).split(',')[0].trim()
            : '');

        const locationData: LocationData = {
          lat: loc.lat,
          lon: loc.lon,
          shortName,
          displayName: loc.displayName,
          isLiveLocation: false,
        };

        this.locationDataSubject.next(locationData);
        this.locationSubject.next(shortName);
      } else {
        // No saved location, get live location
        await this.revertToLiveLocation();
      }
    } catch {
      // Fallback to live location
      await this.revertToLiveLocation();
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      });
    });
  }
}
