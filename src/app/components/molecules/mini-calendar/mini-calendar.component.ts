import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DateNavigationService,
  MonthDay,
} from '../../../services/date-navigation.service';
import { CalendarNavigationService } from '../../../services/calendar-navigation.service';
import { ButtonComponent } from '../../atoms/button/button.component';
import { provideIcons } from '@ng-icons/core';
import {
  matArrowBackIosOutline,
  matArrowForwardIosOutline,
} from '@ng-icons/material-icons/outline';

@Component({
  selector: 'app-mini-calendar',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './mini-calendar.component.html',
  styleUrl: './mini-calendar.component.scss',
  viewProviders: [
    provideIcons({ matArrowBackIosOutline, matArrowForwardIosOutline }),
  ],
})
export class MiniCalendarComponent {
  private dateNavService = inject(DateNavigationService);
  private calendarNavService = inject(CalendarNavigationService);

  monthDays = this.dateNavService.monthDays;
  currentMonth = this.dateNavService.currentMonth;

  weekDayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  @Output() dateSelected = new EventEmitter<Date>();

  constructor() {
    // init focus upon load
    this.initializeFocusedDate();
  }

  // check if we're in week view mode
  get isWeekViewMode(): boolean {
    return this.dateNavService.getSelectedDate() === null;
  }

  private initializeFocusedDate() {
    const days = this.monthDays();
    this.calendarNavService.initializeFocusedDate(days);
  }

  // get tabindex for a specific day
  getTabIndex(dayIndex: number): number {
    return this.calendarNavService.getTabIndex(dayIndex);
  }

  onDateClick(day: MonthDay) {
    this.calendarNavService.handleDateClick(
      day,
      this.monthDays(),
      (selectedDay) => {
        this.dateNavService.selectDate(selectedDay.date);
        this.dateSelected.emit(selectedDay.date);
      },
      () => {
        this.dateNavService.clearDateSelection();
        this.dateSelected.emit(day.date);
      }
    );
  }

  onKeyDown(event: KeyboardEvent, day: MonthDay) {
    this.calendarNavService.handleKeyDown(
      event,
      day,
      this.monthDays(),
      () => this.onPreviousMonth(),
      () => this.onNextMonth(),
      (selectedDay) => this.onDateClick(selectedDay)
    );
  }

  onPreviousMonth() {
    const currentDate =
      this.monthDays()[this.calendarNavService.getFocusedIndex()];
    const currentDayOfMonth = currentDate.dayNumber;

    this.dateNavService.goToPreviousMonth();

    this.calendarNavService.handleMonthNavigation(
      'prev',
      currentDayOfMonth,
      this.monthDays(),
      () => {},
      { preserveTriggerFocus: this.shouldPreserveTriggerFocus() }
    );
  }

  onNextMonth() {
    const currentDate =
      this.monthDays()[this.calendarNavService.getFocusedIndex()];
    const currentDayOfMonth = currentDate.dayNumber;

    this.dateNavService.goToNextMonth();

    this.calendarNavService.handleMonthNavigation(
      'next',
      currentDayOfMonth,
      this.monthDays(),
      () => {},
      { preserveTriggerFocus: this.shouldPreserveTriggerFocus() }
    );
  }

  get weeks(): MonthDay[][] {
    const days = this.monthDays();
    const weeks: MonthDay[][] = [];

    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }

  private shouldPreserveTriggerFocus(): boolean {
    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement) return false;
    // if focus is currently on a calendar day, allow grid to take focus
    if (
      activeElement.classList.contains('calendar-day') ||
      !!activeElement.closest('.calendar-day')
    ) {
      return false;
    }
    // if focus is within the month header (prev/next buttons), preserve it
    return !!activeElement.closest('.month-header');
  }
}
