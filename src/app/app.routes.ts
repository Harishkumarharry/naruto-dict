import { Routes } from '@angular/router';
import Home from './home/home';
import CharacterDetail from './character-detail/character-detail';
import ClansDetail from './clans-detail/clans-detail';
import VillagesDetail from './villages-detail/villages-detail';
import TeamsDetail from './teams-detail/teams-detail';
import TailedBeastsDetail from './tailed-beasts-detail/tailed-beasts-detail';
import AkatsukiDetail from './akatsuki-detail/akatsuki-detail';
import KekkkeiGenkaiDetail from './kekkei-genkai-detail/kekkei-genkai-detail';
import KaraDetail from './kara-detail/kara-detail';
import { CollectionList } from './collection-list/collection-list';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'collection/:collectionKey', component: CollectionList},
  { path: 'characters/:id', component: CharacterDetail },
  { path: 'clans/:id', component: ClansDetail },
  { path: 'villages/:id', component: VillagesDetail },
  { path: 'teams/:id', component: TeamsDetail },
  { path: 'tailed-beasts/:id', component: TailedBeastsDetail },
  { path: 'akatsuki/:id', component: AkatsukiDetail },
  { path: 'kekkei-genkai/:id', component: KekkkeiGenkaiDetail },
  { path: 'kara/:id', component: KaraDetail },
];
