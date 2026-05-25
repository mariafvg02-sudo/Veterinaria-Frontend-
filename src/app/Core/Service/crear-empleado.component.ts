import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../Core/Service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-empleado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-empleado.component.html'
})
export class CrearEmpleadoComponent {
  empleadoForm: FormGroup;
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

  // Roles disponibles para el administrador
  rolesDisponibles = [
    { label: 'Veterinario', value: 'VETERINARIO' },
    { label: 'Recepcionista', value: 'RECEPCIONISTA' },
    { label: 'Jefe de Inventario', value: 'JEFEINVENTARIO' },
    { label: 'Administrador', value: 'ADMINISTRADOR' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.empleadoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      documentoIdentidad: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      correo: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['', [Validators.required]],
      rol: ['', [Validators.required]] // Campo obligatorio para el admin
    });
  }

  onSubmit(): void {
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.error = null;
    this.exito = null;

    // Estructura idéntica a la esperada por el Backend (igual que Postman)
    const payload = {
      nombre: this.empleadoForm.value.nombre,
      correo: this.empleadoForm.value.correo,
      clave: this.empleadoForm.value.clave,
      telefono: this.empleadoForm.value.telefono,
      documentoIdentidad: Number(this.empleadoForm.value.documentoIdentidad),
      direccion: '', // Opcional o vacío
      rol: this.empleadoForm.value.rol
    };

    this.authService.adminCrearUsuario(payload).subscribe({
      next: (response) => {
        this.cargando = false;
        this.exito = `Cuenta de ${payload.rol} creada exitosamente para ${payload.nombre}`;
        this.empleadoForm.reset();
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.mensaje || 'Error al crear la cuenta. Verifica los datos.';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/administrador']);
  }
}