import { Component, DOCUMENT, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLinkActive, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLinkActive, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Naruto Dictionary');

  isDark = signal(false);

  constructor(@Inject(DOCUMENT) private document: Document) {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initalDark = saved === 'dark' || (!saved && prefersDark);
    this.setDark(initalDark, false);
  }

  toggleTheme() {
    this.setDark(!this.isDark());
  }

  private setDark(isDark: boolean, persist = true) {
    this.isDark.set(isDark);

    const classList = this.document.documentElement.classList;

    if(isDark) {
      classList.add('dark');
      if(persist) localStorage.setItem('theme','dark');
    } else {
      classList.remove('dark');
      if(persist) localStorage.setItem('theme', 'light');
    }
  }
}
