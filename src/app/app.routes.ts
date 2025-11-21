import { Routes } from '@angular/router';
import Home from './home/home';
import CharacterDetail from './character-detail/character-detail';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'character/:id', component: CharacterDetail },
];
