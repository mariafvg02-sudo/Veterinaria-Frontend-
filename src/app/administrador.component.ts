import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Core/services/auth.service';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.scss']
})
export class AdministradorComponent {
  userForm: FormGroup;
  activeTab: string = 'users';
  loading = false;
  message: string | null = null;
  editingUserId: number | null = null;
  
  // Datos de ejemplo para la tabla
  usuariosRegistrados = [
    { id: 1, nombre: 'Ana García', correo: 'ana@vetapp.com', rol: 'recepcionista', telefono: '3001112233' },
    { id: 2, nombre: 'Carlos Ruiz', correo: 'carlos@vetapp.com', rol: 'administrador', telefono: '3004445566' },
    { id: 3, nombre: 'Dra. Marta', correo: 'marta@vetapp.com', rol: 'veterinario', telefono: '3007778899' }
  ];

  // Estadísticas rápidas
  stats = [
    { label: 'Total Usuarios', value: '45', icon: 'fa-users' },
    { label: 'Citas Hoy', value: '12', icon: 'fa-calendar-check' },
    { label: 'Mascotas', value: '128', icon: 'fa-paw' },
    { label: 'Ingresos Mes', value: '$2.4M', icon: 'fa-hand-holding-dollar' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: [''],
      rol: ['recepcionista', Validators.required]
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onSubmitUser() {
    if (this.userForm.valid) {
      this.loading = true;
      this.message = null;
      // For a functional admin demo we update the local list immediately.
      const newUser = {
        id: this.editingUserId ? this.editingUserId : (Math.max(0, ...this.usuariosRegistrados.map(u => u.id)) + 1),
        nombre: this.userForm.value.nombre,
        correo: this.userForm.value.email,
        telefono: this.userForm.value.telefono,
        rol: this.userForm.value.rol
      } as any;

      if (this.editingUserId) {
        // Update existing
        const idx = this.usuariosRegistrados.findIndex(u => u.id === this.editingUserId);
        if (idx > -1) {
          this.usuariosRegistrados[idx] = { ...this.usuariosRegistrados[idx], ...newUser };
          this.message = 'Usuario actualizado correctamente';
        }
      } else {
        // Add new
        this.usuariosRegistrados.push(newUser);
        this.message = 'Usuario creado exitosamente (demo local)';
      }

      // reset form
      this.userForm.reset();
      this.userForm.patchValue({ rol: 'recepcionista' });
      this.editingUserId = null;
      this.loading = false;
    }
  }

  onEditUser(user: any) {
    this.editingUserId = user.id;
    this.setActiveTab('create');
    this.userForm.patchValue({
      nombre: user.nombre,
      email: user.correo,
      password: '',
      telefono: user.telefono,
      rol: user.rol
    });
  }

  onDeleteUser(id: number) {
    if (!confirm('¿Eliminar usuario? Esta acción no se puede deshacer.')) return;
    this.usuariosRegistrados = this.usuariosRegistrados.filter(u => u.id !== id);
    this.message = 'Usuario eliminado';
  }

  onCancelEdit() {
    this.editingUserId = null;
    this.userForm.reset();
    this.userForm.patchValue({ rol: 'recepcionista' });
    this.setActiveTab('users');
  }
}
