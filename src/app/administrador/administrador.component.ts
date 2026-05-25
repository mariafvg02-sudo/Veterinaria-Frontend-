import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, Usuario } from '../Core/Service/auth.service';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.scss']
})
export class AdministradorComponent implements OnInit {
  usuario: Usuario | null = null;
  userForm: FormGroup;
  currentView: string = 'stats'; // Controla la vista actual (Dashboard, Tabla, Crear)
  cargando = false;
  error: string | null = null;
  exito: string | null = null;
  editingUserId: number | null = null;
  
  // Datos de ejemplo para la tabla
  usuariosRegistrados = [
    { id: 1, nombre: 'Ana García', correo: 'ana@vetapp.com', rol: 'RECEPCIONISTA', telefono: '3001112233', documentoIdentidad: 1010101 },
    { id: 2, nombre: 'Carlos Ruiz', correo: 'carlos@vetapp.com', rol: 'ADMINISTRADOR', telefono: '3004445566', documentoIdentidad: 2020202 },
    { id: 3, nombre: 'Dra. Marta', correo: 'marta@vetapp.com', rol: 'VETERINARIO', telefono: '3007778899', documentoIdentidad: 3030303 }
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
    private authService: AuthService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      documentoIdentidad: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['', [Validators.required]], // Hecho obligatorio para evitar errores 400/500
      rol: ['RECEPCIONISTA', Validators.required]
    });
  }

  ngOnInit(): void {
    this.usuario = this.authService.obtenerUsuarioActual(); // Obtiene datos del admin logueado
    if (!this.usuario) {
      this.router.navigate(['/login']);
    }
  }

  setView(view: string) {
    this.currentView = view;
    // Limpiamos mensajes al cambiar de pestaña
    this.error = null;
    this.exito = null;
  }

  onSubmitUser() {
    if (this.userForm.valid) {
      this.cargando = true;
      this.error = null;
      this.exito = null;

      // Mapeamos los datos al formato que espera el Backend
      // Se asegura que JEFE_INVENTARIO sea JEFEINVENTARIO para evitar el error 400
      let rolFinal = this.userForm.value.rol.toUpperCase();
      if (rolFinal === 'JEFE_INVENTARIO') rolFinal = 'JEFEINVENTARIO';

      const usuarioData = {
        nombre: this.userForm.value.nombre,
        correo: this.userForm.value.email,
        clave: this.userForm.value.password,
        telefono: this.userForm.value.telefono,
        documentoIdentidad: Number(this.userForm.value.documentoIdentidad),
        direccion: 'Calle Principal #123', // Agregamos un valor por defecto por si el backend lo requiere
        rol: rolFinal
      };

      this.authService.adminCrearUsuario(usuarioData).subscribe({
        next: (response) => {
          this.cargando = false;
          this.exito = 'Usuario registrado correctamente en la base de datos';
          
          // Actualizamos la tabla local con el nuevo usuario que viene del servidor
          if (response.usuario) {
            this.usuariosRegistrados.push({
              id: response.usuario.id || 0,
              nombre: response.usuario.nombre || '',
              correo: response.usuario.correo,
              rol: response.usuario.rol?.toUpperCase() || 'RECEPCIONISTA',
              telefono: response.usuario.telefono || '',
              documentoIdentidad: response.usuario.documentoIdentidad
            });
          }
          
          this.userForm.reset({ rol: 'RECEPCIONISTA' });
          this.setView('users');
        },
        error: (err) => {
          this.cargando = false;
          this.error = err.error?.mensaje || err.error?.message || 'Error 400: Datos inválidos. Revisa el formato del documento o correo.';
          console.error('Error creando usuario:', err);
        }
      });
    }
  }

  onEditUser(user: any) {
    this.editingUserId = user.id;
    this.setView('create');
    this.userForm.patchValue({
      nombre: user.nombre,
      documentoIdentidad: user.documentoIdentidad ? user.documentoIdentidad.toString() : '',
      email: user.correo,
      password: '',
      telefono: user.telefono,
      rol: (user.rol || '').toUpperCase()
    });
  }

  onDeleteUser(id: number) {
    if (!confirm('¿Eliminar usuario? Esta acción no se puede deshacer.')) return;
    this.usuariosRegistrados = this.usuariosRegistrados.filter(u => u.id !== id);
    this.exito = 'Usuario eliminado';
  }

  onCancelEdit() {
    this.editingUserId = null;
    this.userForm.reset({ rol: 'RECEPCIONISTA' });
    this.setView('users');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
