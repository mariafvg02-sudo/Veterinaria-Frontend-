import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { VeterinarioComponent } from './Veterinario/veterinario.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'veterinario', component: VeterinarioComponent }
];
