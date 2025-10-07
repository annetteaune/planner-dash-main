import { Injectable, signal } from '@angular/core';
import { MonthDay } from './date-navigation.service';

@Injectable({
  providedIn: 'root',
})
export class CalendarNavigationService {
  // Track which date should be keyboard-focusable (roving tabindex)
  private focusedDateIndex = signal<number>(0);

  constructor() {}

  // Initialize focused date to today or selected date
  initializeFocusedDate(days: MonthDay[]): void {
    const selectedIndex = days.findIndex((d) => d.isSelected);
    const todayIndex = days.findIndex((d) => d.isToday);

    if (selectedIndex >= 0) {
      this.focusedDateIndex.set(selectedIndex);
    } else if (todayIndex >= 0) {
      this.focusedDateIndex.set(todayIndex);
    } else {
      this.focusedDateIndex.set(0);
    }
  }

  // Update focused date to match selected date
  updateFocusedDateToSelected(days: MonthDay[]): void {
    const selectedIndex = days.findIndex((d) => d.isSelected);
    const todayIndex = days.findIndex((d) => d.isToday);

    if (selectedIndex >= 0) {
      this.focusedDateIndex.set(selectedIndex);
      this.focusDateButton(selectedIndex);
    } else if (todayIndex >= 0) {
      this.focusedDateIndex.set(todayIndex);
      this.focusDateButton(todayIndex);
    } else {
      this.focusedDateIndex.set(0);
      this.focusDateButton(0);
    }
  }

  // Get tabindex for a specific day (roving tabindex pattern)
  getTabIndex(dayIndex: number): number {
    return dayIndex === this.focusedDateIndex() ? 0 : -1;
  }

  // Get current focused index
  getFocusedIndex(): number {
    return this.focusedDateIndex();
  }

  // Set focused index
  setFocusedIndex(index: number): void {
    this.focusedDateIndex.set(index);
  }

  // Get flat index from week and day positions
  getDayIndex(day: MonthDay, days: MonthDay[]): number {
    return days.findIndex((d) => d.date.getTime() === day.date.getTime());
  }

  // Handle keyboard navigation
  handleKeyDown(
    event: KeyboardEvent,
    day: MonthDay,
    days: MonthDay[],
    onPreviousMonth: () => void,
    onNextMonth: () => void,
    onDateClick: (day: MonthDay) => void
  ): void {
    const currentIndex = this.getDayIndex(day, days);
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = currentIndex - 1;
        if (newIndex < 0) {
          onPreviousMonth();
          setTimeout(() => {
            const newDays = days; // This will be updated by the parent
            this.focusedDateIndex.set(newDays.length - 1);
            this.focusDateButton(newDays.length - 1);
          });
          return;
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        newIndex = currentIndex + 1;
        if (newIndex >= days.length) {
          onNextMonth();
          setTimeout(() => {
            this.focusedDateIndex.set(0);
            this.focusDateButton(0);
          });
          return;
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex - 7;
        if (newIndex < 0) {
          onPreviousMonth();
          setTimeout(() => {
            const newDays = days;
            const targetIndex = Math.max(0, newDays.length + newIndex);
            this.focusedDateIndex.set(targetIndex);
            this.focusDateButton(targetIndex);
          });
          return;
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex + 7;
        if (newIndex >= days.length) {
          onNextMonth();
          setTimeout(() => {
            const overflow = newIndex - days.length;
            this.focusedDateIndex.set(overflow);
            this.focusDateButton(overflow);
          });
          return;
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        onDateClick(day);
        return;

      default:
        return;
    }

    // Update focused date and move focus
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < days.length) {
      this.focusedDateIndex.set(newIndex);
      this.focusDateButton(newIndex);
    }
  }

  // Handle date click with focus management
  handleDateClick(
    day: MonthDay,
    days: MonthDay[],
    onDateSelect: (day: MonthDay) => void,
    onDateDeselect: () => void
  ): void {
    const dayIndex = this.getDayIndex(day, days);

    if (day.isSelected) {
      onDateDeselect();
      setTimeout(() => {
        this.updateFocusedDateToSelected(days);
      });
    } else {
      onDateSelect(day);
      this.focusedDateIndex.set(dayIndex);
      setTimeout(() => {
        this.focusDateButton(dayIndex);
      });
    }
  }

  // Handle month navigation with focus preservation
  handleMonthNavigation(
    direction: 'prev' | 'next',
    currentDayOfMonth: number,
    days: MonthDay[],
    onMonthChange: () => void,
    options?: { preserveTriggerFocus?: boolean }
  ): void {
    onMonthChange();

    setTimeout(() => {
      // preserve next/prev buttons when changing months
      if (options?.preserveTriggerFocus) {
        return;
      }

      const targetDay = days.find(
        (d) => d.dayNumber === currentDayOfMonth && d.isCurrentMonth
      );

      if (targetDay) {
        const newIndex = this.getDayIndex(targetDay, days);
        this.focusedDateIndex.set(newIndex);
        this.focusDateButton(newIndex);
      } else {
        // If day doesn't exist (e.g., Jan 31 -> Feb), use last day of month
        const lastDayIndex =
          days.findIndex(
            (d) =>
              !d.isCurrentMonth && d.date > days[this.focusedDateIndex()].date
          ) - 1;
        const finalIndex = lastDayIndex >= 0 ? lastDayIndex : days.length - 1;
        this.focusedDateIndex.set(finalIndex);
        this.focusDateButton(finalIndex);
      }
    });
  }

  // Focus a specific date button
  focusDateButton(index: number): void {
    setTimeout(() => {
      const buttons = document.querySelectorAll('.calendar-day');
      if (buttons[index]) {
        (buttons[index] as HTMLElement).focus();
      }
    }, 0);
  }
}
