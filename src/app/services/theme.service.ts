import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';

  //  track current theme
  currentTheme = signal<Theme>(this.getStoredTheme());

  constructor() {
    // apply theme on init
    this.applyTheme(this.currentTheme());

    // react to theme changes
    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }

  private getStoredTheme(): Theme {
    // check localStorage for user preference
    const stored = localStorage.getItem(this.THEME_KEY) as Theme;
    if (stored) {
      return stored;
    }

    // fall back to browser/system preference
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    return prefersDark ? 'dark' : 'light';
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.currentTheme.set(newTheme);
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  isDarkMode(): boolean {
    return this.currentTheme() === 'dark';
  }
}
