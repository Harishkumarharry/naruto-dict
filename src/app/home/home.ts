import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CharacterService } from '../character.service';
import { CollectionSectionComponent } from '../collection-section/collection-section';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CollectionSectionComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export default class Home {
  protected readonly characters = signal<any[]>([]);
  protected readonly search = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    const applyFilter = (list: any[]) => {
      if (!q) return list.slice();
      return list.filter((c) => {
        const name = (c.name || c.title || '').toLowerCase();
        const alias = (c.alias || c.nickname || '').toLowerCase();
        return name.includes(q) || alias.includes(q);
      });
    };

    // return filtered results directly; do not add fallback items or modify ids
    return applyFilter(this.characters());
  });

  private svc = inject(CharacterService);

  // pagination and UI state
  protected readonly loadingMore = signal(false);
  protected readonly hasMore = signal(true);
  private collected: any[] = [];
  private currentPage = 0;
  private perPage = 5; // request 5 items per page by default
  private initialMaxPages = 5; // look at up to 5 pages on initial load
  private displayedCount = 12; // show 12 initially
  private searchDebounceTimer: any = null;

  // additional collections to show on the homepage
  protected readonly sections: Array<{
    key: string;
    title: string;
    desc: string;
    items: any; // signal
    loading: any;
    hasMore: any;
  }> = [
    // {
    //   key: 'characters',
    //   title: 'Characters',
    //   desc: 'Access details about various characters within the Naruto world.',
    //   items: signal<any[]>([]),
    //   loading: signal(false),
    //   hasMore: signal(true),
    // },
    {
      key: 'clans',
      title: 'Clans',
      desc: 'Access details about various clans within the Naruto world.',
      items: signal<any[]>([]),
      loading: signal(false),
      hasMore: signal(true),
    },
    {
      key: 'villages',
      title: 'Villages',
      desc: 'Fetch information about hidden villages in the Naruto universe.',
      items: signal<any[]>([]),
      loading: signal(false),
      hasMore: signal(true),
    },
    {
      key: 'teams',
      title: 'Teams',
      desc: 'Explore ninja teams and their dynamic compositions.',
      items: signal<any[]>([]),
      loading: signal(false),
      hasMore: signal(true),
    },
    {
      key: 'tailed-beasts',
      title: 'Tailed Beasts',
      desc: 'Learn about the powerful tailed beasts and their significance.',
      items: signal<any[]>([]),
      loading: signal(false),
      hasMore: signal(true),
    },
    {
      key: 'akatsuki',
      title: 'Akatsuki',
      desc: 'Uncover the enigmatic organization known as Akatsuki.',
      items: signal<any[]>([]),
      loading: signal(false),
      hasMore: signal(true),
    },
    {
      key: 'kekkei-genkai',
      title: 'Kekkei-genkai',
      desc: 'Discover the secrets of Kekkei-genkai and their unique abilities.',
      items: signal<any[]>([]),
      loading: signal(false),
      hasMore: signal(true),
    },
    {
      key: 'kara',
      title: 'Kara',
      desc: 'Dive into the shadows with information about the organization Kara.',
      items: signal<any[]>([]),
      loading: signal(false),
      hasMore: signal(true),
    },
  ];

  constructor() {
    this.loadCharacters(true);
    // kick off collection loads in parallel
    for (const sec of this.sections) {
      this.loadCollection(sec, true);
    }
  }

  getShowMore(section: any) {
    return () => this.loadCollection(section, false);
  }

  async loadCollection(section: any, reset = true) {
    if (reset) {
      section.items.set([]);
      section.loading.set(true);
      section.hasMore.set(true);
    }

    const collected: any[] = [];
    const maxPages = 5;
    const perPage = 5;

    try {
      for (let p = 1; p <= maxPages && collected.length < 12; p++) {
        // eslint-disable-next-line no-await-in-loop
        const list: any = await this.svc.getCollectionPage(section.key, p, perPage).toPromise();
        if (!list) break;

        let arr: any[] = [];
        if (Array.isArray(list)) arr = list;
        else if (list && Array.isArray(list.data)) arr = list.data;
        else if (list && Array.isArray(list.results)) arr = list.results;
        else if (list && Array.isArray(list.items)) arr = list.items;
        else if (list && typeof list === 'object') {
          const maybe = Object.values(list).find((v) => Array.isArray(v));
          if (Array.isArray(maybe)) arr = maybe as any[];
        }

        if (!arr || !arr.length) break;

        collected.push(...arr);
      }

      section.items.set(collected.slice(0, 12));
      if (collected.length < 12) section.hasMore.set(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('loadCollection error', section.key, err);
      section.items.set([]);
      section.hasMore.set(false);
    } finally {
      section.loading.set(false);
    }
  }

  protected loadCharacters(reset = true): void {
    if (reset) {
      this.collected = [];
      this.currentPage = 0;
      this.hasMore.set(true);
      this.characters.set([]);
    }

    this.loading.set(true);
    this.error.set(null);

    const maxPages = this.initialMaxPages;
    const perPage = this.perPage;
    const targetCount = this.displayedCount;

    const fetchPage = (page: number) =>
      this.svc.getCharactersPage(page, perPage, this.search() as string).toPromise();

    (async () => {
      try {
        for (
          let p = this.currentPage + 1;
          p <= maxPages && this.collected.length < targetCount;
          p++
        ) {
          // eslint-disable-next-line no-await-in-loop
          const list: any = await fetchPage(p);
          if (!list) {
            this.hasMore.set(false);
            break;
          }

          let arr: any[] = [];
          if (Array.isArray(list)) arr = list;
          else if (list && Array.isArray(list.data)) arr = list.data;
          else if (list && Array.isArray(list.results)) arr = list.results;
          else if (list && Array.isArray(list.items)) arr = list.items;
          else if (list && typeof list === 'object') {
            const maybe = Object.values(list).find((v) => Array.isArray(v));
            if (Array.isArray(maybe)) arr = maybe as any[];
          }

          if (!arr || !arr.length) {
            this.hasMore.set(false);
            break;
          }

          this.collected.push(...arr);
          this.currentPage = p;
        }

        this.characters.set(this.collected.slice(0, this.displayedCount));

        if (this.collected.length < this.displayedCount && this.currentPage >= maxPages) {
          this.hasMore.set(false);
        }
      } catch (err) {
        this.error.set(String(err));
        this.collected = [];
        this.characters.set([]);
      } finally {
        this.loading.set(false);
      }
    })();
  }

  protected onSearch(value: string): void {
    this.search.set(value || '');
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.displayedCount = 12; // reset shown count
      this.loadCharacters(true);
    }, 400);
  }

  protected async showMore(): Promise<void> {
    if (!this.hasMore() || this.loadingMore()) return;
    this.loadingMore.set(true);

    const nextDisplay = this.displayedCount + 12;
    try {
      while (this.collected.length < nextDisplay && this.hasMore()) {
        const nextPage = this.currentPage + 1;
        const list: any = await this.svc
          .getCharactersPage(nextPage, this.perPage, this.search() as string)
          .toPromise();
        if (!list) {
          this.hasMore.set(false);
          break;
        }

        let arr: any[] = [];
        if (Array.isArray(list)) arr = list;
        else if (list && Array.isArray(list.data)) arr = list.data;
        else if (list && Array.isArray(list.results)) arr = list.results;
        else if (list && Array.isArray(list.items)) arr = list.items;
        else if (list && typeof list === 'object') {
          const maybe = Object.values(list).find((v) => Array.isArray(v));
          if (Array.isArray(maybe)) arr = maybe as any[];
        }

        if (!arr || !arr.length) {
          this.hasMore.set(false);
          break;
        }

        this.collected.push(...arr);
        this.currentPage = nextPage;
      }

      this.displayedCount = nextDisplay;
      this.characters.set(this.collected.slice(0, this.displayedCount));
    } catch (err) {
      this.error.set(String(err));
    } finally {
      this.loadingMore.set(false);
    }
  }
}
