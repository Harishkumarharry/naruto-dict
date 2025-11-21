import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CharacterService } from '../character.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

  constructor() {
    this.loadCharacters();
  }

  protected loadCharacters(): void {
    this.loading.set(true);
    this.error.set(null);
    this.svc.getCharacters().subscribe({
      next: (list) => {
        // The service returns the raw endpoint body. Normalize to an array here
        // so the template and filters that expect arrays work safely.
        let arr: any[] = [];
        if (Array.isArray(list)) arr = list;
        else if (list && Array.isArray(list.data)) arr = list.data;
        else if (list && Array.isArray(list.results)) arr = list.results;
        else if (list && Array.isArray(list.items)) arr = list.items;
        else if (list && typeof list === 'object') {
          // fallback: take the first array-valued property if present
          const maybe = Object.values(list).find((v) => Array.isArray(v));
          if (Array.isArray(maybe)) arr = maybe as any[];
        }

        this.characters.set(arr);
        this.loading.set(false);
        console.log('Home.loadCharacters loaded', arr.length, 'characters');
      },
      error: (err) => {
        this.error.set(String(err));
        this.loading.set(false);
        this.characters.set([]);
      },
    });
  }
}
