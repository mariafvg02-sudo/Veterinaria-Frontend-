import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dev-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dev-role.component.html',
  styleUrls: ['./dev-role.component.scss']
})
export class DevRoleComponent {
  role: string = 'cliente';
  name: string = 'Usuario Prueba';

  constructor(private router: Router) {}

  applyRole() {
    const usuario = { nombre: this.name, correo: `${this.role}@vetcare.local`, rol: this.role };
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('token', 'dev-token');
    alert('Rol aplicado: ' + this.role + '. Navegando...');
    if (this.role === 'administrador') {
      this.router.navigate(['/administrador']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
