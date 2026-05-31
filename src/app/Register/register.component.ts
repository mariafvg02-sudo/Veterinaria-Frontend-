import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../Core/Service/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // Agregamos solo el documentoIdentidad (necesario por el Long de Java), removimos dirección
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      documentoIdentidad: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], // Solo números
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['', [Validators.required]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.error = null;
    this.exito = null;

    // Estructuramos el objeto idéntico a tu clase User.java
    const payload = {
      nombre: this.registerForm.value.nombre,
      correo: this.registerForm.value.email.trim().toLowerCase(),
      clave: this.registerForm.value.password,
      telefono: this.registerForm.value.telefono,
      documentoIdentidad: Number(this.registerForm.value.documentoIdentidad), // Mapeado a Long
      direccion: 'N/A', // Evita que el backend rechace el registro por una dirección vacía
      rol: 'CLIENTE' // Ajustado a tu Enum en mayúsculas
    };

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.cargando = false;

        if (response.mensaje?.toLowerCase().includes('jdbc') || response.mensaje?.toLowerCase().includes('exception')) {
          this.error = response.mensaje || 'Error interno del servidor al registrar.';
          return;
        }

        this.exito = '¡Registro exitoso! Redirigiendo al inicio de sesión...';
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.cargando = false;
        // Captura si la cédula o correo están duplicados en la base de datos
        this.error = err.error?.mensaje || 'Error al registrarse. Verifica que el documento o correo no estén registrados.';
        console.error('Error de registro:', err);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/home']);
  }
}