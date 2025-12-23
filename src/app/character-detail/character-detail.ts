import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgForOf, KeyValuePipe, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CharacterService } from '../character.service';

@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [CommonModule, KeyValuePipe],
  templateUrl: './character-detail.html',
  styleUrls: ['./character-detail.css'],
})
export default class CharacterDetail {
  // Helper methods for template type safety
  asArray(val: any): any[] {
    return Array.isArray(val) ? val : [];
  }

  asObject(val: any): { [key: string]: any } {
    return val && typeof val === 'object' && !Array.isArray(val) ? val : {};
  }
  private route = inject(ActivatedRoute);
  private svc = inject(CharacterService);

  protected readonly character = signal<any | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  

  isArray(val: any): boolean {
    return Array.isArray(val);
  }

  isObject(val: any): boolean {
    return val && typeof val === 'object' && !Array.isArray(val);
  }

  scrollToTop(): void {
    // Smooth scroll to top if running in browser
    try {
      if (typeof window !== 'undefined' && window.scrollTo) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      // ignore in non-browser environments
    }
  }

  constructor(private location: Location) {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Missing character id');
      this.loading.set(false);
      return;
    }

    // try to find in cache first
    const found = this.svc.findCharacterById(id);
    if (found) {
      this.character.set(found);
      this.loading.set(false);
      return;
    }

    // fallback: call `/characters/:id` to fetch a more descriptive single item
    this.svc.getCharacterById(id).subscribe({
      next: (item) => {
        this.character.set(item ?? null);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(String(err));
        this.loading.set(false);
      },
    });
  }

  goBack() {
    this.location.back();
  }
}
