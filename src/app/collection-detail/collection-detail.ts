import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgIf, NgForOf, KeyValuePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CharacterService } from '../character.service';

@Component({
  selector: 'app-collection-detail',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, KeyValuePipe, RouterLink],
  templateUrl: './collection-detail.html',
  styleUrls: ['./collection-detail.css'],
})
export default class CollectionDetail {
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
    // derive collection name either from route data or from path
    const collectionFromData = this.route.snapshot.data?.['collection'];
    let collection = collectionFromData;
    if (!collection) {
      // fallback: take first url segment as collection name
      const seg = this.route.snapshot.url && this.route.snapshot.url[0];
      if (seg && seg.path) collection = seg.path;
    }

    if (!id || !collection) {
      this.error.set('Missing collection or id');
      this.loading.set(false);
      return;
    }

    this.svc.getCollectionById(collection, id).subscribe({
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
