import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/character-list/character-list.component').then(m => m.CharacterListComponent),
  }
];
