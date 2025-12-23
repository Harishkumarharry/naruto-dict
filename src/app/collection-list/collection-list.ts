import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CharacterService } from '../character.service';

const COLLECTION_META: Record<string, { title: string; desc: string }> = {
  characters: { title: 'Characters', desc: 'Browse all Naruto characters.' },
  clans: { title: 'Clans', desc: 'Browse all Naruto clans.' },
  villages: { title: 'Villages', desc: 'Browse all Naruto villages.' },
  teams: { title: 'Teams', desc: 'Browse all Naruto teams.' },
  'tailed-beasts': { title: 'Tailed Beasts', desc: 'Browse all tailed beasts.' },
  akatsuki: { title: 'Akatsuki', desc: 'Browse all Akatsuki members.' },
  'kekkei-genkai': { title: 'Kekkei Genkai', desc: 'Browse all Kekkei Genkai.' },
  kara: { title: 'Kara', desc: 'Browse all Kara members.' },
};

@Component({
  selector: 'app-collection-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './collection-list.html',
  styleUrls: ['./collection-list.css'],
})
export class CollectionList {
  protected readonly search = signal('');
  private searchDebounceTimer: any = null;

  private route = inject(ActivatedRoute);
  private svc = inject(CharacterService);

  // Signals driven by the route params
  readonly collectionKey = signal<string>('character');
  readonly title = signal<string>('Characters');
  readonly desc = signal<string>('Browse all Naruto characters.');

  protected readonly items = signal<any[]>([]);
  protected readonly loading = signal(false);
  protected readonly hasMore = signal(true);

  private currentPage = 1;
  private perPage = 12;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const key = params.get('collectionKey') ?? 'characters';
      this.collectionKey.set(key);

      const meta = COLLECTION_META[key];

      this.title.set(meta?.title ?? 'Collection');
      this.desc.set(meta?.desc ?? 'Browse all in this collection.');
      this.loadItems(true);
    });
  }

  loadItems(reset = false) {
    if (reset) {
      this.items.set([]);
      this.currentPage = 1;
      this.hasMore.set(true);
    }

    this.loading.set(true);

    this.svc.getCollectionPage(this.collectionKey(), this.currentPage, this.perPage).subscribe({
      next: (list: any) => {
        let arr: any[] = [];
        if (Array.isArray(list)) arr = list;
        else if (list && Array.isArray(list.data)) arr = list.data;
        else if (list && Array.isArray(list.results)) arr = list.results;
        else if (list && Array.isArray(list.items)) arr = list.items;
        else if (list && typeof list === 'object') {
          const maybe = Object.values(list).find((v) => Array.isArray(v));
          if (Array.isArray(maybe)) arr = maybe as any[];
        }

        if (!arr.length) this.hasMore.set(false);

        this.items.set([...this.items(), ...arr]);
        this.loading.set(false);

        if (arr.length < this.perPage) this.hasMore.set(false);

        this.currentPage++;

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.hasMore.set(false);
      },
    });
  }

  protected onSearch(value: string): void {
    this.search.set(value || '');
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.perPage = 12; // reset shown count
      this.loadItems(true);
    }, 400);
  }
}
