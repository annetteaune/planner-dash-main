import { Injectable, signal, computed } from '@angular/core';

export interface WeekDay {
  date: Date;
  dayName: string; // "Monday"
  shortDate: string; // "Oct 2"
  fullLabel: string; // "Monday Oct 2"
  isSelected: boolean;
  isToday: boolean;
}

export interface MonthDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInCurrentWeek: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DateNavigationService {
  // Current week start (Monday)
  private currentWeekStart = signal<Date>(this.getMonday(new Date()));

  // Selected specific date (null = show all week)
  private selectedDate = signal<Date | null>(null);

  // Computed: Current month and year display
  currentMonth = computed(() => {
    const selected = this.selectedDate();
    const weekStart = this.currentWeekStart();

    // If a day is selected, show that day's month
    if (selected) {
      return selected.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    }

    // If today is in the current week, show today's month
    const today = this.stripTime(new Date());
    if (this.isDateInWeek(today, weekStart)) {
      return today.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    }

    // Otherwise, show the month that contains the majority of the week
    // Calculate which month has more days (4 or more = majority)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startMonth = weekStart.getMonth();
    const endMonth = weekEnd.getMonth();

    if (startMonth === endMonth) {
      // Week is entirely in one month
      return weekStart.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } else {
      // Week spans two months - count days in each month
      let daysInStartMonth = 0;
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + i);
        if (day.getMonth() === startMonth) {
          daysInStartMonth++;
        }
      }

      // Use the month with more days (or first month if equal)
      const referenceDate = daysInStartMonth >= 4 ? weekStart : weekEnd;
      return referenceDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    }
  });

  // Computed: ISO week number
  currentWeekNumber = computed(() => {
    return this.getWeekNumber(this.currentWeekStart());
  });

  // Computed: Array of 7 days for the current week
  weekDays = computed(() => {
    const startOfWeek = this.currentWeekStart();
    const selected = this.selectedDate();
    const today = this.stripTime(new Date());

    const days: WeekDay[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);

      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const shortDayName = date.toLocaleDateString('en-US', {
        weekday: 'short',
      });
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      const shortDate = `${month} ${day}`;

      const dateWithoutTime = this.stripTime(date);
      const isSelected = selected
        ? this.isSameDay(dateWithoutTime, selected)
        : false;
      const isToday = this.isSameDay(dateWithoutTime, today);

      days.push({
        date: dateWithoutTime,
        dayName,
        shortDate,
        fullLabel: `${shortDayName} ${shortDate}`,
        isSelected,
        isToday,
      });
    }

    return days;
  });

  // Computed: Array of days for month view (includes days from prev/next months to fill grid)
  monthDays = computed(() => {
    const weekStart = this.currentWeekStart();
    const selected = this.selectedDate();
    const today = this.stripTime(new Date());

    // Determine which month to show based on current week
    const currentMonth = this.getMonthToDisplay(weekStart);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1);

    // Last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayWeekday = firstDayOfMonth.getDay();

    // Calculate start date (may be in previous month)
    // Adjust so Monday is first day of week (0)
    const startDay = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
    const calendarStart = new Date(firstDayOfMonth);
    calendarStart.setDate(calendarStart.getDate() - startDay);

    // Build array of 42 days (6 weeks × 7 days) to ensure full month coverage
    const days: MonthDay[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(calendarStart);
      date.setDate(date.getDate() + i);
      const dateWithoutTime = this.stripTime(date);

      days.push({
        date: dateWithoutTime,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: this.isSameDay(dateWithoutTime, today),
        isSelected: selected
          ? this.isSameDay(dateWithoutTime, selected)
          : false,
        isInCurrentWeek: this.isDateInWeek(dateWithoutTime, weekStart),
      });
    }

    return days;
  });

  // Helper: Determine which month to display based on current week
  private getMonthToDisplay(weekStart: Date): Date {
    const selected = this.selectedDate();

    // If a day is selected, show that month
    if (selected) {
      return new Date(selected.getFullYear(), selected.getMonth(), 1);
    }

    // If today is in current week, show today's month
    const today = this.stripTime(new Date());
    if (this.isDateInWeek(today, weekStart)) {
      return new Date(today.getFullYear(), today.getMonth(), 1);
    }

    // Otherwise, use the month with majority of days in the week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startMonth = weekStart.getMonth();
    const endMonth = weekEnd.getMonth();

    if (startMonth === endMonth) {
      return new Date(weekStart.getFullYear(), startMonth, 1);
    }

    // Count days in each month
    let daysInStartMonth = 0;
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      if (day.getMonth() === startMonth) {
        daysInStartMonth++;
      }
    }

    const referenceDate = daysInStartMonth >= 4 ? weekStart : weekEnd;
    return new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  }

  // Get the start of the current week (for external access)
  getWeekStart() {
    return this.currentWeekStart();
  }

  // Get the selected date (for external access)
  getSelectedDate() {
    return this.selectedDate();
  }

  // Navigate to next week
  goToNextWeek() {
    const current = this.currentWeekStart();
    const next = new Date(current);
    next.setDate(next.getDate() + 7);
    this.currentWeekStart.set(next);
    this.selectedDate.set(null); // Clear selection when changing weeks
  }

  // Navigate to previous week
  goToPreviousWeek() {
    const current = this.currentWeekStart();
    const previous = new Date(current);
    previous.setDate(previous.getDate() - 7);
    this.currentWeekStart.set(previous);
    this.selectedDate.set(null); // Clear selection when changing weeks
  }

  // Go to current week (today)
  goToToday() {
    this.currentWeekStart.set(this.getMonday(new Date()));
    this.selectedDate.set(null);
  }

  // Navigate to next month
  goToNextMonth() {
    const currentMonth = this.getMonthToDisplay(this.currentWeekStart());
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      8 // Use 15th to ensure we're definitely in the target month
    );
    // Set current week to the week containing the 15th of next month
    this.currentWeekStart.set(this.getMonday(nextMonth));
    this.selectedDate.set(null); // Clear selection when changing months
  }

  // Navigate to previous month
  goToPreviousMonth() {
    const currentMonth = this.getMonthToDisplay(this.currentWeekStart());
    const previousMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      8 // Use 15th to ensure we're definitely in the target month
    );
    // Set current week to the week containing the 15th of previous month
    this.currentWeekStart.set(this.getMonday(previousMonth));
    this.selectedDate.set(null); // Clear selection when changing months
  }

  // Select a specific date
  selectDate(date: Date) {
    const dateWithoutTime = this.stripTime(date);
    this.selectedDate.set(dateWithoutTime);

    // Navigate to the week containing this date if it's not in the current week
    if (!this.isDateInCurrentWeek(dateWithoutTime)) {
      this.currentWeekStart.set(this.getMonday(dateWithoutTime));
    }
  }

  // Clear date selection (show all week)
  clearDateSelection() {
    this.selectedDate.set(null);
  }

  // Check if a date is in the current week
  isDateInCurrentWeek(date: Date): boolean {
    const weekStart = this.currentWeekStart();
    return this.isDateInWeek(date, weekStart);
  }

  // Helper: Check if a date is in a specific week
  private isDateInWeek(date: Date, weekStart: Date): boolean {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const checkDate = this.stripTime(date);
    return (
      checkDate >= this.stripTime(weekStart) &&
      checkDate <= this.stripTime(weekEnd)
    );
  }

  // Helper: Get Monday of the week for a given date
  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    return this.stripTime(monday);
  }

  // Helper: Strip time from date (set to midnight)
  private stripTime(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Helper: Check if two dates are the same day
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Helper: Get ISO week number
  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  // Get date range for current week (for API calls)
  getCurrentWeekDateRange(): { startDate: Date; endDate: Date } {
    const startDate = this.stripTime(this.currentWeekStart());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  }

  // Get specific date range (for selected day)
  getSelectedDateRange(): { startDate: Date; endDate: Date } | null {
    const selected = this.selectedDate();
    if (!selected) return null;

    const startDate = this.stripTime(selected);
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  }
}
