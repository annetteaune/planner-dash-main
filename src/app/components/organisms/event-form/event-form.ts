import {
  Component,
  EventEmitter,
  Output,
  Input,
  inject,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventsService } from '../../../services/events.service';
import { AuthService } from '../../../services/auth.service';
import { ButtonComponent } from '../../atoms/button/button.component';
import { InputComponent } from '../../atoms/input/input.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';
import { Event } from '../../../models/event.model';

import {
  provideNativeDateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MAT_TIMEPICKER_CONFIG } from '@angular/material/timepicker';
import { DatePickerComponent } from '../../atoms/date-picker/date-picker.component';
import { TimePickerComponent } from '../../atoms/time-picker/time-picker.component';

export const DD_MM_YYYY_FORMAT = {
  parse: {
    dateInput: { day: 'numeric', month: 'numeric', year: 'numeric' },
    timeInput: { hour: 'numeric', minute: 'numeric', hour12: false },
  },
  display: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
    monthYearLabel: { month: 'short', year: 'numeric' },
    dateA11yLabel: { day: 'numeric', month: 'long', year: 'numeric' },
    monthYearA11yLabel: { month: 'long', year: 'numeric' },
    timeInput: { hour: '2-digit', minute: '2-digit', hour12: false },
    timeOptionLabel: { hour: '2-digit', minute: '2-digit', hour12: false },
  },
};

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonComponent,
    InputComponent,
    CheckboxComponent,
    DatePickerComponent,
    TimePickerComponent,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_FORMAT },
    {
      provide: MAT_TIMEPICKER_CONFIG,
      useValue: { interval: '15 minutes', format: 24 },
    },
  ],
  templateUrl: './event-form.html',
  styleUrl: './event-form.scss',
})
export class EventForm implements OnChanges {
  private eventsService = inject(EventsService);
  private authService = inject(AuthService);

  @Input() editEvent: Event | null = null;
  @Input() defaultDate: Date | null = null;
  @Output() eventAdded = new EventEmitter<void>();

  title = '';
  content = '';
  address = '';
  startDateTime: Date | null = null;
  endDateTime: Date | null = null;
  allDay = false;
  loading = false;
  error = '';
  isEditMode = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['editEvent'] && this.editEvent) {
      this.isEditMode = true;
      this.populateForm(this.editEvent);
    } else if (changes['editEvent'] && !this.editEvent) {
      this.isEditMode = false;
      this.resetForm();
    }

    //  default date
    if (changes['defaultDate'] && this.defaultDate && !this.editEvent) {
      this.setDefaultDate(this.defaultDate);
    }
  }

  private populateForm(event: Event) {
    this.title = event.title;
    this.content = event.content || '';
    this.address = event.address || '';
    this.allDay = event.all_day;

    if (event.start_at) {
      this.startDateTime = new Date(event.start_at);
    }

    if (event.end_at) {
      this.endDateTime = new Date(event.end_at);
    }
  }

  private setDefaultDate(date: Date) {
    // set default start date time
    const startDate = new Date(date);
    startDate.setHours(9, 0, 0, 0);
    this.startDateTime = startDate;

    // set default end date time
    const endDate = new Date(date);
    endDate.setHours(10, 0, 0, 0);
    this.endDateTime = endDate;
  }

  private resetForm() {
    this.title = '';
    this.content = '';
    this.address = '';
    this.startDateTime = null;
    this.endDateTime = null;
    this.allDay = false;
    this.error = '';
  }

  onAllDayChange() {
    if (this.allDay && this.startDateTime) {
      // set end time
      const endDate = new Date(this.startDateTime);
      endDate.setHours(23, 59, 0, 0);
      this.endDateTime = endDate;
    }
  }

  onStartDateTimeChange() {
    if (this.allDay && this.startDateTime) {
      this.onAllDayChange();
    } else if (this.startDateTime && !this.endDateTime) {
      const endDate = new Date(this.startDateTime);
      endDate.setHours(this.startDateTime.getHours() + 1);
      this.endDateTime = endDate;
    }
  }

  async onSubmit() {
    if (!this.title.trim()) {
      this.error = 'Title is required';
      return;
    }

    if (!this.startDateTime) {
      this.error = 'Start date and time are required';
      return;
    }

    if (!this.allDay && !this.endDateTime) {
      this.error = 'End date and time are required';
      return;
    }

    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.error = 'Please log in to add events';
      return;
    }
    let endDateTime: Date;

    if (this.allDay) {
      endDateTime = new Date(this.startDateTime);
      endDateTime.setHours(23, 59, 0, 0);
    } else {
      if (!this.endDateTime) {
        this.error = 'End date and time are required';
        return;
      }
      endDateTime = this.endDateTime;

      if (endDateTime <= this.startDateTime) {
        this.error = 'End time must be after start time';
        return;
      }
    }

    this.loading = true;
    this.error = '';

    try {
      const startISO = this.startDateTime.toISOString();
      const endISO = endDateTime.toISOString();

      if (this.isEditMode && this.editEvent) {
        await this.eventsService.updateEvent(
          this.editEvent.id,
          this.title.trim(),
          this.content.trim(),
          this.address.trim(),
          startISO,
          endISO,
          this.allDay
        );
      } else {
        await this.eventsService.createEvent(
          userId,
          this.title.trim(),
          this.content.trim(),
          this.address.trim(),
          startISO,
          endISO,
          this.allDay
        );
      }

      this.resetForm();
      this.eventAdded.emit();
    } catch (err) {
      this.error =
        err instanceof Error
          ? err.message
          : `Failed to ${this.isEditMode ? 'update' : 'add'} event`;
      console.error(
        `Error ${this.isEditMode ? 'updating' : 'adding'} event:`,
        err
      );
    } finally {
      this.loading = false;
    }
  }
}
