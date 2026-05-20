import { Routes } from '@angular/router';
import { HomeComponent } from './Home/home.component';
import { VeterinarioComponent } from './Veterinario/veterinario.component';
import { RegisterComponent } from './Register/register.component';
import { LoginComponent } from './Login/login.component';
import { OlvidoClaveComponent } from './olvido-clave/olvido-clave.component';
import { AdministradorComponent } from './administrador/administrador.component';
import { ClienteComponent } from './cliente/cliente.component';
import { clienteGuard } from './cliente/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'veterinario', component: VeterinarioComponent },
  { path: 'cliente', component: ClienteComponent, canActivate: [clienteGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'olvido-clave', component: OlvidoClaveComponent },
  { path: 'administrador', component: AdministradorComponent }
];
