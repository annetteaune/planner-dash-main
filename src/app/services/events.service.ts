import { Injectable, inject } from '@angular/core';
import { Event } from '../models/event.model';
import { AuthService } from './auth.service';
import { ValidationService } from './validation.service';
import { EventSchema, CreateEventSchema, UpdateEventSchema } from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private apiUrl = '/api/events';
  private auth = inject(AuthService);
  private validationService = new ValidationService();

  async getEventsByUserId(userId: string): Promise<Event[]> {
    const response = await fetch(`${this.apiUrl}?user_id=${userId}`, {
      headers: {
        ...this.auth.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const data = await response.json();
    // Validate API response
    return data.map((event: unknown) =>
      this.validationService.parseApiResponse(EventSchema, event)
    );
  }

  async getEventsByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Event[]> {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    const response = await fetch(
      `${this.apiUrl}?user_id=${userId}&start_date=${startISO}&end_date=${endISO}`,
      {
        headers: {
          ...this.auth.getAuthHeaders(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const data = await response.json();
    // Validate API response
    return data.map((event: unknown) =>
      this.validationService.parseApiResponse(EventSchema, event)
    );
  }

  filterEventsByDate(events: Event[], targetDate: Date): Event[] {
    const targetDay = new Date(targetDate);
    targetDay.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDay);
    nextDay.setDate(nextDay.getDate() + 1);

    return events.filter((event) => {
      const eventStart = new Date(event.start_at);
      const eventEnd = new Date(event.end_at);

      // Event overlaps with target date if:
      // - Starts before end of day AND ends after start of day
      return eventStart < nextDay && eventEnd >= targetDay;
    });
  }

  async getEventById(id: string): Promise<Event> {
    const response = await fetch(`${this.apiUrl}?id=${id}`, {
      headers: {
        ...this.auth.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event: ${response.statusText}`);
    }

    const data = await response.json();
    // Validate API response
    return this.validationService.parseApiResponse(EventSchema, data);
  }

  async createEvent(
    userId: string,
    title: string,
    content: string,
    address: string,
    startAt: string,
    endAt: string,
    allDay: boolean = false
  ): Promise<Event> {
    // Validate input data
    const validationResult = this.validationService.validateFormData(
      CreateEventSchema,
      {
        user_id: userId,
        title,
        content,
        address,
        start_at: startAt,
        end_at: endAt,
        all_day: allDay,
      }
    );

    if (!validationResult.success) {
      throw new Error(validationResult.errors?.join(', ') || 'Invalid input');
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.auth.getAuthHeaders(),
      },
      body: JSON.stringify(validationResult.data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create event');
    }

    const data = await response.json();
    // Validate API response
    return this.validationService.parseApiResponse(EventSchema, data);
  }

  async updateEvent(
    eventId: string,
    title: string,
    content: string,
    address: string,
    startAt: string,
    endAt: string,
    allDay: boolean
  ): Promise<Event> {
    // Validate input data
    const validationResult = this.validationService.validateFormData(
      UpdateEventSchema,
      {
        id: eventId,
        title,
        content,
        address,
        start_at: startAt,
        end_at: endAt,
        all_day: allDay,
      }
    );

    if (!validationResult.success) {
      throw new Error(validationResult.errors?.join(', ') || 'Invalid input');
    }

    const response = await fetch(this.apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.auth.getAuthHeaders(),
      },
      body: JSON.stringify(validationResult.data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update event');
    }

    const data = await response.json();
    // Validate API response
    return this.validationService.parseApiResponse(EventSchema, data);
  }

  async deleteEvent(eventId: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}?id=${eventId}`, {
      method: 'DELETE',
      headers: {
        ...this.auth.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete event');
    }
  }

  /**
   * Formats event time for display
   * @param event - Event object with start_at and end_at
   * @returns Formatted time string
   */
  formatEventTime(event: Event): string {
    if (event.all_day) {
      return 'All day';
    }

    if (!event.start_at || !event.end_at) {
      return 'Time not set';
    }

    const startDate = new Date(event.start_at);
    const endDate = new Date(event.end_at);

    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Invalid time';
    }

    const startTime = startDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const endTime = endDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return `${startTime} - ${endTime}`;
  }
}
