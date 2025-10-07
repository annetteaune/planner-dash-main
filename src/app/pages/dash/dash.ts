import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardContainerComponent } from '../../components/molecules/card-container/card-container.component';
import { CardSkeletonComponent } from '../../components/molecules/card/card-skeleton/card-skeleton.component';
import { EventsService } from '../../services/events.service';
import { AuthService } from '../../services/auth.service';
import {
  DateNavigationService,
  WeekDay,
} from '../../services/date-navigation.service';
import { PageTitleComponent } from '../../components/atoms/page-title/page-title.component';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { TodoListComponent } from '../../components/organisms/todo-list/todo-list.component';
import { WeatherWidgetComponent } from '../../components/organisms/weather-widget/weather-widget.component';
import { MiniCalendarComponent } from '../../components/molecules/mini-calendar/mini-calendar.component';
import { Modal } from '../../components/molecules/modal/modal';
import { EventForm } from '../../components/organisms/event-form/event-form';
import { Event } from '../../models/event.model';
import { provideIcons } from '@ng-icons/core';
import {
  matArrowBackIosOutline,
  matArrowForwardIosOutline,
} from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-dash',
  standalone: true,
  templateUrl: './dash.html',
  styleUrl: './dash.scss',
  imports: [
    CardContainerComponent,
    CardSkeletonComponent,
    PageTitleComponent,
    ButtonComponent,
    TodoListComponent,
    WeatherWidgetComponent,
    MiniCalendarComponent,
    Modal,
    EventForm,
    CommonModule,
  ],
  viewProviders: [
    provideIcons({ matArrowBackIosOutline, matArrowForwardIosOutline }),
  ],
})
export class Dash implements OnInit {
  private eventsService = inject(EventsService);
  private authService = inject(AuthService);
  protected dateNavService = inject(DateNavigationService);

  // Date navigation computed values
  currentMonth = this.dateNavService.currentMonth;
  weekNumber = this.dateNavService.currentWeekNumber;
  weekDays = this.dateNavService.weekDays;

  allEvents: Event[] = [];
  filteredEvents: Event[] = [];
  cards: any[] = [];
  loading = true;
  error = '';
  isModalOpen = false;
  editingEvent: Event | null = null;
  eventFormDefaultDate: Date | null = null;
  isDeleteConfirmOpen = false;
  deletingEvent: Event | null = null;
  isDeleting = false;
  deleteSuccess = false;
  isNavigating = false;
  private isInitialLoad = true;

  constructor() {
    // React to date changes
    effect(() => {
      // Only track week start for reloading events
      const weekStart = this.dateNavService.getWeekStart();

      // Skip the first run since ngOnInit handles initial load
      if (this.isInitialLoad) {
        this.isInitialLoad = false;
        return;
      }

      // Trigger reload (effect runs after initialization)
      if (weekStart) {
        // Use setTimeout to move async work outside the effect's synchronous execution
        setTimeout(() => this.loadEvents(), 0);
      }
    });
  }

  ngOnInit() {
    // Initial load
    this.loadEvents();
  }

  async loadEvents() {
    const userId = this.authService.getCurrentUserId();

    if (!userId) {
      this.error = 'Please log in to view events';
      this.loading = false;
      return;
    }

    this.loading = true;

    try {
      // Get date range for current week
      const { startDate, endDate } =
        this.dateNavService.getCurrentWeekDateRange();

      // Fetch events for the week
      this.allEvents = await this.eventsService.getEventsByUserIdAndDateRange(
        userId,
        startDate,
        endDate
      );

      // Apply date filter if specific day is selected
      this.applyDateFilter();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load events';
      console.error('Error fetching events:', err);
    } finally {
      this.loading = false;
    }
  }

  applyDateFilter() {
    const selectedDateRange = this.dateNavService.getSelectedDateRange();

    if (selectedDateRange) {
      // Filter to selected day
      this.filteredEvents = this.eventsService.filterEventsByDate(
        this.allEvents,
        selectedDateRange.startDate
      );
    } else {
      // Show all events for the week
      this.filteredEvents = [...this.allEvents];
    }

    // Transform to card format
    this.cards = this.filteredEvents.map((event) => ({
      title: event.title,
      content: event.content,
      address: event.address,
      time: this.eventsService.formatEventTime(event),
      eventId: event.id,
      day: this.formatEventDay(event),
    }));
  }

  private formatEventDay(event: Event): string {
    const eventDate = new Date(event.start_at);
    const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'long' });
    const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
    const day = eventDate.getDate();
    return `${dayName}, ${month} ${day}`;
  }

  openModal() {
    this.editingEvent = null;
    // Set default date to the currently selected date or today
    const selectedDate = this.dateNavService.getSelectedDate();
    this.eventFormDefaultDate = selectedDate || new Date();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingEvent = null;
    this.eventFormDefaultDate = null;
  }

  async onEventAdded() {
    this.closeModal();
    await this.loadEvents();
  }

  onEditEvent(eventId: string) {
    const event = this.allEvents.find((e: Event) => e.id === eventId);
    if (event) {
      this.editingEvent = event;
      this.isModalOpen = true;
    }
  }

  onDeleteEvent(eventId: string) {
    const event = this.allEvents.find((e: Event) => e.id === eventId);
    if (event) {
      console.log('Deleting event:', event.id, event.title);
      this.deletingEvent = event;
      this.isDeleteConfirmOpen = true;
    } else {
      console.error('Event not found:', eventId);
    }
  }

  closeDeleteConfirm() {
    this.isDeleteConfirmOpen = false;
    this.deletingEvent = null;
    this.isDeleting = false;
    this.deleteSuccess = false;
  }

  async confirmDelete() {
    if (!this.deletingEvent || this.isDeleting) return;

    this.isDeleting = true;
    console.log('Confirming delete for event ID:', this.deletingEvent.id);

    try {
      await this.eventsService.deleteEvent(this.deletingEvent.id);
      console.log('Event deleted successfully');

      // Show success feedback
      this.deleteSuccess = true;

      // Wait a moment to show the success message
      await new Promise((resolve) => setTimeout(resolve, 2000));

      this.closeDeleteConfirm();
      await this.loadEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete event';
      alert(`Failed to delete event: ${errorMessage}`);
      this.isDeleting = false;
    }
  }

  // Date navigation methods
  onWeekdayClick(day: WeekDay) {
    if (day.isSelected) {
      // Clicking selected day again deselects it
      this.dateNavService.clearDateSelection();
    } else {
      this.dateNavService.selectDate(day.date);
    }
    this.applyDateFilter();
  }

  onWeekView() {
    this.dateNavService.clearDateSelection();
    this.applyDateFilter();
  }

  hasSelectedDay(): boolean {
    return this.dateNavService.getSelectedDate() !== null;
  }

  onPreviousWeek() {
    if (this.isNavigating) return;
    this.isNavigating = true;
    this.dateNavService.goToPreviousWeek();
    setTimeout(() => (this.isNavigating = false), 100);
  }

  onNextWeek() {
    if (this.isNavigating) return;
    this.isNavigating = true;
    this.dateNavService.goToNextWeek();
    setTimeout(() => (this.isNavigating = false), 100);
  }

  onToday() {
    if (this.isNavigating) return;
    this.isNavigating = true;
    this.dateNavService.goToToday();
    setTimeout(() => (this.isNavigating = false), 100);
  }

  onCalendarDateSelected() {
    // Date selection is already handled by the mini-calendar component
    // Just apply the filter to update the events display
    this.applyDateFilter();
  }
}
