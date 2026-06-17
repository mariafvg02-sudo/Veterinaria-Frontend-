import { Routes } from '@angular/router';
import { adminGuard } from './Core/Service/Guards/admin.guard';
import { clienteGuard } from './Core/Service/Guards/cliente.guard';
import { recepcionistaGuard } from './Core/Service/Guards/recepcionista.guard';
import { jefeInventarioGuard } from './Core/Service/Guards/jefe-inventario.guard';
import { veterinarioGuard } from './Core/Service/Guards/veterinario.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  // --- RUTAS PÚBLICAS ---
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
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },

  // --- RUTAS PROTEGIDAS POR ROL ---
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
    loadComponent: () => import('./recepcionista/recepcionista.component').then(m => m.RecepcionistaComponent),
    canActivate: [recepcionistaGuard]
  },
  {
    path: 'jefe-inventario',
    loadComponent: () => import('./jefe-inventario/jefe-inventario.component').then(m => m.JefeInventarioComponent),
    canActivate: [jefeInventarioGuard]
  },
  {
    path: 'veterinario',
    loadComponent: () => import('./Veterinario/veterinario.component').then(m => m.VeterinarioComponent),
    canActivate: [veterinarioGuard]
  },
  {
    path: 'veterinario/cita/:id',
    loadComponent: () => import('./Veterinario/cita-detalle/cita-detalle.component').then(m => m.CitaDetalleComponent),
    canActivate: [veterinarioGuard]
  }
  ,

  // --- REDIRECCIONES Y COMODÍN ---
  {
    path: 'inventario',
    redirectTo: 'jefe-inventario',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];