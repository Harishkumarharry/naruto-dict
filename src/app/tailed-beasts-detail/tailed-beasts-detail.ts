import { Component, inject, signal } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CharacterService } from '../character.service';

@Component({
  selector: 'app-tailed-beasts-detail',
  standalone: true,
  imports: [CommonModule, KeyValuePipe, RouterLink],
  templateUrl: './tailed-beasts-detail.html',
  styleUrls: ['./tailed-beasts-detail.css'],
})
export default class TailedBeastsDetail {
  private route = inject(ActivatedRoute);
  private svc = inject(CharacterService);

  protected readonly item = signal<any | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  asArray(val: any): any[] {
    return Array.isArray(val) ? val : [];
  }
  asObject(val: any): { [key: string]: any } {
    return val && typeof val === 'object' && !Array.isArray(val) ? val : {};
  }

  isArray(val: any): boolean {
    return Array.isArray(val);
  }
  isObject(val: any): boolean {
    return val && typeof val === 'object' && !Array.isArray(val);
  }

  scrollToTop(): void {
    try {
      if (typeof window !== 'undefined' && window.scrollTo) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {}
  }

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Missing tailed beast id');
      this.loading.set(false);
      return;
    }

    this.svc.getCollectionById('tailed-beasts', id).subscribe({
      next: (it) => {
        this.item.set(it ?? null);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(String(err));
        this.loading.set(false);
      },
    });
  }
}
