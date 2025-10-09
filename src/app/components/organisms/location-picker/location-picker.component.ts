import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../atoms/input/input.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';
import { LocationService } from '../../../services/location.service';
import { LocationStateService } from '../../../services/location-state.service';
import { TodoItemSkeletonComponent } from '../todo-list/todo-item-skeleton/todo-item-skeleton.component';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    InputComponent,
    ButtonComponent,
    CheckboxComponent,
    TodoItemSkeletonComponent,
  ],
})
export class LocationPickerComponent {
  query = '';
  results: any[] = [];
  selectedLocation: any = null;
  isLoading = false;
  showMinLengthMessage = false;
  showNoResultsMessage = false;

  constructor(
    private locationService: LocationService,
    private locationStateService: LocationStateService
  ) {}

  onSearch() {
    // clear previous messages
    this.showMinLengthMessage = false;
    this.showNoResultsMessage = false;

    if (this.query.trim().length < 2) {
      this.showMinLengthMessage = true;
      this.results = [];
      return;
    }

    this.isLoading = true;
    this.results = []; // clear previous results

    this.locationService.searchLocation(this.query).subscribe({
      next: (data) => {
        this.results = data;
        this.isLoading = false;

        // show no results message if no data returned
        if (data.length === 0) {
          this.showNoResultsMessage = true;
        }
      },
      error: (error) => {
        console.error('Error searching location:', error);
        this.isLoading = false;
        this.showNoResultsMessage = true;
      },
    });
  }

  selectLocation(loc: any) {
    const shortName = (loc.displayName || '').split(',')[0].trim();
    this.selectedLocation = { ...loc, shortName };
    localStorage.setItem(
      'preferredLocation',
      JSON.stringify(this.selectedLocation)
    ); // saves locally

    // notify location state service
    this.locationStateService.updateLocation(this.selectedLocation);

    this.results = [];
    this.query = shortName;
    // clear any messages while selecting location
    this.showMinLengthMessage = false;
    this.showNoResultsMessage = false;
  }
}
