import { Routes } from '@angular/router';
import { adminGuard } from './admin.guard';
import { clienteGuard } from './cliente/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./Login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./Register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'olvido-clave',
    loadComponent: () => import('./olvido-clave/olvido-clave.component').then(m => m.OlvidoClaveComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./Home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'administrador',
    loadComponent: () => import('./administrador/administrador.component').then(m => m.AdministradorComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'cliente',
    loadComponent: () => import('./cliente/cliente.component').then(m => m.ClienteComponent),
    canActivate: [clienteGuard]
  },
  {
    path: 'recepcionista',
    loadComponent: () => import('./recepcionista/recepcionista.component').then(m => m.RecepcionistaComponent)
  },
  {
    path: 'jefe-inventario',
    loadComponent: () => import('./jefe-inventario/jefe-inventario.component').then(m => m.JefeInventarioComponent)
  },
  {
    path: 'veterinario',
    loadComponent: () => import('./Veterinario/veterinario.component').then(m => m.VeterinarioComponent)
  }
];