import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-collection-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './collection-section.html',
  styleUrls: ['./collection-section.css'],
})
export class CollectionSectionComponent {
  @Input() title: string = '';
  @Input() desc: string = '';
  @Input() items: any[] = [];
  @Input() loading: boolean = false;
  @Input() hasMore: boolean = false;
  @Input() onShowMore: (() => void) | null = null;
  @Input() collectionKey: string | null = null;

  objectKeys(obj: any): string[] {
    return obj && typeof obj === 'object' ? Object.keys(obj) : [];
  }
}
