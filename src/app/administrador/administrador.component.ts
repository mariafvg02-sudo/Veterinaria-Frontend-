import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, Usuario } from '../Core/Service/auth.service';
import { CitaService } from '../Core/Service/cita.service';
import { Cita } from '../Models/cita.model';

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
  currentView: string = 'stats';
  cargando = false;
  cargandoUsuarios = false;
  error: string | null = null;
  exito: string | null = null;
  editingUserId: number | null = null;
  filterText: string = '';

  usuariosRegistrados: Usuario[] = [];
  citas: Cita[] = [];
  cargandoCitas = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private citaService: CitaService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      documentoIdentidad: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['', [Validators.required]],
      rol: ['RECEPCIONISTA', Validators.required]
    });
  }

  ngOnInit(): void {
    this.usuario = this.authService.obtenerUsuarioActual();
    if (!this.usuario) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargandoUsuarios = true;
    this.authService.obtenerTodosLosUsuarios().subscribe({
      next: (usuarios) => {
        this.usuariosRegistrados = usuarios.filter(u => u.rol !== 'CLIENTE');
        this.cargandoUsuarios = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la lista de usuarios.';
        this.cargandoUsuarios = false;
      }
    });
  }

  get statsPersonal() {
    const staff = this.usuariosRegistrados;
    return [
      { label: 'Personal total', value: staff.length, icon: 'fa-users' },
      { label: 'Veterinarios', value: staff.filter(u => u.rol === 'VETERINARIO').length, icon: 'fa-stethoscope' },
      { label: 'Recepcionistas', value: staff.filter(u => u.rol === 'RECEPCIONISTA').length, icon: 'fa-headset' },
      { label: 'Jefes inventario', value: staff.filter(u => u.rol === 'JEFEINVENTARIO').length, icon: 'fa-box-archive' },
    ];
  }

  setView(view: string) {
    this.currentView = view;
    this.error = null;
    this.exito = null;
    if (view === 'citas') this.cargarCitas();
  }

  cargarCitas(): void {
    this.cargandoCitas = true;
    this.citaService.obtenerTodas().subscribe({
      next: (citas) => { 
        // Se ordena por fecha de la más nueva a la más antigua
        this.citas = citas.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        ); 
        this.cargandoCitas = false; 
      },
      error: () => { this.cargandoCitas = false; }
    });
  }

  onSubmitUser() {
    if (!this.editingUserId && !this.userForm.value.password) {
      this.error = 'La contraseña es obligatoria para nuevos usuarios.';
      return;
    }

    if (this.userForm.invalid) return;

    this.cargando = true;
    this.error = null;
    this.exito = null;

    let rolFinal = (this.userForm.value.rol as string).toUpperCase();
    if (rolFinal === 'JEFE_INVENTARIO') rolFinal = 'JEFEINVENTARIO';

    const usuarioData: any = {
      nombre: this.userForm.value.nombre,
      correo: this.userForm.value.email.trim().toLowerCase(),
      telefono: this.userForm.value.telefono,
      documentoIdentidad: Number(this.userForm.value.documentoIdentidad),
      rol: rolFinal
    };

    if (this.userForm.value.password) {
      usuarioData.clave = this.userForm.value.password;
    }

    if (this.editingUserId) {
      this.authService.actualizarUsuario(this.editingUserId, usuarioData).subscribe({
        next: () => {
          this.cargando = false;
          this.exito = 'Usuario actualizado correctamente.';
          this.cargarUsuarios();
          this.finalizarOperacion();
        },
        error: (err) => {
          this.cargando = false;
          this.error = err.error?.mensaje || 'Error al actualizar el usuario.';
        }
      });
    } else {
      this.authService.adminCrearUsuario(usuarioData).subscribe({
        next: () => {
          this.cargando = false;
          this.exito = 'Usuario registrado correctamente.';
          this.cargarUsuarios();
          this.finalizarOperacion();
        },
        error: (err) => {
          this.cargando = false;
          this.error = err.error?.mensaje || 'Error al crear el usuario.';
        }
      });
    }
  }

  private finalizarOperacion() {
    this.editingUserId = null;
    this.restorePasswordValidators();
    this.userForm.reset({ rol: 'RECEPCIONISTA' });
    setTimeout(() => { this.setView('users'); }, 1500);
  }

  private restorePasswordValidators() {
    const ctrl = this.userForm.get('password');
    ctrl?.setValidators([Validators.required, Validators.minLength(6)]);
    ctrl?.updateValueAndValidity();
  }

  onEditUser(user: Usuario): void {
    this.editingUserId = user.id ?? user.userId ?? null;
    const ctrl = this.userForm.get('password');
    ctrl?.clearValidators();
    ctrl?.setValidators([Validators.minLength(6)]);
    ctrl?.updateValueAndValidity();

    this.setView('create');
    this.userForm.patchValue({
      nombre: user.nombre,
      documentoIdentidad: user.documentoIdentidad?.toString() || '',
      email: user.correo,
      password: '',
      telefono: user.telefono,
      rol: (user.rol || '').toUpperCase()
    });
  }

  get filteredUsuarios() {
    const q = (this.filterText || '').trim().toLowerCase();
    if (!q) return this.usuariosRegistrados;
    return this.usuariosRegistrados.filter(u => (
      (u.nombre || '') + ' ' + (u.correo || '') + ' ' + (u.telefono || '') + ' ' + (u.rol || '')
    ).toLowerCase().includes(q));
  }

  onDeleteUser(id: number) {
    if (!confirm('¿Eliminar usuario? Esta acción no se puede deshacer.')) return;
    this.authService.eliminarUsuario(id).subscribe({
      next: () => {
        this.exito = 'Usuario eliminado.';
        this.cargarUsuarios();
      },
      error: () => {
        this.error = 'No se pudo eliminar el usuario.';
      }
    });
  }

  onCancelEdit() {
    this.editingUserId = null;
    this.restorePasswordValidators();
    this.userForm.reset({ rol: 'RECEPCIONISTA' });
    this.setView('users');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
