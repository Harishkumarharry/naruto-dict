import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('naruto-dict');

  protected readonly dark = signal<boolean>(false);

  constructor() {
    // initialize from localStorage or system preference
    try {
      const saved = localStorage.getItem('naruto-dark');
      if (saved !== null) {
        this.dark.set(saved === 'true');
      } else if (typeof window !== 'undefined' && window.matchMedia) {
        this.dark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    } catch (e) {
      // ignore
    }

    this.applyTheme(this.dark());
  }

  toggleDark(): void {
    this.dark.update((v) => {
      const next = !v;
      try {
        localStorage.setItem('naruto-dark', String(next));
      } catch (e) {
        // ignore
      }
      this.applyTheme(next);
      return next;
    });
  }

  private applyTheme(enabled: boolean) {
    try {
      const el = typeof document !== 'undefined' ? document.documentElement : null;
      if (el) {
        el.classList.toggle('dark', enabled);
      }
    } catch (e) {
      // ignore
    }
  }

  // App is a lightweight shell; page logic lives in routed components (Home)
}
